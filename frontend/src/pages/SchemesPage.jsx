import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../context/NetworkContext';
import { cacheData, getCachedData, enqueueOfflineAction } from '../services/offlineDb';

export default function SchemesPage() {
  const { t } = useLanguage();
  const { isOnline, refreshPendingCount } = useNetwork();
  const [activeTab, setActiveTab] = useState('pmkisan'); // pmkisan, pmfby, soil, subsidies

  // PM-KISAN State
  const [kisanId, setKisanId] = useState('9800000001');
  const [kisanData, setKisanData] = useState(null);
  const [kisanLoading, setKisanLoading] = useState(false);

  // PMFBY Claims State
  const [claims, setClaims] = useState([]);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimCrop, setClaimCrop] = useState('Sharbati Wheat');
  const [claimSeason, setClaimSeason] = useState('Rabi 2025-26');
  const [claimAcres, setClaimAcres] = useState('4.5');
  const [claimCalamity, setClaimCalamity] = useState('Hailstorm & Unseasonal Rain');
  const [claimLossPct, setClaimLossPct] = useState('65');
  const [claimToast, setClaimToast] = useState(null);

  // Soil Health Card State
  const [soilPh, setSoilPh] = useState(6.8);
  const [soilN, setSoilN] = useState(240); // kg/ha
  const [soilP, setSoilP] = useState(22);  // kg/ha
  const [soilK, setSoilK] = useState(180); // kg/ha
  const [soilOc, setSoilOc] = useState(0.45); // %
  const [soilCrop, setSoilCrop] = useState('Wheat');
  const [soilAdvisory, setSoilAdvisory] = useState(null);
  const [soilLoading, setSoilLoading] = useState(false);

  // Subsidy Feed State
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [subsidies, setSubsidies] = useState([]);

  useEffect(() => {
    fetchPMKisan();
    fetchClaims();
    fetchSubsidies();
    runSoilAnalysis();
  }, []);

  const fetchPMKisan = async () => {
    setKisanLoading(true);
    try {
      if (!isOnline) {
        const cached = await getCachedData('pmkisan_status');
        if (cached) {
          setKisanData(cached);
          setKisanLoading(false);
          return;
        }
      }
      const res = await fetch('http://127.0.0.1:8000/api/schemes/pm-kisan/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: kisanId })
      });
      if (res.ok) {
        const data = await res.json();
        setKisanData(data.beneficiary);
        await cacheData('pmkisan_status', data.beneficiary);
      }
    } catch (e) {
      // Offline fallback mock
      const fallback = {
        name: 'Ramesh Devidas Patil',
        state: 'Maharashtra',
        district: 'Nashik',
        village: 'Dindori',
        aadhaar_status: 'Aadhaar Authenticated & Bank Account Seeded',
        ekyc_status: 'Done (Active)',
        land_seeding: 'YES',
        total_installments_received: 18,
        total_amount_credited: 36000,
        next_expected_installment: '19th Installment (₹2,000)',
        next_expected_date: 'March 15, 2026',
        recent_history: [
          { installment: '18th', amount: 2000, date: '2025-11-20', bank: 'SBI - A/C **4589', status: 'Payment Succeeded' },
          { installment: '17th', amount: 2000, date: '2025-06-18', bank: 'SBI - A/C **4589', status: 'Payment Succeeded' }
        ]
      };
      setKisanData(fallback);
    } finally {
      setKisanLoading(false);
    }
  };

  const fetchClaims = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/schemes/pmfby/claims');
      if (res.ok) {
        const data = await res.json();
        setClaims(data.claims || []);
        await cacheData('pmfby_claims', data.claims);
      }
    } catch (e) {
      const cached = await getCachedData('pmfby_claims');
      if (cached) setClaims(cached);
    }
  };

  const handleFileClaim = async (e) => {
    e.preventDefault();
    const payload = {
      farmer_name: 'Ramesh Devidas Patil',
      phone: '9800000001',
      policy_number: `PMFBY/MH/2026/${Math.floor(100000 + Math.random() * 900000)}`,
      crop_name: claimCrop,
      season: claimSeason,
      affected_acres: parseFloat(claimAcres),
      calamity_type: claimCalamity,
      loss_percentage: parseInt(claimLossPct),
      village_district: 'Dindori, Nashik (MH)',
      bank_account_last4: '4589'
    };

    if (!isOnline) {
      await enqueueOfflineAction('SUBMIT_PMFBY_CLAIM', payload);
      await refreshPendingCount();
      setShowClaimModal(false);
      setClaimToast('📡 Offline Mode: Claim saved to local queue. Will auto-sync when online.');
      setTimeout(() => setClaimToast(null), 5000);
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/api/schemes/pmfby/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setClaims([data.claim, ...claims]);
        setShowClaimModal(false);
        setClaimToast(`🎉 Insurance Claim #${data.claim.claim_id} registered with National Crop Insurance Portal!`);
        setTimeout(() => setClaimToast(null), 5000);
      }
    } catch (err) {
      setClaimToast('Error filing claim. Please try again.');
    }
  };

  const runSoilAnalysis = async () => {
    setSoilLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/schemes/soil-health/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ph_level: soilPh,
          nitrogen_level: soilN,
          phosphorus_level: soilP,
          potassium_level: soilK,
          organic_carbon_pct: soilOc,
          target_crop: soilCrop
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSoilAdvisory(data);
      }
    } catch (e) {
      // Local calculation fallback
      setSoilAdvisory({
        soil_summary: {
          ph_status: soilPh < 6.5 ? 'Acidic' : 'Optimal Neutral',
          nitrogen_status: soilN < 280 ? 'Deficient' : 'Optimal',
          phosphorus_status: soilP < 25 ? 'Deficient' : 'Optimal',
          potassium_status: 'Optimal',
          soil_health_index: 78.4
        },
        recommendations: [
          'Urea: 110 kg/acre (split into 3 doses)',
          'DAP: 55 kg/acre as basal dose',
          'FYM / Vermicompost: 2.5 tonnes/acre'
        ]
      });
    } finally {
      setSoilLoading(false);
    }
  };

  const fetchSubsidies = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/schemes/subsidies?state=${selectedState}&category=${selectedCategory}`);
      if (res.ok) {
        const data = await res.json();
        setSubsidies(data.subsidies || []);
        await cacheData('subsidies_feed', data.subsidies);
      }
    } catch (e) {
      const cached = await getCachedData('subsidies_feed');
      if (cached) setSubsidies(cached);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {claimToast && (
        <div className="bg-brand-700 text-white px-4 py-3 rounded-2xl shadow-floating flex items-center justify-between text-xs font-bold animate-in zoom-in-95">
          <span>{claimToast}</span>
          <button onClick={() => setClaimToast(null)} className="text-white hover:opacity-80">✕</button>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span className="material-symbols-outlined text-brand-600 text-[32px]">account_balance</span>
          {t('schemes.title')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl mt-1">
          {t('schemes.subtitle')}
        </p>
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="flex gap-2 border-b border-[#e7e5e4] pb-2.5 overflow-x-auto no-scrollbar">
        {[
          { id: 'pmkisan', label: t('schemes.pmKisan'), icon: 'payments' },
          { id: 'pmfby', label: t('schemes.pmfby'), icon: 'shield' },
          { id: 'soil', label: t('schemes.soilHealth'), icon: 'science' },
          { id: 'subsidies', label: t('schemes.subsidies'), icon: 'campaign' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap active:scale-95 ${
              activeTab === tab.id
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: PM-KISAN Installment Tracker */}
      {activeTab === 'pmkisan' && (
        <div className="space-y-5">
          {/* Search Card */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-600 text-[20px]">search</span>
              {t('schemes.lookupTitle')}
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={kisanId}
                onChange={(e) => setKisanId(e.target.value)}
                placeholder={t('schemes.searchPlaceholder')}
                className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-brand-600"
              />
              <button
                onClick={fetchPMKisan}
                disabled={kisanLoading}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95"
              >
                {kisanLoading ? '...' : t('schemes.checkStatus')}
              </button>
            </div>
          </div>

          {/* Beneficiary Card */}
          {kisanData && (
            <div className="space-y-4">
              <div className="hero-gradient-card p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-brand-200 uppercase tracking-wider block">{t('schemes.beneficiaryFarmer')}</span>
                    <h4 className="text-2xl font-extrabold text-white">{kisanData.name}</h4>
                    <p className="text-xs text-brand-100 mt-0.5">📍 {kisanData.village}, {kisanData.district} ({kisanData.state})</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-brand-200 uppercase tracking-wider block">{t('schemes.totalCredited')}</span>
                    <span className="text-3xl font-extrabold text-white">₹{kisanData.total_amount_credited.toLocaleString('en-IN')}</span>
                    <span className="text-[11px] text-brand-200 block">{kisanData.total_installments_received} {t('schemes.installments')}</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-black/20 p-2.5 rounded-xl">
                    <span className="text-[10px] text-brand-200 block">{t('schemes.ekycStatus')}</span>
                    <span className="font-bold text-emerald-300">✅ {kisanData.ekyc_status}</span>
                  </div>
                  <div className="bg-black/20 p-2.5 rounded-xl">
                    <span className="text-[10px] text-brand-200 block">{t('schemes.landSeeding')}</span>
                    <span className="font-bold text-emerald-300">✅ {kisanData.land_seeding}</span>
                  </div>
                  <div className="bg-black/20 p-2.5 rounded-xl col-span-2">
                    <span className="text-[10px] text-brand-200 block">{t('schemes.nextInstallment')}</span>
                    <span className="font-bold text-white">{kisanData.next_expected_installment} • Expected {kisanData.next_expected_date}</span>
                  </div>
                </div>
              </div>

              {/* Installment History */}
              <div className="glass-card p-5">
                <h4 className="text-sm font-extrabold text-slate-900 mb-3">{t('schemes.recentHistory')}</h4>
                <div className="space-y-2">
                  {kisanData.recent_history.map((h, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                          ₹
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{h.installment} {t('schemes.pmKisan')} — ₹{h.amount}</p>
                          <p className="text-[11px] text-slate-500">{h.date} • {h.bank}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        {t('schemes.paymentSucceeded')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PMFBY & Claim Tracker */}
      {activeTab === 'pmfby' && (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">{t('schemes.pmfby')}</h3>
              <p className="text-xs text-slate-500">Intimate loss within 72 hours of localized calamity as per National Crop Insurance rules</p>
            </div>
            <button
              onClick={() => setShowClaimModal(true)}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              {t('schemes.pmfby')}
            </button>
          </div>

          <div className="space-y-4">
            {claims.map((c) => (
              <div key={c.claim_id} className="glass-card p-5 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-slate-100 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-900">Claim #{c.claim_id}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        {c.status}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">Policy: {c.policy_number} • {c.crop_name} ({c.season})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Payout</span>
                    <span className="text-lg font-extrabold text-brand-700">₹{c.estimated_payout.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* 4-Stage Progress Tracker */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {c.stages.map((stage, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border text-xs ${
                        stage.completed
                          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                          : 'bg-slate-50 border-slate-200/60 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <span className="material-symbols-outlined text-[16px] text-emerald-600">
                          {stage.completed ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span className="font-bold truncate">Stage {idx + 1}</span>
                      </div>
                      <p className="text-[11px] font-semibold truncate">{stage.stage}</p>
                      <span className="text-[10px] opacity-75">{stage.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Claim Filing Modal */}
          {showClaimModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-floating border border-slate-200 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base font-extrabold text-slate-900">File PMFBY Crop Loss Claim</h4>
                  <button onClick={() => setShowClaimModal(false)} className="text-slate-400 hover:text-slate-900">✕</button>
                </div>

                <form onSubmit={handleFileClaim} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Insured Crop</label>
                    <select
                      value={claimCrop}
                      onChange={(e) => setClaimCrop(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="Sharbati Wheat">Sharbati Wheat</option>
                      <option value="Basmati Rice">Basmati Rice</option>
                      <option value="Mustard (Black)">Mustard (Black)</option>
                      <option value="Soybean">Soybean</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">{t('finance.farmLandAcres')}</label>
                      <input
                        type="number"
                        step="0.5"
                        value={claimAcres}
                        onChange={(e) => setClaimAcres(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Estimated Loss (%)</label>
                      <input
                        type="number"
                        value={claimLossPct}
                        onChange={(e) => setClaimLossPct(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Cause of Loss / Calamity</label>
                    <select
                      value={claimCalamity}
                      onChange={(e) => setClaimCalamity(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="Hailstorm & Unseasonal Rain">Hailstorm & Unseasonal Rain</option>
                      <option value="Severe Inundation / Flooding">Severe Inundation / Flooding</option>
                      <option value="Drought / Dry Spell">Drought / Dry Spell</option>
                      <option value="Pest Attack (Locusts/Rust)">Pest Attack (Locusts/Rust)</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowClaimModal(false)}
                      className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs active:scale-95"
                    >
                      Submit Intimation
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Soil Health Card & Auto-Fertilizer Prescription */}
      {activeTab === 'soil' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 glass-card p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-600">tune</span>
              {t('schemes.soilHealth')}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>Soil pH: {soilPh}</span>
                  <span className="text-slate-400">Neutral (6.5 - 7.5)</span>
                </div>
                <input
                  type="range"
                  min="4.5"
                  max="9.0"
                  step="0.1"
                  value={soilPh}
                  onChange={(e) => setSoilPh(parseFloat(e.target.value))}
                  className="w-full accent-brand-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>Available Nitrogen (N): {soilN} kg/ha</span>
                  <span className="text-slate-400">Optimum (280-560)</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="650"
                  value={soilN}
                  onChange={(e) => setSoilN(parseInt(e.target.value))}
                  className="w-full accent-brand-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>Available Phosphorus (P): {soilP} kg/ha</span>
                  <span className="text-slate-400">Optimum (25-50)</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="70"
                  value={soilP}
                  onChange={(e) => setSoilP(parseInt(e.target.value))}
                  className="w-full accent-brand-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>Available Potassium (K): {soilK} kg/ha</span>
                  <span className="text-slate-400">Optimum (150-300)</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="400"
                  value={soilK}
                  onChange={(e) => setSoilK(parseInt(e.target.value))}
                  className="w-full accent-brand-600"
                />
              </div>

              <button
                onClick={runSoilAnalysis}
                disabled={soilLoading}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs transition active:scale-95 mt-2"
              >
                {soilLoading ? '...' : t('schemes.soilHealth')}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {soilAdvisory && (
              <div className="glass-card p-5 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Health Rating</span>
                    <h4 className="text-lg font-extrabold text-slate-900">
                      Soil Health Index: <span className="text-brand-700">{soilAdvisory.soil_summary.soil_health_index}/100</span>
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                    {soilAdvisory.soil_summary.ph_status}
                  </span>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    🌾 ICAR Prescribed Fertilizer Dosages for {soilCrop}
                  </h5>
                  <ul className="space-y-2">
                    {soilAdvisory.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-800">
                        <span className="material-symbols-outlined text-brand-600 text-[18px]">eco</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Subsidies */}
      {activeTab === 'subsidies' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">{t('schemes.subsidies')}</h3>
              <p className="text-xs text-slate-500">Apply directly through official DBT portals with verified Aadhaar seeding</p>
            </div>

            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  fetchSubsidies();
                }}
                className="p-2 text-xs font-bold bg-white border border-slate-200 rounded-xl shadow-xs"
              >
                <option value="All">All Categories</option>
                <option value="Solar Pump">Solar Pump (KUSUM)</option>
                <option value="Irrigation">Micro-Irrigation (Drip)</option>
                <option value="Equipment">Farm Machinery (SMAM)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subsidies.map((sub) => (
              <div key={sub.id} className="glass-card p-5 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold bg-brand-100 text-brand-800 px-2.5 py-0.5 rounded-full">
                      {sub.category}
                    </span>
                    <span className="text-xs font-bold text-slate-500">📍 {sub.state}</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900 mt-1">{sub.title}</h4>
                  <p className="text-xs text-slate-600 mt-2 font-semibold">
                    🎁 <strong>Subsidy:</strong> {sub.subsidy_pct}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    📋 <strong>Eligibility:</strong> {sub.eligibility}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-medium">Apply before: {sub.last_date}</span>
                  <a
                    href={sub.apply_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
                  >
                    Apply on Govt Portal ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
