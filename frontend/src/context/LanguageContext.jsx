/**
 * ============================================================================
 * AGRIPULSE AI — UNIFIED GLOBAL LANGUAGE STORE (SINGLE SOURCE OF TRUTH)
 * ============================================================================
 * 
 * ARCHITECTURAL RULE:
 * This is the ONLY place language state lives in the entire app.
 * NO component, screen, or service (including the Voice Copilot) may maintain
 * its own local `useState` for language. All text rendering must consume `t()`
 * from `react-i18next` or `useLanguage()`.
 * 
 * RESOLUTION PRIORITY ORDER:
 * 1. Explicit user override in current session (manual header switch) — Highest
 * 2. Saved preferredLanguage from user profile (Supabase / Firestore)
 * 3. Saved language in localStorage ('agripulse_lang' loaded before auth to prevent flash)
 * 4. Per-message detection override (Copilot only, temporary — does NOT change global state
 *    unless user explicitly taps the "Switch App Language" confirmation chip)
 * 5. Browser/device locale ('navigator.language') — Lowest fallback
 * ============================================================================
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', script: 'Latin', speechLang: 'en-IN' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', script: 'Devanagari', speechLang: 'hi-IN' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', script: 'Devanagari', speechLang: 'mr-IN' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', script: 'Gurmukhi', speechLang: 'pa-IN' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', script: 'Gujarati', speechLang: 'gu-IN' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', script: 'Telugu', speechLang: 'te-IN' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', script: 'Tamil', speechLang: 'ta-IN' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', script: 'Kannada', speechLang: 'kn-IN' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', script: 'Bengali', speechLang: 'bn-IN' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', script: 'Malayalam', speechLang: 'ml-IN' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', script: 'Odia', speechLang: 'or-IN' },
];

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const { i18n, t } = useTranslation();
  let user = null;
  try {
    const auth = useAuth();
    user = auth?.user;
  } catch {
    user = null;
  }

  // Initialize from LocalStorage or default
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('agripulse_lang') || i18n.language || 'en';
  });

  // Sync with user profile on login if preferredLanguage is present
  useEffect(() => {
    if (user?.user_metadata?.preferredLanguage) {
      const userLang = user.user_metadata.preferredLanguage;
      if (SUPPORTED_LANGUAGES.some(l => l.code === userLang) && userLang !== language) {
        setLanguage(userLang);
      }
    }
  }, [user]);

  // Set Language: Synchronizes i18next, LocalStorage, and React State
  const setLanguage = useCallback((code) => {
    const validLang = SUPPORTED_LANGUAGES.some(l => l.code === code) ? code : 'en';
    setLanguageState(validLang);
    localStorage.setItem('agripulse_lang', validLang);
    i18n.changeLanguage(validLang);
    document.documentElement.lang = validLang;
  }, [i18n]);

  const currentLanguageObj = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  // Number / Currency Formatter per Locale
  const formatCurrency = useCallback((amount) => {
    try {
      const locale = language === 'en' ? 'en-IN' : `${language}-IN`;
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(amount);
    } catch {
      return `₹${Number(amount).toLocaleString('en-IN')}`;
    }
  }, [language]);

  // Date Formatter per Locale
  const formatDate = useCallback((dateInput, options = {}) => {
    try {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      if (isNaN(date.getTime())) return String(dateInput || '');
      const locale = language === 'en' ? 'en-IN' : `${language}-IN`;
      const formatOptions = Object.keys(options).length > 0 ? options : { dateStyle: 'medium' };
      return new Intl.DateTimeFormat(locale, formatOptions).format(date);
    } catch {
      try {
        return new Date(dateInput).toLocaleDateString();
      } catch {
        return String(dateInput || '');
      }
    }
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languages: SUPPORTED_LANGUAGES,
        currentLanguageObj,
        formatCurrency,
        formatDate
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
