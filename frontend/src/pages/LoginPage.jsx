import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { t } = useLanguage();
  const { loginWithSupabase, signupWithSupabase, sendSupabaseOtp, verifySupabaseOtp, loginDemo } = useAuth();
  const navigate = useNavigate();

  const [authTab, setAuthTab] = useState('password'); // 'password', 'otp', 'signup'
  const [selectedRole, setSelectedRole] = useState('farmer'); // 'farmer' or 'buyer'

  // Password Login State
  const [email, setEmail] = useState('farmer@agripulse.ai');
  const [password, setPassword] = useState('Farmer@123');

  // OTP Login State
  const [otpEmail, setOtpEmail] = useState('farmer@agripulse.ai');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Signup State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupVillage, setSignupVillage] = useState('Karnal');
  const [signupCompany, setSignupCompany] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      await loginWithSupabase(email, password);
      navigate('/overview');
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      await sendSupabaseOtp(otpEmail);
      setOtpSent(true);
      setToastMsg(`✅ Verification code sent to ${otpEmail} (Use 123456 for test sandbox)`);
    } catch (err) {
      setErrorMsg('Failed to send OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const { user, error } = await verifySupabaseOtp(otpEmail, otpCode, selectedRole);
      if (error) throw error;
      navigate('/overview');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      await signupWithSupabase({
        email: signupEmail,
        password: signupPassword,
        name: signupName,
        phone: signupPhone,
        role: selectedRole,
        village: signupVillage,
        company: signupCompany
      });
      navigate('/overview');
    } catch (err) {
      setErrorMsg(err.message || 'Sign up failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    loginDemo(role);
    navigate('/overview');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-5 animate-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center mx-auto text-3xl shadow-glow-green mb-2">
            🌱
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            AgriPulse <span className="text-brand-600">AI</span>
          </h1>
          <p className="text-xs text-slate-500 font-semibold">
            {t('login.platformTagline')}
          </p>
        </div>

        {/* Toast / Error alerts */}
        {toastMsg && (
          <div className="p-3 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-2xl text-xs font-bold flex justify-between items-center">
            <span>{toastMsg}</span>
            <button onClick={() => setToastMsg(null)}>✕</button>
          </div>
        )}
        {errorMsg && (
          <div className="p-3 bg-rose-100 text-rose-900 border border-rose-300 rounded-2xl text-xs font-bold flex justify-between items-center">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)}>✕</button>
          </div>
        )}

        {/* Main Auth Card */}
        <div className="glass-card p-6 shadow-floating border border-slate-200/80 space-y-4">
          {/* Role Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={() => {
                setSelectedRole('farmer');
                setEmail('farmer@agripulse.ai');
                setPassword('Farmer@123');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                selectedRole === 'farmer' ? 'bg-white text-brand-800 shadow-xs' : 'text-slate-500'
              }`}
            >
              <span>🌾</span>
              <span>{t('login.farmerOption')}</span>
            </button>
            <button
              onClick={() => {
                setSelectedRole('buyer');
                setEmail('buyer@agripulse.ai');
                setPassword('Buyer@123');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                selectedRole === 'buyer' ? 'bg-white text-brand-800 shadow-xs' : 'text-slate-500'
              }`}
            >
              <span>🏢</span>
              <span>{t('login.buyerOption')}</span>
            </button>
          </div>

          {/* Auth Tab Selector */}
          <div className="flex border-b border-slate-100 pb-2 gap-2 text-xs font-bold">
            <button
              onClick={() => setAuthTab('password')}
              className={`pb-1 border-b-2 transition ${
                authTab === 'password' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-400'
              }`}
            >
              {t('login.supabasePasswordTab')}
            </button>
            <button
              onClick={() => setAuthTab('otp')}
              className={`pb-1 border-b-2 transition ${
                authTab === 'otp' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-400'
              }`}
            >
              {t('login.magicOtpTab')}
            </button>
            <button
              onClick={() => setAuthTab('signup')}
              className={`pb-1 border-b-2 transition ${
                authTab === 'signup' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-400'
              }`}
            >
              {t('login.registerTab')}
            </button>
          </div>

          {/* FORM 1: Supabase Password Login */}
          {authTab === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('login.supabaseEmail')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@agripulse.ai"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-brand-600"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('login.enterPassword')}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-brand-600"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold rounded-xl shadow-glow-green transition active:scale-95 text-xs flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">lock_open</span>
                {loading
                  ? t('login.authenticating')
                  : selectedRole === 'farmer'
                    ? t('login.signInAsFarmer')
                    : t('login.signInAsBuyer')
                }
              </button>
            </form>
          )}

          {/* FORM 2: Supabase Magic OTP */}
          {authTab === 'otp' && (
            <div className="space-y-3 text-xs">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{t('login.enterEmailOtp')}</label>
                    <input
                      type="email"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      placeholder="name@agripulse.ai"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-brand-600"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs transition active:scale-95"
                  >
                    {loading ? t('login.sendingCode') : t('login.sendMagicOtp')}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{t('login.sixDigitOtp')}</label>
                    <input
                      type="text"
                      maxLength="6"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="e.g. 123456"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-center tracking-widest text-base focus:outline-brand-600"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition active:scale-95"
                  >
                    {loading ? t('login.verifying') : t('login.verifyOtp')}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* FORM 3: Register Account */}
          {authTab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-2.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-0.5">{t('login.fullName')}</label>
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="e.g. Baldev Singh"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">{t('login.email')}</label>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="user@agripulse.ai"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">{t('login.mobilePhone')}</label>
                  <input
                    type="tel"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder="9812345678"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    required
                  />
                </div>
              </div>

              {selectedRole === 'farmer' ? (
                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">{t('login.villageDistrict')}</label>
                  <input
                    type="text"
                    value={signupVillage}
                    onChange={(e) => setSignupVillage(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">{t('login.companyName')}</label>
                  <input
                    type="text"
                    value={signupCompany}
                    onChange={(e) => setSignupCompany(e.target.value)}
                    placeholder="e.g. Adani Wilmar Agro"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-0.5">{t('login.createPassword')}</label>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs transition active:scale-95 mt-1"
              >
                {loading ? t('login.creatingAccount') : t('login.registerProfile')}
              </button>
            </form>
          )}

          {/* 1-Click Fast Sandbox Access */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              {t('login.sandboxCredentials')}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('farmer')}
                className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left transition active:scale-95"
              >
                <span className="text-xs font-extrabold text-emerald-900 block">{t('login.farmerDemoLabel')}</span>
                <span className="text-[10px] text-emerald-700 font-medium">Ram Lal (12.5 Ac)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('buyer')}
                className="p-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-left transition active:scale-95"
              >
                <span className="text-xs font-extrabold text-blue-900 block">{t('login.buyerDemoLabel')}</span>
                <span className="text-[10px] text-blue-700 font-medium">Rajesh (₹75L Limit)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
