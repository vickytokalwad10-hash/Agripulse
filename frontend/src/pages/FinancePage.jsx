import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../context/NetworkContext';
import { cacheData, getCachedData } from '../services/offlineDb';

export default function FinancePage() {
  const { t } = useLanguage();
  const { isOnline } = useNetwork();
  const [activeTab, setActiveTab] = useState('kcc'); // kcc, marketplace, literacy

  // KCC State
  const [landAcres, setLandAcres] = useState(8.0);
  const [primaryCrop, setPrimaryCrop] = useState('Wheat');
  const [irrigationStatus, setIrrigationStatus] = useState('Irrigated');
  const [existingLoan, setExistingLoan] = useState(0);
  const [kccResult, setKccResult] = useState(null);
  const [kccLoading, setKccLoading] = useState(false);

  // Marketplace & Tips State
  const [lenders, setLenders] = useState([]);
  const [tips, setTips] = useState([]);

  useEffect(() => {
    calculateKcc();
    fetchLenders();
    fetchTips();
  }, []);

  const calculateKcc = async () => {
    setKccLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/finance/kcc-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          land_acres: parseFloat(landAcres),
          primary_crop: primaryCrop,
          irrigation_status: irrigationStatus,
          existing_loan_balance: parseFloat(existingLoan) || 0
        })
      });
      if (res.ok) {
        const data = await res.json();
        setKccResult(data.calculation);
      }
    } catch (e) {
      // Local fallback calculation
      const base = primaryCrop === 'Sugarcane' ? 65000 : primaryCrop === 'Cotton' ? 42000 : 36800;
      const cropComp = base * landAcres;
      const total = cropComp * 1.3;
      setKccResult({
        scale_of_finance_per_acre: base,
        crop_component: cropComp,
        post_harvest_consumption_10pct: cropComp * 0.1,
        asset_maintenance_20pct: cropComp * 0.2,
        first_year_eligible_limit: total,
        five_year_revolving_limit: total * 1.5,
        net_disbursable_limit: Math.max(0, total - existingLoan),
        interest_subvention_rate: '4.0% p.a. under Govt 3% Prompt Repayment Subsidy',
        collateral_requirement: 'Nil (Collateral-free KCC up to ₹1.60 Lakh)'
      });
    } finally {
      setKccLoading(false);
    }
  };

  const fetchLenders = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/finance/lenders');
      if (res.ok) {
        const data = await res.json();
        setLenders(data.lenders || []);
        await cacheData('finance_lenders', data.lenders);
      }
    } catch (e) {
      const cached = await getCachedData('finance_lenders');
      if (cached) setLenders(cached);
    }
  };

  const fetchTips = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/finance/literacy-tips');
      if (res.ok) {
        const data = await res.json();
        setTips(data.tips || []);
        await cacheData('finance_tips', data.tips);
      }
    } catch (e) {
      const cached = await getCachedData('finance_tips');
      if (cached) setTips(cached);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span className="material-symbols-outlined text-brand-600 text-[32px]">credit_score</span>
          {t('finance.title')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl mt-1">
          {t('finance.subtitle')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#e7e5e4] pb-2.5 overflow-x-auto no-scrollbar">
        {[
          { id: 'kcc', label: t('finance.eligibilityCalc'), icon: 'calculate' },
          { id: 'marketplace', label: t('finance.kccLimit'), icon: 'account_balance' },
          { id: 'literacy', label: t('finance.requiredDocs'), icon: 'lightbulb' }
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

      {/* TAB 1: KCC Calculator */}
      {activeTab === 'kcc' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 glass-card p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-600">tune</span>
              {t('finance.scaleOfFinance')}
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('finance.farmLandAcres')}</label>
                <input
                  type="number"
                  step="0.5"
                  value={landAcres}
                  onChange={(e) => setLandAcres(parseFloat(e.target.value) || 1)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('finance.primaryCrop')}</label>
                <select
                  value={primaryCrop}
                  onChange={(e) => setPrimaryCrop(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="Wheat">Wheat (Sharbati / Dara)</option>
                  <option value="Paddy">Basmati / Paddy</option>
                  <option value="Mustard">Mustard (Oilseed)</option>
                  <option value="Soybean">Soybean</option>
                  <option value="Cotton">Bt Cotton</option>
                  <option value="Sugarcane">Sugarcane</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('finance.irrigationAvailability')}</label>
                <select
                  value={irrigationStatus}
                  onChange={(e) => setIrrigationStatus(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="Irrigated">100% Assured Irrigation (Canal / Tube-well)</option>
                  <option value="Rainfed">Rainfed / Semi-Arid</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('finance.existingLoans')}</label>
                <input
                  type="number"
                  value={existingLoan}
                  onChange={(e) => setExistingLoan(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <button
                onClick={calculateKcc}
                disabled={kccLoading}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs transition active:scale-95 mt-2"
              >
                {kccLoading ? '...' : t('finance.calculateBtn')}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {kccResult && (
              <div className="space-y-4">
                <div className="hero-gradient-card p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-brand-200 uppercase tracking-wider block">
                        {t('finance.eligibleLimit')}
                      </span>
                      <h4 className="text-3xl font-extrabold text-white mt-0.5">
                        ₹{kccResult.first_year_eligible_limit.toLocaleString('en-IN')}
                      </h4>
                      <p className="text-xs text-brand-100 mt-1">
                        {t('finance.revolvingLimit')}: ₹{kccResult.five_year_revolving_limit.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-white/20 text-white text-xs font-extrabold rounded-full backdrop-blur-xs">
                      4.0% Subsidized ROI
                    </span>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/20 grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-black/20 p-2.5 rounded-xl">
                      <span className="text-[10px] text-brand-200 block">{t('finance.cropComponent')}</span>
                      <span className="font-extrabold text-white">₹{kccResult.crop_component.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="bg-black/20 p-2.5 rounded-xl">
                      <span className="text-[10px] text-brand-200 block">{t('finance.householdComp')}</span>
                      <span className="font-extrabold text-white">₹{kccResult.post_harvest_consumption_10pct.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="bg-black/20 p-2.5 rounded-xl">
                      <span className="text-[10px] text-brand-200 block">{t('finance.assetRepairs')}</span>
                      <span className="font-extrabold text-white">₹{kccResult.asset_maintenance_20pct.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>{kccResult.interest_subvention_rate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="material-symbols-outlined text-[18px]">shield</span>
                    <span>{kccResult.collateral_requirement}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Marketplace */}
      {activeTab === 'marketplace' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {lenders.map((l) => (
            <div key={l.id} className="glass-card p-5 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-500">{l.type}</span>
                  <span className="text-xs font-extrabold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">{l.interest_rate}</span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900">{l.bank_name}</h4>
                <p className="text-xs text-slate-600 mt-1">{l.tagline}</p>
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs">
                  <p className="text-slate-500">Max Limit: <strong className="text-slate-900">{l.max_limit}</strong></p>
                  <p className="text-slate-500">Processing: <strong className="text-slate-900">{l.processing_time}</strong></p>
                </div>
              </div>
              <button className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition">
                Apply via Bank Branch
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Required Documents & Literacy */}
      {activeTab === 'literacy' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tips.map((tItem) => (
            <div key={tItem.id} className="glass-card p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-600 text-[20px]">{tItem.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700">{tItem.category}</span>
              </div>
              <h4 className="text-sm font-extrabold text-slate-900">{tItem.title}</h4>
              <p className="text-xs text-slate-600">{tItem.summary}</p>
              <p className="text-xs font-bold text-slate-800 pt-2 border-t border-slate-100">💡 {tItem.action_point}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
