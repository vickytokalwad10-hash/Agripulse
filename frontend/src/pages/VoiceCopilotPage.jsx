/**
 * ============================================================================
 * AGRIPULSE AI — KISAN MITRA MULTILINGUAL COPILOT
 * ============================================================================
 * Unified Voice & Text Agronomy Copilot supporting 11 Indian Languages + Hinglish.
 * Features hybrid backend-first resolution with embedded on-device Agronomy AI
 * knowledge fallback to ensure 100% offline & mobile availability.
 * ============================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { detectScriptAndLanguage, generateAgronomyResponse, isAgronomyQuery } from '../services/copilotEngine';

export default function VoiceCopilotPage() {
  const { user } = useAuth();
  const { language, setLanguage, languages, currentLanguageObj, t } = useLanguage();

  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [detectedLangInfo, setDetectedLangInfo] = useState(null);
  const [suggestLanguageSwitch, setSuggestLanguageSwitch] = useState(null); // { code, name }
  const [messages, setMessages] = useState(() => [
    {
      id: 1,
      sender: 'copilot',
      text: t('copilot.welcomeMessage') || 'नमस्ते! मैं आपका किसान मित्र AI कृषि सहायक हूँ। अपनी भाषा में फसल, खाद, कीट नियंत्रण, मंडी भाव या सरकारी योजनाओं के बारे में कोई भी प्रश्न पूछें।',
      langName: currentLanguageObj.native || currentLanguageObj.name,
      langCode: currentLanguageObj.code,
      isAgri: true,
      category: 'Farming Advisory',
      followups: [
        'गेहूं में खाद की मात्रा (Hindi)',
        'कापूस कीड नियंत्रण (Marathi)',
        'ਕਣਕ ਦਾ ਮੰਡੀ ਭਾਅ (Punjabi)',
        'Fertilizer Schedule for Wheat'
      ]
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    { title: 'गेहूं में खाद (Hindi)', text: 'गेहूं की फसल में कौन सी खाद डालनी चाहिए?' },
    { title: 'कापूस कीड (Marathi)', text: 'कापूस पिकावर कीड आली आहे, काय करावे?' },
    { title: 'ਕਣਕ ਦਾ ਭਾਅ (Punjabi)', text: 'ਕਣਕ ਦਾ ਭਾਅ ਕੀ ਹੈ?' },
    { title: 'મગફળી ખાતર (Gujarati)', text: 'મગફળીના પાક માટે કયું ખાતર સારું છે?' },
    { title: 'వరి ఎరువులు (Telugu)', text: 'వరి పంటకు ఎరువులు ఎప్పుడు వేయాలి?' },
    { title: 'நெல் உரம் (Tamil)', text: 'நெல் பயிருக்கு எந்த உரம் நல்லது?' },
    { title: 'Hinglish (Wheat Khad)', text: 'wheat ki fasal me kaunsi khad daalu' },
    { title: 'Off-Topic (Cricket)', text: 'आज का क्रिकेट मैच कौन जीतेगा?' }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update initial welcome message when app language changes
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 1) {
        return [
          {
            id: 1,
            sender: 'copilot',
            text: t('copilot.welcomeMessage') || 'नमस्ते! मैं आपका किसान मित्र AI कृषि सहायक हूँ। अपनी भाषा में फसल, खाद, कीट नियंत्रण, मंडी भाव या सरकारी योजनाओं के बारे में कोई भी प्रश्न पूछें।',
            langName: currentLanguageObj.native || currentLanguageObj.name,
            langCode: currentLanguageObj.code,
            isAgri: true,
            category: 'Farming Advisory',
            followups: [
              'गेहूं में खाद की मात्रा (Hindi)',
              'कापूस कीड नियंत्रण (Marathi)',
              'ਕਣਕ ਦਾ ਮੰਡੀ ਭਾਅ (Punjabi)',
              'Fertilizer Schedule for Wheat'
            ]
          }
        ];
      }
      return prev;
    });
  }, [language, t, currentLanguageObj]);

  const handleSendMessage = async (queryText) => {
    const textToSend = (queryText || inputText).trim();
    if (!textToSend || loading) return;

    // Fast Client-Side Script & Language Detection
    const detected = detectScriptAndLanguage(textToSend, language);
    setDetectedLangInfo(detected);

    // Suggest language switch if user wrote in a different regional language
    if (detected?.code && detected.code !== language && detected.code !== 'hi-Latn') {
      const matched = languages.find((l) => l.code === detected.code);
      if (matched) {
        setSuggestLanguageSwitch({
          code: matched.code,
          name: matched.native || matched.name
        });
      }
    } else {
      setSuggestLanguageSwitch(null);
    }

    // Add user message to chat UI
    const newUserMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputText('');
    setLoading(true);

    let copilotResponseData = null;

    try {
      // 1. Attempt FastAPI backend if locally reachable
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch('http://127.0.0.1:8000/api/copilot/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          query: textToSend,
          language: language,
          user_id: user?.uid || 'farmer_session',
          location: 'Karnal, Haryana'
        })
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        copilotResponseData = await res.json();
      }
    } catch (e) {
      // Local backend not reachable (offline / mobile APK / GitHub Pages)
      console.log('Using on-device Agronomy Knowledge Engine:', e.message);
    }

    // 2. Seamless Hybrid Fallback: Use on-device Agronomy Knowledge Engine
    if (!copilotResponseData) {
      const localResult = generateAgronomyResponse(textToSend, detected.code || language);
      copilotResponseData = {
        response_text: localResult.response_text,
        domain: {
          is_agri: localResult.is_agri,
          detected_category: localResult.category
        },
        action_title: localResult.action_title,
        action_details: localResult.action_details,
        key_stats: localResult.key_stats,
        suggested_followups: localResult.suggested_followups
      };
    }

    const newCopilotMsg = {
      id: Date.now() + 1,
      sender: 'copilot',
      text: copilotResponseData.response_text,
      langName: detected?.native || detected?.name || currentLanguageObj.native,
      langCode: detected?.code || language,
      script: detected?.script || 'Latin',
      isAgri: copilotResponseData.domain?.is_agri ?? true,
      category: copilotResponseData.domain?.detected_category || 'Agronomy Advice',
      actionTitle: copilotResponseData.action_title,
      actionDetails: copilotResponseData.action_details,
      keyStats: copilotResponseData.key_stats || [],
      followups: copilotResponseData.suggested_followups || []
    };

    setMessages((prev) => [...prev, newCopilotMsg]);
    setLoading(false);

    // Auto-TTS Speech Synthesis
    if (copilotResponseData.response_text) {
      speakText(copilotResponseData.response_text, detected?.code || language);
    }
  };

  /**
   * DYNAMIC SPEECH SYNTHESIS
   */
  const speakText = (text, langCode) => {
    if (!('speechSynthesis' in window) || !text) return;

    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#_`]/g, '').slice(0, 240);
      const utterance = new SpeechSynthesisUtterance(cleanText);

      const ttsMap = {
        en: 'en-IN',
        hi: 'hi-IN',
        mr: 'mr-IN',
        pa: 'pa-IN',
        gu: 'gu-IN',
        te: 'te-IN',
        ta: 'ta-IN',
        kn: 'kn-IN',
        bn: 'bn-IN',
        ml: 'ml-IN',
        or: 'or-IN',
        'hi-Latn': 'hi-IN'
      };
      utterance.lang = ttsMap[langCode] || currentLanguageObj.speechLang || 'hi-IN';
      utterance.rate = 0.95;

      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis note:', e);
      setIsPlayingAudio(false);
    }
  };

  /**
   * DYNAMIC SPEECH RECOGNITION
   */
  const toggleVoiceListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported on this browser. Please type your query.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      const sttMap = {
        en: 'en-IN',
        hi: 'hi-IN',
        mr: 'mr-IN',
        pa: 'pa-IN',
        gu: 'gu-IN',
        te: 'te-IN',
        ta: 'ta-IN',
        kn: 'kn-IN',
        bn: 'bn-IN',
        ml: 'ml-IN',
        or: 'or-IN'
      };
      recognition.lang = sttMap[language] || currentLanguageObj.speechLang || 'hi-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        handleSendMessage(transcript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error('Speech recognition start failed:', e);
      setIsListening(false);
    }
  };

  const handleApplyLanguageSwitch = () => {
    if (suggestLanguageSwitch?.code) {
      setLanguage(suggestLanguageSwitch.code);
      setSuggestLanguageSwitch(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#e7e5e4]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#14532d] animate-pulse"></span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#14532d]">
              {t('copilot.domainBadge') || 'कृषि विशेषज्ञ AI • 11 भारतीय भाषाएं'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#1c1917] tracking-tight font-editorial mt-0.5">
            {t('copilot.title')}
          </h2>
          <p className="text-xs sm:text-sm text-[#57534e] max-w-2xl mt-1">
            {t('copilot.subtitle')}
          </p>
        </div>

        {/* Active Global Language Badge */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-[#f5f2eb] px-3 py-1.5 rounded-xl border border-[#e7e5e4]">
          <span className="material-symbols-outlined text-[16px] text-[#14532d]">language</span>
          <span className="text-xs font-bold text-[#1c1917]">
            {t('copilot.activeAppLanguage') || 'सक्रिय ऐप भाषा'}: <strong className="text-[#14532d]">{currentLanguageObj.native} ({currentLanguageObj.name})</strong>
          </span>
        </div>
      </div>

      {/* 1-Tap Language Switch Confirmation Banner */}
      {suggestLanguageSwitch && (
        <div className="paper-card p-3.5 bg-[#fefce8] border-l-4 border-l-[#ca8a04] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ca8a04] text-[20px]">translate</span>
            <p className="text-xs font-bold text-[#854d0e]">
              We noticed your query in <strong>{suggestLanguageSwitch.name}</strong>. Would you like to switch the whole app to {suggestLanguageSwitch.name}?
            </p>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setSuggestLanguageSwitch(null)}
              className="px-2.5 py-1 text-[11px] font-bold text-[#78716c] hover:bg-[#fef9c3] rounded-lg"
            >
              {t('copilot.dismiss') || 'हटाएं'}
            </button>
            <button
              onClick={handleApplyLanguageSwitch}
              className="px-3 py-1 bg-[#14532d] hover:bg-[#052e16] text-white text-[11px] font-extrabold rounded-lg shadow-2xs btn-tap"
            >
              ✓ {t('copilot.switchConfirm') || 'भाषा बदलें'}
            </button>
          </div>
        </div>
      )}

      {/* Main Chat Container */}
      <div className="paper-card flex flex-col h-[520px] sm:h-[580px] p-0 overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-full`}
            >
              {/* Sender Label & Language Tag */}
              <div className="flex items-center gap-2 mb-1 px-1 text-[10px] font-extrabold">
                {msg.sender === 'user' ? (
                  <span className="text-[#78716c]">{t('copilot.youFarmer') || 'आप (किसान)'}</span>
                ) : (
                  <>
                    <span className="text-[#14532d] flex items-center gap-1 font-editorial">
                      <span className="material-symbols-outlined text-[14px]">psychology</span>
                      AgriPulse Copilot
                    </span>
                    <span className="px-2 py-0.2 rounded-full bg-[#f5fdf7] text-[#14532d] border border-[#bbf7d0]">
                      {t('copilot.replyingIn') || 'उत्तर भाषा'}: {msg.langName} ({msg.langCode})
                    </span>
                    {!msg.isAgri && (
                      <span className="px-2 py-0.2 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                        Off-Domain Refusal
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`p-4 rounded-2xl max-w-[92%] sm:max-w-[85%] text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#14532d] text-white font-medium shadow-xs rounded-tr-xs'
                    : msg.isAgri
                    ? 'bg-[#faf8f5] border border-[#e7e5e4] text-[#1c1917] rounded-tl-xs'
                    : 'bg-rose-50 border border-rose-200 text-rose-900 rounded-tl-xs'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Structured Advisory Cards */}
                {msg.actionTitle && (
                  <div className="mt-3 pt-3 border-t border-black/10">
                    <h5 className="font-extrabold text-[#14532d] font-editorial text-xs mb-1">
                      {msg.actionTitle}
                    </h5>
                    {msg.actionDetails && (
                      <p className="text-[11px] text-[#57534e]">{msg.actionDetails}</p>
                    )}
                  </div>
                )}

                {/* Key Stats Chips */}
                {msg.keyStats && msg.keyStats.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {msg.keyStats.map((st, sIdx) => (
                      <span
                        key={sIdx}
                        className="bg-white/90 border border-[#e7e5e4] px-2 py-0.5 rounded-lg text-[10px] font-bold text-[#1c1917]"
                      >
                        {st.label}: <strong className="text-[#14532d]">{st.val}</strong>
                      </span>
                    ))}
                  </div>
                )}

                {/* Suggested Followups */}
                {msg.followups && msg.followups.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-black/10">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#78716c] block mb-1.5">
                      {t('copilot.suggestedQueries') || 'संबंधित सुझाव'}:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.followups.map((f, fIdx) => (
                        <button
                          key={fIdx}
                          onClick={() => handleSendMessage(f)}
                          className="text-[10px] font-bold bg-white border border-[#e7e5e4] hover:border-[#14532d] hover:bg-[#f5fdf7] text-[#14532d] px-2.5 py-1 rounded-xl transition text-left"
                        >
                          💬 {f}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs font-bold text-[#14532d] p-2 bg-[#f5fdf7] rounded-xl border border-[#bbf7d0] w-fit animate-pulse">
              <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
              <span>{t('copilot.analyzingAgronomy') || 'कृषि विश्लेषण व भाषा पहचान जारी...'}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Strip */}
        <div className="px-4 py-2 bg-[#faf8f5] border-t border-[#f5f2eb] flex gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-extrabold uppercase text-[#78716c] self-center shrink-0">
            {t('copilot.quickPrompts') || 'त्वरित प्रश्न'}:
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.text)}
              className="text-[11px] font-bold whitespace-nowrap bg-white border border-[#e7e5e4] hover:bg-[#f5f2eb] text-[#1c1917] px-2.5 py-1 rounded-xl transition shrink-0 shadow-2xs"
            >
              {p.title}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-[#e7e5e4] flex items-center gap-2">
          {/* Voice Input Button */}
          <button
            onClick={toggleVoiceListening}
            className={`p-3 rounded-2xl transition flex items-center justify-center shrink-0 ${
              isListening
                ? 'bg-rose-600 text-white shadow-md animate-ping'
                : 'bg-[#f5fdf7] border border-[#bbf7d0] text-[#14532d] hover:bg-[#bbf7d0]'
            }`}
            title={t('copilot.voiceInputTooltip') || 'बोलकर प्रश्न पूछने के लिए दबाएं'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isListening ? 'mic_off' : 'mic'}
            </span>
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={t('copilot.typePlaceholder')}
            className="flex-1 p-2.5 sm:p-3 bg-[#faf8f5] border border-[#e7e5e4] rounded-2xl text-xs sm:text-sm font-semibold text-[#1c1917] focus:outline-[#14532d]"
          />

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || loading}
            className="p-3 bg-[#14532d] hover:bg-[#052e16] disabled:opacity-40 text-white rounded-2xl transition shrink-0 font-extrabold shadow-xs btn-tap flex items-center justify-center"
            title={t('copilot.send') || 'प्रश्न भेजें'}
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
