import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

import { useLanguage } from '../context/LanguageContext';

export default function SimulatorPage() {
  const { t, formatCurrency } = useLanguage();
  const [fertilizerCost, setFertilizerCost] = useState(4800); // ₹ / acre
  const [expectedYield, setExpectedYield] = useState(24); // Quintals / acre
  const [marketPrice, setMarketPrice] = useState(2840); // ₹ / quintal
  const [farmAcres, setFarmAcres] = useState(12.5); // Total Acres

  // Dynamic Math Calculations
  const grossRevenue = Math.round(farmAcres * expectedYield * marketPrice);
  const totalInputCost = Math.round(farmAcres * (fertilizerCost + 3200 + 1500));
  const netProfit = grossRevenue - totalInputCost;
  const marginPct = ((netProfit / grossRevenue) * 100).toFixed(1);
  const roiPct = ((netProfit / totalInputCost) * 100).toFixed(1);

  // Scenario comparisons for Chart
  const scenarioA = Math.round(netProfit * 0.72);
  const scenarioB = Math.round(netProfit * 0.9);
  const currentScenario = netProfit;
  const scenarioC = Math.round(netProfit * 1.18);

  const chartData = {
    labels: [
      t('simulator.chartScenarioA'),
      t('simulator.chartScenarioB'),
      t('simulator.chartCurrentPlan'),
      t('simulator.chartScenarioC')
    ],
    datasets: [
      {
        label: t('simulator.netProjectedMargin') + ' (₹)',
        data: [scenarioA, scenarioB, currentScenario, scenarioC],
        backgroundColor: [
          'rgba(239, 68, 68, 0.45)',
          'rgba(20, 83, 45, 0.45)',
          'rgba(20, 83, 45, 0.85)',
          'rgba(20, 83, 45, 0.65)'
        ],
        borderColor: [
          '#ef4444',
          '#14532d',
          '#052e16',
          '#16a34a'
        ],
        borderWidth: 1.5,
        borderRadius: 8,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1c1917',
        titleFont: { family: 'Plus Jakarta Sans', size: 11, weight: 'bold' },
        bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
        callbacks: {
          label: (context) => `${t('simulator.netProjectedMargin')}: ₹${context.raw.toLocaleString('en-IN')}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Plus Jakarta Sans', size: 10 }, color: '#78716c' }
      },
      y: {
        grid: { color: 'rgba(231, 229, 228, 0.7)', borderDash: [3, 3] },
        ticks: {
          font: { family: 'Plus Jakarta Sans', size: 10 },
          color: '#78716c',
          callback: (value) => `₹${(value / 1000).toFixed(0)}k`
        }
      }
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#e7e5e4]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#14532d] animate-pulse"></span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#14532d]">
              {t('simulator.title')}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1c1917] tracking-tight font-editorial mt-0.5">
            {t('simulator.title')}
          </h2>
          <p className="text-xs sm:text-sm text-[#57534e] max-w-2xl mt-0.5">
            {t('simulator.subtitle')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left Column: Sliders */}
        <div className="xl:col-span-4 space-y-3 sm:space-y-4">
          <div className="paper-card p-4 sm:p-5">
            <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-[#f5f2eb]">
              <h3 className="text-sm font-extrabold text-[#1c1917] font-editorial">
                {t('simulator.inputVariables')}
              </h3>
            </div>

            {/* Quick 1-Tap Scenario Presets */}
            <div className="mb-4">
              <span className="text-[10px] font-bold text-[#78716c] uppercase tracking-wider block mb-1.5">{t('simulator.scenarioPresets')}:</span>
              <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setFertilizerCost(5800);
                    setExpectedYield(18);
                    setMarketPrice(2600);
                    setFarmAcres(10);
                  }}
                  className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-800 hover:bg-red-100 transition text-center"
                >
                  🌧️ {t('simulator.scenarioStress')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFertilizerCost(4800);
                    setExpectedYield(24);
                    setMarketPrice(2840);
                    setFarmAcres(12.5);
                  }}
                  className="p-1.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200 transition text-center"
                >
                  ⚖️ {t('simulator.scenarioBaseline')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFertilizerCost(4200);
                    setExpectedYield(28);
                    setMarketPrice(3200);
                    setFarmAcres(15);
                  }}
                  className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition text-center"
                >
                  🚀 {t('simulator.scenarioHighYield')}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Slider 1: Fertilizer Cost */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <label className="text-[#44403c]">{t('simulator.fertilizerCostLabel')}</label>
                  <span className="text-[#1c1917] bg-[#f5f2eb] px-2 py-0.5 rounded-lg border border-[#e7e5e4]">
                    ₹{fertilizerCost}
                  </span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="8000"
                  step="100"
                  value={fertilizerCost}
                  onChange={(e) => setFertilizerCost(Number(e.target.value))}
                  className="w-full accent-[#14532d] cursor-pointer h-2 bg-[#e7e5e4] rounded-lg"
                />
              </div>

              {/* Slider 2: Expected Yield */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <label className="text-[#44403c]">{t('simulator.expectedYieldLabel')}</label>
                  <span className="text-[#1c1917] bg-[#f5f2eb] px-2 py-0.5 rounded-lg border border-[#e7e5e4]">
                    {expectedYield} qtl
                  </span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="36"
                  step="1"
                  value={expectedYield}
                  onChange={(e) => setExpectedYield(Number(e.target.value))}
                  className="w-full accent-[#14532d] cursor-pointer h-2 bg-[#e7e5e4] rounded-lg"
                />
              </div>

              {/* Slider 3: Target Mandi Price */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <label className="text-[#44403c]">{t('simulator.targetMandiLabel')}</label>
                  <span className="text-[#14532d] bg-[#f5fdf7] px-2 py-0.5 rounded-lg border border-[#bbf7d0]">
                    ₹{marketPrice}
                  </span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="4000"
                  step="20"
                  value={marketPrice}
                  onChange={(e) => setMarketPrice(Number(e.target.value))}
                  className="w-full accent-[#14532d] cursor-pointer h-2 bg-[#e7e5e4] rounded-lg"
                />
              </div>

              {/* Slider 4: Land Holdings */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <label className="text-[#44403c]">{t('simulator.operationalAcreage')}</label>
                  <span className="text-[#1c1917] bg-[#f5f2eb] px-2 py-0.5 rounded-lg border border-[#e7e5e4]">
                    {farmAcres} {t('common.acres')}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="0.5"
                  value={farmAcres}
                  onChange={(e) => setFarmAcres(Number(e.target.value))}
                  className="w-full accent-[#14532d] cursor-pointer h-2 bg-[#e7e5e4] rounded-lg"
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#f5f2eb] flex justify-between items-center text-xs">
              <span className="text-[11px] text-[#78716c]">{t('simulator.rabiModel2026')}</span>
              <span className="font-extrabold text-[#14532d] bg-[#f5fdf7] border border-[#bbf7d0] px-2 py-0.5 rounded-full text-[10px]">
                {t('simulator.liveDynamicMath')}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Financial Scorecards & Projected Margin Chart */}
        <div className="xl:col-span-8 space-y-3 sm:space-y-4">
          {/* Scorecards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="paper-card p-3 sm:p-4">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#78716c] block mb-1">
                {t('simulator.grossRevenue')}
              </span>
              <div className="text-base sm:text-lg font-extrabold text-[#1c1917]">₹{grossRevenue.toLocaleString('en-IN')}</div>
            </div>

            <div className="paper-card p-3 sm:p-4">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#78716c] block mb-1">
                {t('simulator.inputExpenses')}
              </span>
              <div className="text-base sm:text-lg font-extrabold text-[#78716c]">₹{totalInputCost.toLocaleString('en-IN')}</div>
            </div>

            <div className="paper-card p-3 sm:p-4 bg-[#f5fdf7] border border-[#bbf7d0]">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#14532d] block mb-1">
                {t('simulator.netProfit')}
              </span>
              <div className="text-base sm:text-lg font-extrabold text-[#14532d]">₹{netProfit.toLocaleString('en-IN')}</div>
            </div>

            <div className="paper-card p-3 sm:p-4">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#78716c] block mb-1">
                {t('simulator.returnOnCapital')}
              </span>
              <div className="text-base sm:text-lg font-extrabold text-[#14532d]">+{roiPct}%</div>
            </div>
          </div>

          {/* Projected Margin Bar Chart */}
          <div className="paper-card p-4 sm:p-5">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#f5f2eb]">
              <div>
                <h3 className="text-sm font-extrabold text-[#1c1917] font-editorial">{t('simulator.projectedScenarios')}</h3>
                <p className="text-[10px] text-[#78716c]">{t('simulator.comparativeYield')}</p>
              </div>
              <span className="bg-[#f5fdf7] border border-[#bbf7d0] text-[#14532d] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">trending_up</span> {t('simulator.optimized')}
              </span>
            </div>

            <div className="h-60 sm:h-72 w-full">
              <Bar key={`${fertilizerCost}-${expectedYield}-${marketPrice}-${farmAcres}`} data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
