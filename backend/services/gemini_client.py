import os
import json
import logging
import urllib.request
import urllib.error
from typing import Dict, Any, Optional, List, Generator
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

logger = logging.getLogger("agripulse.gemini")

GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()

def is_gemini_configured() -> bool:
    """Checks if a valid Gemini API key is configured."""
    return bool(GEMINI_API_KEY and not GEMINI_API_KEY.startswith("mock_") and len(GEMINI_API_KEY) > 10)

def verify_gemini_startup():
    """Startup verification called on server boot."""
    if not is_gemini_configured():
        logger.warning(
            "⚠️ GEMINI_API_KEY is not configured or is empty in backend/.env. "
            "The platform will run in resilient local agronomy mode. "
            "To enable live Gemini AI, add GEMINI_API_KEY=your_key to your backend/.env file."
        )
    else:
        logger.info("✅ Gemini API Key detected and initialized for Copilot pipeline.")

def call_gemini_chat(
    contents: List[Dict[str, Any]],
    system_instruction: str,
    temperature: float = 0.3,
    response_mime_type: str = "application/json",
    timeout_secs: float = 8.0
) -> Optional[Dict[str, Any]]:
    """
    Executes a multi-turn Google Gemini 2.5 Flash API call.
    Contents should be a list of dicts with role ('user' | 'model') and parts.
    """
    if not is_gemini_configured():
        return None

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
        
        payload = {
            "contents": contents,
            "systemInstruction": {
                "parts": [
                    {"text": system_instruction}
                ]
            },
            "generationConfig": {
                "temperature": temperature,
                "responseMimeType": response_mime_type
            }
        }

        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data_bytes,
            headers={"Content-Type": "application/json"}
        )

        with urllib.request.urlopen(req, timeout=timeout_secs) as resp:
            raw_response = resp.read().decode("utf-8")
            result = json.loads(raw_response)
            candidate = result.get("candidates", [{}])[0]
            part_text = candidate.get("content", {}).get("parts", [{}])[0].get("text", "")
            if part_text:
                if response_mime_type == "application/json":
                    return json.loads(part_text)
                return {"response_text": part_text}
    except Exception as e:
        logger.warning(f"Gemini API multi-turn request note: {e}")
        return None

    return None

def stream_gemini_chat(
    contents: List[Dict[str, Any]],
    system_instruction: str,
    temperature: float = 0.3
) -> Generator[str, None, None]:
    """
    Streams tokens from Gemini 2.5 Flash chunk-by-chunk using Server-Sent Events (SSE).
    """
    if not is_gemini_configured():
        yield json.dumps({"error": "Gemini API key not configured"})
        return

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key={GEMINI_API_KEY}"
        payload = {
            "contents": contents,
            "systemInstruction": {
                "parts": [
                    {"text": system_instruction}
                ]
            },
            "generationConfig": {
                "temperature": temperature
            }
        }

        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data_bytes,
            headers={"Content-Type": "application/json"}
        )

        with urllib.request.urlopen(req, timeout=15.0) as resp:
            for line in resp:
                decoded_line = line.decode("utf-8").strip()
                if decoded_line.startswith("data: "):
                    data_str = decoded_line[6:]
                    try:
                        chunk_json = json.loads(data_str)
                        candidates = chunk_json.get("candidates", [])
                        if candidates:
                            parts = candidates[0].get("content", {}).get("parts", [])
                            for part in parts:
                                text_token = part.get("text", "")
                                if text_token:
                                    yield text_token
                    except Exception:
                        continue
    except Exception as e:
        logger.warning(f"Gemini streaming error: {e}")
        yield f" [Error: {str(e)}]"

def call_gemini(
    prompt: str,
    system_instruction: str,
    temperature: float = 0.2,
    response_mime_type: str = "application/json",
    timeout_secs: float = 5.0
) -> Optional[Dict[str, Any]]:
    """Backward compatible single-turn caller."""
    contents = [
        {
            "role": "user",
            "parts": [{"text": prompt}]
        }
    ]
    return call_gemini_chat(
        contents=contents,
        system_instruction=system_instruction,
        temperature=temperature,
        response_mime_type=response_mime_type,
        timeout_secs=timeout_secs
    )
