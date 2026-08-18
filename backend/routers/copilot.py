import json
import asyncio
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import logging
from services.agri_copilot_service import (
    detect_language,
    classify_domain,
    generate_response,
    build_gemini_system_prompt,
    LanguageInfo,
    DomainResult,
    ChatMessage,
    CopilotResponse,
    OFF_TOPIC_REFUSALS,
    DEFAULT_AGRI_SUGGESTIONS
)
from services.gemini_client import stream_gemini_chat, is_gemini_configured

logger = logging.getLogger("agripulse.copilot_router")
router = APIRouter(prefix="/api/copilot", tags=["Multilingual Agri Copilot"])

# ============================================================================
# REQUEST SCHEMAS
# ============================================================================

class CopilotQueryRequest(BaseModel):
    query: str = Field(..., description="User voice transcript or typed text in any Indian script or English")
    language: Optional[str] = Field("auto", description="Optional manual override code e.g. hi, mr, pa, or auto")
    context_crop: Optional[str] = Field(None, description="Active crop context from farm (e.g. wheat, mustard)")
    user_id: Optional[str] = Field("farmer_default", description="User identifier for session logging")
    location: Optional[str] = Field("Karnal, Haryana", description="Mandi district or farm location")
    history: Optional[List[ChatMessage]] = Field(default_factory=list, description="Prior conversation turns for multi-turn context")
    app_context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Live user/farm telemetry (weather, spray index, NDVI, soil, watchlist)")


# ============================================================================
# 1. STANDARD MULTI-TURN COPILOT QUERY ENDPOINT
# ============================================================================

@router.post("/query", response_model=CopilotResponse)
async def query_agri_copilot(req: CopilotQueryRequest):
    """
    Multilingual, Domain-Restricted Agri Copilot with Multi-Turn Memory & App Context:
    1. Language & Script Detection (Auto-detects Devanagari, Gurmukhi, Telugu, Tamil, Kannada, Gujarati, Bengali, Malayalam, Odia, or Hinglish).
    2. Multi-Turn Domain Classification (Evaluates latest message in context of history to allow natural follow-ups while blocking off-topic drift).
    3. Context-Injected Response Generation (Injects farm location, registered crops, live weather/spray score, NDVI, soil, and watchlist).
    """
    clean_query = req.query.strip()
    if not clean_query:
        lang_info = detect_language(clean_query, req.language)
        domain_res = classify_domain(clean_query, lang_info, req.history)
        return CopilotResponse(
            query=req.query,
            language=lang_info,
            domain=domain_res,
            response_text=domain_res.refusal_message or OFF_TOPIC_REFUSALS["en"],
            action_title="खाली प्रश्न • Empty Query",
            action_details="Please ask any farming, crop, fertilizer, weather, or mandi rate question.",
            key_stats=[],
            suggested_followups=DEFAULT_AGRI_SUGGESTIONS.get(lang_info.code, DEFAULT_AGRI_SUGGESTIONS["en"]),
            audio_tts_text=domain_res.refusal_message
        )

    # Step 1: Detect Language
    lang_info = detect_language(clean_query, req.language)
    logger.info(f"Copilot Language Detected: {lang_info.code} ({lang_info.name}) [Script: {lang_info.script}, Romanized: {lang_info.is_romanized}]")

    # Step 2: Domain Classification taking multi-turn history into account
    domain_result = classify_domain(clean_query, lang_info, req.history)
    logger.info(f"Copilot Domain Classification: is_agri={domain_result.is_agri}, category={domain_result.detected_category}")

    # Step 3: Combine App Context
    full_context = dict(req.app_context or {})
    if req.context_crop and "context_crop" not in full_context:
        full_context["context_crop"] = req.context_crop
    if req.location and "location" not in full_context:
        full_context["location"] = req.location

    # Step 4: Generate Multi-Turn Localized Response
    response = generate_response(
        query=clean_query,
        lang_info=lang_info,
        app_context=full_context,
        history=req.history
    )

    return response


# ============================================================================
# 2. STREAMING TOKEN-BY-TOKEN ENDPOINT (SERVER-SENT EVENTS)
# ============================================================================

