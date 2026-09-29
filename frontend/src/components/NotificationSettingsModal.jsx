import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationSettingsModal() {
  const { t } = useLanguage();
  const {
    settings,
    updateSettings,
    isSettingsOpen,
    setIsSettingsOpen,
    triggerSimulation,
    sendSmsAlert,
    requestPushPermission
  } = useNotifications();

  const [formState, setFormState] = useState({ ...settings });
  const [simulating, setSimulating] = useState(false);
  const [smsResult, setSmsResult] = useState(null);

  if (!isSettingsOpen) return null;

  const availableCrops = [
    { id: 'wheat', label: 'Wheat (गेहूं)' },
    { id: 'paddy', label: 'Basmati Paddy (धान)' },
    { id: 'mustard', label: 'Mustard (सरसों)' },
    { id: 'soybean', label: 'Soybean (सोयाबीन)' },
    { id: 'cotton', label: 'Bt Cotton (कपास)' },
    { id: 'maize', label: 'Maize (मक्का)' },
    { id: 'onion', label: 'Onion (प्याज)' },
    { id: 'tomato', label: 'Tomato (टमाटर)' }
  ];

  const handleToggleCrop = (cropId) => {
    const list = formState.watchlist_crops || [];
    if (list.includes(cropId)) {
      setFormState({ ...formState, watchlist_crops: list.filter((c) => c !== cropId) });
    } else {
      setFormState({ ...formState, watchlist_crops: [...list, cropId] });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings(formState);
    setIsSettingsOpen(false);
  };

  const handleTestTrigger = async (type) => {
    setSimulating(true);
    setSmsResult(null);
    await triggerSimulation(type);
    setSimulating(false);
  };

  const handleTestSms = async () => {
    setSimulating(true);
    setSmsResult(null);
    const res = await sendSmsAlert({
      recipient_mobile: formState.recipient_mobile || '+91 98765 43210',
      message_type: 'Weather_Alert',
      crop_name: 'Wheat',
      custom_text: `AgriPulse SMS Test: Verified alert dispatch to ${formState.recipient_mobile || '+91 98765 43210'}. DLT Gateway Active.`
    });
    setSimulating(false);
    if (res && res.status === 'success') {
      setSmsResult(`✅ SMS Sent! ID: ${res.dispatch_details?.message_id} (${res.dispatch_details?.delivery_status})`);
    } else {
      setSmsResult('❌ Failed to dispatch SMS');
    }
  };

  const handlePushPermissionClick = async () => {
    await requestPushPermission();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-floating border border-[#e7e5e4] animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#f5f2eb] mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#14532d] text-white flex items-center justify-center text-base">
              ⚙️
            </span>
            <div>
              <h3 className="font-extrabold text-base text-[#1c1917] font-editorial">
                अलर्ट प्राथमिकताएं • Notification & SMS Preferences
              </h3>
              <p className="text-[11px] text-[#78716c]">Configure SMS dispatches, Push alerts & thresholds</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1 text-[#78716c] hover:text-[#1c1917]"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs font-medium text-[#44403c]">
          {/* SMS & Push Notification Channels */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-extrabold text-[#a8a29e] uppercase tracking-wider block">
              SMS Push Notifications & Delivery Channels
            </span>

            {/* SMS Toggle */}
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#faf8f5] border border-[#e7e5e4] cursor-pointer hover:bg-[#f5f2eb]">
              <div>
                <span className="font-bold text-[#1c1917] flex items-center gap-1.5">
                  <span>📱 SMS Push Notifications (DLT / Fast2SMS)</span>
                  <span className="text-[9px] bg-[#14532d] text-white px-1.5 py-0.2 rounded font-extrabold">Active</span>
                </span>
                <span className="text-[11px] text-[#78716c]">Send weather hazards & mandi alerts via SMS to mobile</span>
              </div>
              <input
                type="checkbox"
                checked={formState.enable_sms_alerts !== false}
                onChange={(e) => setFormState({ ...formState, enable_sms_alerts: e.target.checked })}
                className="w-4 h-4 accent-[#14532d] rounded"
              />
            </label>

            {/* Browser Push Toggle */}
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#faf8f5] border border-[#e7e5e4] cursor-pointer hover:bg-[#f5f2eb]">
              <div>
                <span className="font-bold text-[#1c1917] flex items-center gap-1.5">
                  <span>🔔 Web & Native Device Push Alerts</span>
                </span>
                <span className="text-[11px] text-[#78716c]">Instant browser and Android pop-up notifications</span>
              </div>
              <input
                type="checkbox"
                checked={formState.enable_push_alerts !== false}
                onChange={(e) => {
                  setFormState({ ...formState, enable_push_alerts: e.target.checked });
                  if (e.target.checked) handlePushPermissionClick();
                }}
                className="w-4 h-4 accent-[#14532d] rounded"
              />
            </label>

            {/* Recipient Phone & SMS Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-[10px] font-bold text-[#78716c] block mb-1">
                  Recipient Mobile (for SMS alerts)
                </label>
                <input
                  type="tel"
                  value={formState.recipient_mobile || '+91 98765 43210'}
                  onChange={(e) => setFormState({ ...formState, recipient_mobile: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#e7e5e4] bg-[#faf8f5] text-xs font-bold text-[#1c1917]"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#78716c] block mb-1">
                  SMS Language Format
                </label>
                <select
                  value={formState.sms_language || 'hi'}
                  onChange={(e) => setFormState({ ...formState, sms_language: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#e7e5e4] bg-[#faf8f5] text-xs font-bold text-[#1c1917]"
                >
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                  <option value="mr">मराठी (Marathi)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="te">తెలుగు (Telugu)</option>
                  <option value="kn">ಕನ್ನಡ (Kannada)</option>
                  <option value="bn">বাংলা (Bengali)</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Switches */}
          <div className="space-y-2.5 pt-2 border-t border-[#f5f2eb]">
            <span className="text-[10px] font-extrabold text-[#a8a29e] uppercase tracking-wider block">
              Active Advisory Topics
            </span>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#faf8f5] border border-[#e7e5e4] cursor-pointer hover:bg-[#f5f2eb]">
              <div>
                <span className="font-bold text-[#1c1917] block">Rain & Weather Hazard Alerts</span>
                <span className="text-[11px] text-[#78716c]">Alert when rain & heatwave exceed safety limits</span>
              </div>
              <input
                type="checkbox"
                checked={formState.enable_weather_alerts}
                onChange={(e) => setFormState({ ...formState, enable_weather_alerts: e.target.checked })}
                className="w-4 h-4 accent-[#14532d] rounded"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#faf8f5] border border-[#e7e5e4] cursor-pointer hover:bg-[#f5f2eb]">
              <div>
                <span className="font-bold text-[#1c1917] block">Mandi Price Spike & Spot Alerts</span>
                <span className="text-[11px] text-[#78716c]">Alert on sudden spot spikes or MSP divergences</span>
              </div>
              <input
                type="checkbox"
                checked={formState.enable_price_alerts}
                onChange={(e) => setFormState({ ...formState, enable_price_alerts: e.target.checked })}
                className="w-4 h-4 accent-[#14532d] rounded"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#faf8f5] border border-[#e7e5e4] cursor-pointer hover:bg-[#f5f2eb]">
              <div>
                <span className="font-bold text-[#1c1917] block">PM-KISAN & PMFBY Scheme Alerts</span>
                <span className="text-[11px] text-[#78716c]">Direct benefit release & claim intimation alerts</span>
              </div>
              <input
                type="checkbox"
                checked={formState.enable_scheme_alerts}
                onChange={(e) => setFormState({ ...formState, enable_scheme_alerts: e.target.checked })}
                className="w-4 h-4 accent-[#14532d] rounded"
              />
            </label>
          </div>

          {/* Threshold Sliders */}
          <div className="space-y-3 pt-2 border-t border-[#f5f2eb]">
            <span className="text-[10px] font-extrabold text-[#a8a29e] uppercase tracking-wider block">
              Custom Alert Thresholds
            </span>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span>Rain Probability Alert Limit (%)</span>
                <span className="font-extrabold text-[#14532d]">{formState.rain_probability_threshold}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="90"
                step="5"
                value={formState.rain_probability_threshold}
                onChange={(e) => setFormState({ ...formState, rain_probability_threshold: Number(e.target.value) })}
                className="w-full accent-[#14532d]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span>Price Movement Threshold (±%)</span>
                <span className="font-extrabold text-[#14532d]">±{formState.price_change_threshold}%</span>
              </div>
              <input
                type="range"
                min="2"
                max="12"
                step="1"
                value={formState.price_change_threshold}
                onChange={(e) => setFormState({ ...formState, price_change_threshold: Number(e.target.value) })}
                className="w-full accent-[#14532d]"
              />
            </div>
          </div>

          {/* Watchlist Crops */}
          <div className="space-y-2 pt-2 border-t border-[#f5f2eb]">
            <span className="text-[10px] font-extrabold text-[#a8a29e] uppercase tracking-wider block">
              Tracked Crops Watchlist
            </span>
            <div className="flex flex-wrap gap-1.5">
              {availableCrops.map((c) => {
                const isSelected = (formState.watchlist_crops || []).includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleToggleCrop(c.id)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#14532d] text-white shadow-2xs'
                        : 'bg-[#f5f2eb] text-[#78716c] hover:bg-[#e7e5e4]'
                    }`}
                  >
                    <span>{c.label}</span>
                    {isSelected && <span>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Test Simulation & SMS Dispatch Buttons */}
          <div className="pt-2 border-t border-[#f5f2eb] bg-[#faf8f5] p-3 rounded-2xl space-y-2">
            <span className="text-[10px] font-extrabold text-[#78716c] uppercase block">
              🧪 Test Live Notification & SMS Pipeline
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleTestTrigger('weather')}
                disabled={simulating}
                className="px-3 py-1.5 bg-white border border-[#e7e5e4] hover:bg-[#f5f2eb] rounded-xl text-[11px] font-bold text-[#ea580c] transition active:scale-98"
              >
                Simulate Rain Spike (&gt;70%)
              </button>
              <button
                type="button"
                onClick={() => handleTestTrigger('price')}
                disabled={simulating}
                className="px-3 py-1.5 bg-white border border-[#e7e5e4] hover:bg-[#f5f2eb] rounded-xl text-[11px] font-bold text-[#16a34a] transition active:scale-98"
              >
                Simulate Wheat Surge (+6%)
              </button>
              <button
                type="button"
                onClick={handleTestSms}
                disabled={simulating}
                className="px-3 py-1.5 bg-[#14532d] text-white rounded-xl text-[11px] font-bold hover:bg-[#052e16] transition active:scale-98 flex items-center gap-1"
              >
                <span>📱 Dispatch Test SMS</span>
              </button>
            </div>
            {smsResult && (
              <div className="text-[11px] font-bold text-[#14532d] bg-white p-2 rounded-xl border border-[#e7e5e4]">
                {smsResult}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="px-4 py-2 font-bold text-[#78716c] hover:bg-[#f5f2eb] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-extrabold text-white bg-[#14532d] hover:bg-[#052e16] rounded-xl shadow-xs transition btn-tap"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
