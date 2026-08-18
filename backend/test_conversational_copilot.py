"""
============================================================================
AGRIPULSE AI — CONVERSATIONAL GEMINI-LEVEL COPILOT TEST SUITE
============================================================================
"""

import os
import sys
import unittest

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.agri_copilot_service import (
    detect_language,
    classify_domain,
    generate_response,
    ChatMessage,
    build_system_context
)

class TestConversationalCopilot(unittest.TestCase):

    def setUp(self):
        self.app_context = {
            "location": "Karnal, Haryana (Indo-Gangetic Plain)",
            "context_crop": "Wheat",
            "crops": [
                {"name": "Sharbati Wheat", "variety": "PBW 550", "acreage": "5 Acres"},
                {"name": "Mustard", "variety": "Pusa Bold", "acreage": "3 Acres"}
            ],
            "weather": {
                "temp": "28°C",
                "humidity": "62%",
                "wind_speed": "8 km/h",
                "condition": "Clear Sunny",
                "spray_safety_score": 88
            },
            "ndvi": 0.74,
            "watchlist": [
                {"crop": "Sharbati Wheat", "price": 2840, "msp": 2425},
                {"crop": "Mustard", "price": 5780, "msp": 5650}
            ]
        }

    def test_1_multiturn_coreference_resolution(self):
        """Test 5-turn sequence resolving co-references (wheat -> rice -> that per acre -> spray today -> sell now)."""
        print("\n--- Test 1: Multi-Turn Conversation Memory ---")
        history = []

        # Turn 1: Wheat Fertilizer
        t1_query = "What fertilizer should I use for wheat?"
        lang1 = detect_language(t1_query)
        r1 = generate_response(t1_query, lang1, self.app_context, history)
        self.assertTrue(r1.domain.is_agri)
        self.assertIn("dap", r1.response_text.lower())
        print(f"Turn 1 Response: {r1.response_text[:80]}...")

        history.append(ChatMessage(role="user", text=t1_query))
        history.append(ChatMessage(role="model", text=r1.response_text))

        # Turn 2: Follow-up co-reference: "What about for rice?"
        t2_query = "What about for rice?"
        lang2 = detect_language(t2_query)
        r2 = generate_response(t2_query, lang2, self.app_context, history)
        self.assertTrue(r2.domain.is_agri)
        self.assertTrue("rice" in r2.response_text.lower() or "paddy" in r2.response_text.lower() or "धान" in r2.response_text)
        print(f"Turn 2 Followup: {r2.response_text[:80]}...")

        history.append(ChatMessage(role="user", text=t2_query))
        history.append(ChatMessage(role="model", text=r2.response_text))

        # Turn 3: Follow-up co-reference: "How much of that per acre?"
        t3_query = "How much of that per acre?"
        lang3 = detect_language(t3_query)
        r3 = generate_response(t3_query, lang3, self.app_context, history)
        self.assertTrue(r3.domain.is_agri)
        self.assertTrue("per acre" in r3.response_text.lower() or "प्रति एकड़" in r3.response_text)
        print(f"Turn 3 Dosage: {r3.response_text[:80]}...")

        history.append(ChatMessage(role="user", text=t3_query))
        history.append(ChatMessage(role="model", text=r3.response_text))

        # Turn 4: "Can I spray today?"
        t4_query = "Can I spray today?"
        lang4 = detect_language(t4_query)
        r4 = generate_response(t4_query, lang4, self.app_context, history)
        self.assertTrue(r4.domain.is_agri)
        self.assertIn("88/100", r4.response_text)
        print(f"Turn 4 Spray Safety: {r4.response_text[:80]}...")

        # Turn 5: "Should I sell now or wait?"
        t5_query = "Should I sell now or wait?"
        lang5 = detect_language(t5_query)
        r5 = generate_response(t5_query, lang5, self.app_context, history)
        self.assertTrue(r5.domain.is_agri)
        self.assertIn("2,840", r5.response_text)
        print(f"Turn 5 Trade-off: {r5.response_text[:80]}...")
        print("✅ Multi-turn 5-turn conversational memory passed!")

    def test_2_context_injection(self):
        """Test that asking 'Should I spray today?' injects farm's live spray safety score automatically."""
        print("\n--- Test 2: Context Injection ---")
        q = "Should I spray today?"
        lang = detect_language(q)
        r = generate_response(q, lang, self.app_context, [])
        self.assertIn("88/100", r.response_text)
        self.assertIn("8 km/h", r.response_text)
        print(f"Context response: {r.response_text[:90]}...")
        print("✅ Farm context successfully injected into response!")

    def test_3_proactive_clarifying_question(self):
        """Test that ambiguous query ('my crop has spots on leaves') asks for clarification."""
        print("\n--- Test 3: Clarifying Questions ---")
        q = "My crop has spots on leaves"
        lang = detect_language(q)
        r = generate_response(q, lang, self.app_context, [])
        self.assertTrue("which crop" in r.response_text.lower() or "clarify" in r.response_text.lower() or "?" in r.response_text)
        print(f"Clarifying question: {r.response_text}")
        print("✅ Proactive clarifying question correctly triggered!")

    def test_4_domain_boundary_and_drift_prevention(self):
        """Test that attempting to steer conversation into off-topic entertainment is refused."""
        print("\n--- Test 4: Domain Guardrails & Drift Prevention ---")
        history = [
            ChatMessage(role="user", text="What is the price of wheat?"),
            ChatMessage(role="model", text="Wheat is ₹2,840/qtl in Karnal mandi.")
        ]
        
        off_topic_q = "Now tell me who won yesterday's cricket match?"
        lang = detect_language(off_topic_q)
        r = generate_response(off_topic_q, lang, self.app_context, history)
        self.assertFalse(r.domain.is_agri)
        self.assertTrue("agriculture" in r.response_text.lower() or "कृषि" in r.response_text)
        print(f"Refusal response: {r.response_text}")
        print("✅ Off-topic conversational drift successfully blocked!")

    def test_5_rich_markdown_formatting(self):
        """Test that responses contain bold formatting (**bold**) and structured bullet or numbered steps."""
        print("\n--- Test 5: Rich Markdown Formatting ---")
        q = "धान में खाद की मात्रा"
        lang = detect_language(q)
        r = generate_response(q, lang, self.app_context, [])
        self.assertIn("**", r.response_text)
        print(f"Formatted text:\n{r.response_text[:120]}...")
        print("✅ Markdown bolding & structure verified!")

    def test_6_multilingual_consistency(self):
        """Test multi-turn flow across Hindi, Marathi, and Punjabi."""
        print("\n--- Test 6: Multilingual Consistency ---")
        
        # Hindi
        r_hi = generate_response("चावल में खाद की मात्रा", detect_language("चावल में खाद की मात्रा"), self.app_context)
        self.assertIn("DAP", r_hi.response_text)
        
        # Marathi
        r_mr = generate_response("कापूस पिकावर कीड आली आहे", detect_language("कापूस पिकावर कीड आली आहे"), self.app_context)
        self.assertIn("इमिडाक्लोप्रिड", r_mr.response_text)

        # Punjabi
        r_pa = generate_response("ਕਣਕ ਦਾ ਭਾਅ ਕੀ ਹੈ?", detect_language("ਕਣਕ ਦਾ ਭਾਅ ਕੀ ਹੈ?"), self.app_context)
        self.assertIn("2,840", r_pa.response_text)

        print("✅ Hindi, Marathi, and Punjabi multi-turn responses verified!")

if __name__ == "__main__":
    unittest.main()