@router.post("/stream")
async def stream_agri_copilot(req: CopilotQueryRequest):
    """
    Streams tokens in real-time using Server-Sent Events (SSE).
    Provides responsive, fluid Gemini-quality conversational typing feel.
    """
    clean_query = req.query.strip()
    lang_info = detect_language(clean_query, req.language)
    domain_result = classify_domain(clean_query, lang_info, req.history)

    full_context = dict(req.app_context or {})
    if req.context_crop:
        full_context["context_crop"] = req.context_crop
    if req.location:
        full_context["location"] = req.location

    async def sse_event_generator():
        # Check domain security first
        if not domain_result.is_agri:
            refusal = domain_result.refusal_message or OFF_TOPIC_REFUSALS.get(lang_info.code, OFF_TOPIC_REFUSALS["en"])
            yield f"data: {json.dumps({'token': refusal, 'is_final': True, 'action_title': 'Farming Scope Only', 'is_agri': False})}\n\n"
            return

        # 1. If Gemini configured, stream live from Gemini API
        if is_gemini_configured():
            system_prompt = build_gemini_system_prompt(lang_info, full_context)
            contents = []
            if req.history:
                for msg in req.history[-16:]:
                    role = "user" if msg.role in ["user", "human"] else "model"
                    contents.append({"role": role, "parts": [{"text": msg.text}]})
            contents.append({"role": "user", "parts": [{"text": clean_query}]})

            for token in stream_gemini_chat(contents, system_prompt, temperature=0.3):
                yield f"data: {json.dumps({'token': token, 'is_final': False})}\n\n"
                await asyncio.sleep(0.01)

            yield f"data: {json.dumps({'is_final': True, 'lang': lang_info.code})}\n\n"
            return

        # 2. Resilient Fallback Streaming (Chunks generated response smoothly)
        fallback_res = generate_response(clean_query, lang_info, full_context, req.history)
        words = fallback_res.response_text.split(" ")
        for i, word in enumerate(words):
            chunk = word + (" " if i < len(words) - 1 else "")
            yield f"data: {json.dumps({'token': chunk, 'is_final': False})}\n\n"
            await asyncio.sleep(0.02)

        final_payload = {
            "is_final": True,
            "action_title": fallback_res.action_title,
            "action_details": fallback_res.action_details,
            "key_stats": fallback_res.key_stats,
            "suggested_followups": fallback_res.suggested_followups,
            "lang": lang_info.code
        }
        yield f"data: {json.dumps(final_payload)}\n\n"

    return StreamingResponse(sse_event_generator(), media_type="text/event-stream")


# ============================================================================
# 3. METADATA & SUPPORTED LANGUAGES
# ============================================================================

@router.get("/languages")
async def get_supported_languages():
    """
    Returns list of supported Indian languages with native names and script information.
    """
    return {
        "supported_languages": [
            {"code": "auto", "name": "🌐 Auto-Detect Language (बोलें या लिखें)", "script": "Any", "is_default": True},
            {"code": "hi", "name": "हिन्दी (Hindi)", "script": "Devanagari"},
            {"code": "mr", "name": "मराठी (Marathi)", "script": "Devanagari"},
            {"code": "pa", "name": "ਪੰਜਾਬੀ (Punjabi)", "script": "Gurmukhi"},
            {"code": "gu", "name": "ગુજરાતી (Gujarati)", "script": "Gujarati"},
            {"code": "te", "name": "తెలుగు (Telugu)", "script": "Telugu"},
            {"code": "ta", "name": "தமிழ் (Tamil)", "script": "Tamil"},
            {"code": "kn", "name": "ಕನ್ನಡ (Kannada)", "script": "Kannada"},
            {"code": "bn", "name": "বাংলা (Bengali)", "script": "Bengali"},
            {"code": "ml", "name": "മലയാളം (Malayalam)", "script": "Malayalam"},
            {"code": "or", "name": "ଓଡ଼ିଆ (Odia)", "script": "Odia"},
            {"code": "hi-Latn", "name": "Hinglish (Romanized Hindi)", "script": "Latin"},
            {"code": "en", "name": "English (Indian)", "script": "Latin"}
        ]
    }
