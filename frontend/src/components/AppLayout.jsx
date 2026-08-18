import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { useBackNavigation } from '../context/BackNavigationContext';
import NotificationDrawer from './NotificationDrawer';
import NotificationSettingsModal from './NotificationSettingsModal';
import { APP_VERSION } from '../config/version';

export default function AppLayout() {
  const { user, role, logout } = useAuth();
  const { isOnline, pendingSyncCount, isSyncing, triggerSync } = useNetwork();
  const { unreadCount, isDrawerOpen, setIsDrawerOpen, isSettingsOpen, setIsSettingsOpen, urgentToast, dismissToast, markAsRead } = useNotifications();
  const { language, setLanguage, languages, t, formatDate } = useLanguage();
  const { registerOverlay, unregisterOverlay } = useBackNavigation();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Register overlays with Back Navigation stack
  useEffect(() => {
    if (mobileDrawerOpen) {
      registerOverlay('mobileDrawer', () => setMobileDrawerOpen(false));
    } else {
      unregisterOverlay('mobileDrawer');
    }
    return () => unregisterOverlay('mobileDrawer');
  }, [mobileDrawerOpen, registerOverlay, unregisterOverlay]);

  useEffect(() => {
    if (isDrawerOpen) {
      registerOverlay('notificationDrawer', () => setIsDrawerOpen(false));
    } else {
      unregisterOverlay('notificationDrawer');
    }
    return () => unregisterOverlay('notificationDrawer');
  }, [isDrawerOpen, registerOverlay, unregisterOverlay, setIsDrawerOpen]);

  useEffect(() => {
    if (isSettingsOpen) {
      registerOverlay('notificationSettings', () => setIsSettingsOpen(false));
    } else {
      unregisterOverlay('notificationSettings');
    }
    return () => unregisterOverlay('notificationSettings');
  }, [isSettingsOpen, registerOverlay, unregisterOverlay, setIsSettingsOpen]);

  const navSections = [
    {
      title: t('nav.overview'),
      links: [
        { to: '/overview', label: t('nav.overview'), subLabel: t('overview.liveMandiPrices'), icon: 'grid_view' },
        { to: '/marketplace', label: t('nav.marketplace'), subLabel: t('marketplace.title'), icon: 'storefront' },
        { to: '/copilot', label: t('nav.copilot'), subLabel: t('copilot.title'), icon: 'mic' }
      ]
    },
    {
      title: t('nav.weather'),
      links: [
        { to: '/satellite', label: t('nav.satellite'), subLabel: t('satellite.title'), icon: 'satellite_alt' },
        { to: '/weather', label: t('nav.weather'), subLabel: t('weather.title'), icon: 'cloud' },
        { to: '/simulator', label: t('nav.simulator'), subLabel: t('simulator.title'), icon: 'calculate' },
        { to: '/arbitrage', label: t('nav.arbitrage'), subLabel: t('arbitrage.title'), icon: 'compare_arrows' }
      ]
    },
    {
      title: t('nav.schemes'),
      links: [
        { to: '/schemes', label: t('nav.schemes'), subLabel: t('schemes.title'), icon: 'account_balance' },
        { to: '/finance', label: t('nav.finance'), subLabel: t('finance.title'), icon: 'credit_score' },
        { to: '/payment', label: t('nav.payment'), subLabel: t('payment.title'), icon: 'payments' }
      ]
    },
    {
      title: t('nav.community'),
      links: [
        { to: '/diagnose', label: t('nav.diagnose'), subLabel: t('diagnose.title'), icon: 'photo_camera' },
        { to: '/calendar', label: t('nav.calendar'), subLabel: t('calendar.title'), icon: 'calendar_month' },
        { to: '/community', label: t('nav.community'), subLabel: t('community.title'), icon: 'groups' },
        { to: '/livestock', label: t('nav.livestock'), subLabel: t('livestock.title'), icon: 'pets' }
      ]
    }
  ];

  const quickMobileTabs = [
    { to: '/overview', label: t('nav.overview'), icon: 'grid_view' },
    { to: '/schemes', label: t('nav.schemes'), icon: 'account_balance' },
    { to: '/copilot', label: t('nav.copilot'), icon: 'mic', isCenterFab: true },
    { to: '/diagnose', label: t('nav.diagnose'), icon: 'photo_camera' },
    { to: '/payment', label: t('nav.payment'), icon: 'payments' }
  ];

  const handleToastAction = (toast) => {
    markAsRead(toast.id);
    dismissToast();
    if (toast.action_route) {
      navigate(toast.action_route);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1c1917] flex flex-col md:flex-row antialiased selection:bg-[#fef3c7] selection:text-[#92400e] relative">
      {/* ========================================================================= */}
      {/* Urgent Top Toast Notification Banner (Auto-Alert Pop-up) */}
      {/* ========================================================================= */}
      {urgentToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-md toast-animate">
          <div
            className={`p-3.5 sm:p-4 rounded-2xl shadow-floating border flex items-start gap-3 bg-white ${
              urgentToast.color_type === 'crop-green'
                ? 'border-emerald-300 notif-green'
                : urgentToast.color_type === 'terracotta'
                ? 'border-orange-300 notif-terracotta'
                : 'border-amber-300 notif-wheat'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                urgentToast.color_type === 'crop-green'
                  ? 'bg-emerald-100 text-emerald-900'
                  : urgentToast.color_type === 'terracotta'
                  ? 'bg-orange-100 text-orange-950'
                  : 'bg-amber-100 text-amber-950'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{urgentToast.icon || 'warning'}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-extrabold text-[#1c1917] truncate leading-tight">
                  {urgentToast.title}
                </span>
                <span className="text-[9px] font-bold text-[#ea580c] uppercase">{t('common.warning')}</span>
              </div>
              <p className="text-[11px] text-[#44403c] line-clamp-2 mt-0.5 leading-snug">
                {urgentToast.desc}
              </p>
              {urgentToast.action_route && (
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => handleToastAction(urgentToast)}
                    className="text-[11px] font-extrabold text-[#14532d] hover:underline"
                  >
                    {urgentToast.action_label || t('common.details')} ➔
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={dismissToast}
              className="text-[#a8a29e] hover:text-[#1c1917] p-1 shrink-0"
              title={t('common.close')}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Desktop / Tablet Artisanal Human-Crafted Sidebar */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex h-full w-64 lg:w-72 border-r border-[#e7e5e4] bg-[#ffffff] shadow-[1px_0_4px_rgba(0,0,0,0.02)] fixed inset-y-0 left-0 z-40 flex-col p-4">
        {/* Brand App Header */}
        <div className="mb-3 flex items-center justify-between pb-3 border-b border-[#f5f2eb]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#14532d] text-white flex items-center justify-center text-xl shadow-xs border border-[#166534]">
              🌱
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-[#1c1917] leading-none font-editorial flex items-center gap-1.5">
                AgriPulse <span className="font-sans text-[10px] font-bold text-[#b45309] bg-[#fef3c7] px-1.5 py-0.2 rounded-md">भारत</span>
                <span className="font-sans text-[9px] font-bold text-[#14532d] bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md">{APP_VERSION}</span>
              </h1>
              <span className="text-[11px] text-[#78716c] font-medium block mt-1">
                {role === 'buyer' ? (t('common.buyerTerminal') || '🏢 संस्थागत क्रेता टर्मिनल') : (t('common.farmerNetwork') || '🌾 किसान व एफपीओ नेटवर्क')}
              </span>
            </div>
          </div>
        </div>

        {/* Grouped Editorial Navigation */}
        <nav className="flex-1 space-y-4 overflow-y-auto pr-1 text-xs">
          {navSections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <span className="text-[10px] font-bold text-[#a8a29e] uppercase tracking-wider px-3 block">
                {sec.title}
              </span>
              {sec.links.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-xl transition font-semibold ${
                      isActive
                        ? 'bg-[#14532d] text-white shadow-xs'
                        : 'text-[#44403c] hover:bg-[#f5f2eb] hover:text-[#1c1917]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`material-symbols-outlined mr-2.5 text-[19px] ${
                          isActive ? 'fill-1 text-white' : 'text-[#78716c]'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <div className="truncate flex-1">
                        <span className="block truncate font-bold text-xs">{item.label}</span>
                        <span className={`block text-[10px] ${isActive ? 'text-emerald-200' : 'text-[#a8a29e]'}`}>
                          {item.subLabel}
                        </span>
                      </div>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User Card & Logout */}
        <div className="mt-auto pt-3 border-t border-[#f5f2eb]">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#faf8f5] border border-[#e7e5e4] text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#b45309] text-white flex items-center justify-center font-extrabold text-xs shadow-2xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'R'}
              </div>
              <div className="truncate">
                <p className="font-bold text-[#1c1917] truncate leading-tight">{user?.name || 'Ramesh Devidas Patil'}</p>
                <span className="text-[10px] text-[#78716c]">📍 {t('common.karnalNode') || 'करनाल (12.5 एकड़)'}</span>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title={t('common.signOut')}
              className="p-1 text-[#a8a29e] hover:text-rose-700 transition"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* Main Human-Crafted Editorial Content Viewport */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col md:pl-64 lg:pl-72 min-w-0">
        {/* Top Masthead Header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#e7e5e4] px-3 sm:px-6 py-2.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Drawer Button */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-2 rounded-xl bg-[#f5f2eb] hover:bg-[#e7e5e4] text-[#44403c] transition shrink-0"
              aria-label="Open Navigation"
            >
              <span className="material-symbols-outlined text-[20px]">menu</span>
            </button>

            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
                <span className="text-[11px] font-bold text-[#57534e] truncate">{t('common.karnalNode') || 'करनाल एपीएमसी जिला नोड'}</span>
                <span className="text-[10px] text-[#a8a29e] hidden sm:inline">{t('common.liveFeed')}</span>
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-[#1c1917] truncate">
                {t('common.today')}: {formatDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Global 11-Language Switcher (Single Source of Truth) */}
            <div className="flex items-center bg-[#f5f2eb] border border-[#e7e5e4] px-2 py-1 rounded-xl text-xs font-bold text-[#1c1917] shadow-2xs">
              <span className="material-symbols-outlined text-[16px] text-[#14532d] mr-1">translate</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-xs font-extrabold text-[#1c1917] focus:outline-hidden cursor-pointer"
                aria-label={t('nav.switchLanguage')}
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code} className="bg-white text-[#1c1917] font-semibold py-1">
                    {l.native} ({l.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Offline/Online Persistent Signal Badge */}
            <button
              onClick={triggerSync}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                {isOnline ? (isSyncing ? 'sync' : 'wifi') : 'wifi_off'}
              </span>
              <span className="hidden sm:inline">
                {isOnline ? (isSyncing ? (t('common.syncing') || 'सिंक हो रहा है...') : (t('common.online') || 'ऑनलाइन')) : `${t('common.offline') || 'ऑफ़लाइन'} (${pendingSyncCount})`}
              </span>
            </button>

            {/* Persistent Hand-Drawn Notification Bell Icon */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-1.5 sm:p-2 rounded-xl bg-[#f5f2eb] hover:bg-[#e7e5e4] text-[#44403c] transition relative active:scale-95"
              aria-label="Open Notification Center"
              title={t('nav.notifications')}
            >
              <span className="material-symbols-outlined text-[20px] text-[#14532d]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#ea580c] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Dynamic Route Viewport */}
        <main className="flex-1 p-3.5 sm:p-5 lg:p-6 pb-28 md:pb-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* ========================================================================= */}
      {/* Mobile Bottom Navigation Dock */}
      {/* ========================================================================= */}
      <nav className="md:hidden floating-bottom-dock flex items-center justify-around px-2 py-1">
        {quickMobileTabs.map((tab) => {
          if (tab.isCenterFab) {
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                className="relative -top-4 flex flex-col items-center group"
              >
                <div className="w-11 h-11 rounded-full bg-[#14532d] text-white flex items-center justify-center shadow-md border-2 border-white active:scale-95 transition">
                  <span className="material-symbols-outlined text-[22px]">mic</span>
                </div>
                <span className="text-[10px] font-extrabold text-[#14532d] mt-0.5">{t('nav.copilot')}</span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-2 rounded-xl transition ${
                  isActive ? 'text-[#14532d] font-extrabold' : 'text-[#78716c] font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`material-symbols-outlined text-[19px] ${
                      isActive ? 'fill-1' : ''
                    }`}
                  >
                    {tab.icon}
                  </span>
                  <span className="text-[10px] mt-0.5">{tab.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ========================================================================= */}
      {/* Mobile Full Menu Drawer */}
      {/* ========================================================================= */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex">
          <div className="w-72 max-w-[85vw] bg-white h-full p-4 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-[#f5f2eb] mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌱</span>
                <span className="font-extrabold text-sm text-[#1c1917] font-editorial">{t('common.appName')}</span>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 text-[#78716c] hover:text-[#1c1917]"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
              {navSections.map((sec, sIdx) => (
                <div key={sIdx} className="space-y-1">
                  <span className="text-[10px] font-bold text-[#a8a29e] uppercase tracking-wider px-2 block">
                    {sec.title}
                  </span>
                  {sec.links.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 rounded-xl font-bold ${
                          isActive
                            ? 'bg-[#14532d] text-white'
                            : 'text-[#44403c] hover:bg-[#f5f2eb]'
                        }`
                      }
                    >
                      <span className="material-symbols-outlined mr-2 text-[18px]">{item.icon}</span>
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileDrawerOpen(false)}></div>
        </div>
      )}

      {/* Sliding Notification Center Drawer */}
      <NotificationDrawer />

      {/* Notification Preferences Modal */}
      <NotificationSettingsModal />
    </div>
  );
}
