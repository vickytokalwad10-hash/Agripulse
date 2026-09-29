import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';

export default function NotificationDrawer() {
  const { t } = useLanguage();
  const {
    notifications,
    unreadCount,
    categoryCounts,
    markAsRead,
    markAllAsRead,
    isDrawerOpen,
    setIsDrawerOpen,
    setIsSettingsOpen,
    sendSmsAlert
  } = useNotifications();

  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [smsSentId, setSmsSentId] = useState(null);

  if (!isDrawerOpen) return null;

  const handleSendSmsSingle = async (notif, e) => {
    e.stopPropagation();
    const res = await sendSmsAlert({
      message_type: notif.category === 'weather' ? 'Weather_Alert' : notif.category === 'price' ? 'Mandi_Price' : 'Scheme_Deadline',
      crop_name: notif.metadata?.crop || 'Crop',
      custom_text: `AgriPulse Alert: ${notif.title} - ${notif.desc}`
    });
    if (res && res.status === 'success') {
      setSmsSentId(notif.id);
      setTimeout(() => setSmsSentId(null), 4000);
    }
  };

  const categories = [
    { key: 'all', label: `🌐 ${t('notifications.all')}`, count: categoryCounts.all || notifications.length },
    { key: 'weather', label: `🌦️ ${t('notifications.weather')}`, count: categoryCounts.weather || 0 },
    { key: 'price', label: `📈 ${t('notifications.prices')}`, count: categoryCounts.price || 0 },
    { key: 'scheme', label: `🏛️ ${t('notifications.schemes')}`, count: categoryCounts.scheme || 0 },
    { key: 'marketplace', label: `🛒 ${t('notifications.marketplace')}`, count: categoryCounts.marketplace || 0 }
  ];

  const filteredNotifications = selectedCategory === 'all'
    ? notifications
    : notifications.filter((n) => n.category?.toLowerCase() === selectedCategory);

  const handleActionClick = (notif) => {
    markAsRead(notif.id);
    setIsDrawerOpen(false);
    if (notif.action_route) {
      navigate(notif.action_route);
    }
  };

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={() => setIsDrawerOpen(false)} />

      {/* Drawer Panel */}
      <div className="w-full sm:w-[420px] max-w-[95vw] bg-[#ffffff] h-full shadow-2xl flex flex-col border-l border-[#e7e5e4] animate-in slide-in-from-right duration-200">
        {/* Masthead Header */}
        <div className="p-4 sm:p-5 border-b border-[#f5f2eb] bg-[#faf8f5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#14532d] text-white flex items-center justify-center text-lg shadow-2xs">
              🔔
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-[#1c1917] font-editorial">
                  सूचना केंद्र • Alerts Center
                </h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-[#ea580c] text-white font-extrabold px-2 py-0.2 rounded-full animate-pulse">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#78716c]">Automated Weather, Mandi & Scheme Advisories</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl text-[#78716c] hover:text-[#1c1917] hover:bg-[#f5f2eb] transition"
              title="Notification Settings"
            >
              <span className="material-symbols-outlined text-[19px]">tune</span>
            </button>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 rounded-xl text-[#78716c] hover:text-[#1c1917] hover:bg-[#f5f2eb] transition"
              title="Close Drawer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills & Mark All Read */}
        <div className="p-3 border-b border-[#f5f2eb] bg-white flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#a8a29e] uppercase tracking-wider">
              Filter by Topic
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-bold text-[#b45309] hover:text-[#92400e] transition flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">done_all</span>
                Mark all read
              </button>
            )}
          </div>

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  selectedCategory === cat.key
                    ? 'bg-[#14532d] text-white shadow-2xs'
                    : 'bg-[#f5f2eb] text-[#57534e] hover:bg-[#e7e5e4]'
                }`}
              >
                <span>{cat.label}</span>
                {cat.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedCategory === cat.key ? 'bg-white/20 text-white' : 'bg-white text-[#1c1917]'
                    }`}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications Scroll List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 bg-[#faf8f5]">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#f5f2eb] text-[#a8a29e] flex items-center justify-center mx-auto text-xl">
                🌾
              </div>
              <p className="text-xs font-bold text-[#78716c]">No alerts in this category</p>
              <span className="text-[11px] text-[#a8a29e] block">
                Everything is calm in your farm network.
              </span>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const isExpanded = expandedId === n.id;
              const colorClass =
                n.color_type === 'crop-green'
                  ? 'notif-green'
                  : n.color_type === 'terracotta'
                  ? 'notif-terracotta'
                  : 'notif-wheat';

              return (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`notif-paper ${colorClass} ${
                    n.unread ? 'shadow-xs ring-1 ring-black/5' : 'opacity-85'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          n.color_type === 'crop-green'
                            ? 'bg-emerald-100 text-emerald-900'
                            : n.color_type === 'terracotta'
                            ? 'bg-orange-100 text-orange-950'
                            : 'bg-amber-100 text-amber-950'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">{n.icon || 'info'}</span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-extrabold text-[#1c1917] truncate leading-tight">
                            {n.title}
                          </h4>
                          {n.unread && (
                            <span className="w-2 h-2 rounded-full bg-[#ea580c] shrink-0" title="Unread"></span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#a8a29e] font-semibold block mt-0.5">
                          {n.time_ago || 'Recently'} • {n.category?.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => toggleExpand(n.id, e)}
                      className="p-1 text-[#a8a29e] hover:text-[#1c1917] transition shrink-0"
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isExpanded ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                  </div>

                  <p
                    className={`text-xs text-[#44403c] mt-2 leading-relaxed ${
                      isExpanded ? '' : 'line-clamp-2'
                    }`}
                  >
                    {n.desc}
                  </p>

                  {/* Action Link & SMS button */}
                  <div className="mt-3 pt-2 border-t border-[#f5f2eb] flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleSendSmsSingle(n, e)}
                        className="px-2 py-0.5 bg-[#faf8f5] hover:bg-[#14532d] hover:text-white text-[#78716c] border border-[#e7e5e4] text-[10px] font-bold rounded-md transition flex items-center gap-1 active:scale-98"
                        title="Send SMS to Farmer Mobile"
                      >
                        <span>📱 SMS Alert</span>
                      </button>
                      {smsSentId === n.id && (
                        <span className="text-[9px] text-emerald-700 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 animate-in fade-in">
                          ✓ SMS Sent!
                        </span>
                      )}
                    </div>

                    {n.action_route && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActionClick(n);
                        }}
                        className="px-2.5 py-1 bg-[#f5f2eb] hover:bg-[#14532d] hover:text-white text-[#14532d] text-[11px] font-extrabold rounded-lg transition flex items-center gap-1 active:scale-98"
                      >
                        <span>View</span>
                        <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Bottom Bar with Notification Settings Link */}
        <div className="p-3 border-t border-[#e7e5e4] bg-white flex items-center justify-between text-xs">
          <span className="text-[11px] text-[#78716c]">
            Real-time push enabled via FCM
          </span>
          <button
            onClick={() => {
              setIsSettingsOpen(true);
              setIsDrawerOpen(false);
            }}
            className="text-[11px] font-bold text-[#14532d] hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">settings</span>
            Manage Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
