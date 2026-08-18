import React, { useState } from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

import { useLanguage } from '../context/LanguageContext';

export default function WeatherPage() {
  const { t } = useLanguage();
  const [selectedDay, setSelectedDay] = useState(0);

  const forecastDays = [
    { day: 'Today', date: '18 Aug', temp: '28°C', condition: 'Sunny / Mild', rain: '10%', wind: '8 km/h', icon: 'sunny', safety: 'Optimal' },
    { day: 'Wed', date: '19 Aug', temp: '29°C', condition: 'Partly Cloudy', rain: '20%', wind: '12 km/h', icon: 'partly_cloudy_day', safety: 'Optimal' },
    { day: 'Thu', date: '20 Aug', temp: '25°C', condition: 'Moderate Rain', rain: '75%', wind: '22 km/h', icon: 'rainy', safety: 'High Risk' },
    { day: 'Fri', date: '21 Aug', temp: '24°C', condition: 'Heavy Showers', rain: '85%', wind: '28 km/h', icon: 'thunderstorm', safety: 'Hazard' },
    { day: 'Sat', date: '22 Aug', temp: '26°C', condition: 'Scattered Clouds', rain: '30%', wind: '14 km/h', icon: 'cloud', safety: 'Moderate' },
    { day: 'Sun', date: '23 Aug', temp: '28°C', condition: 'Clear Sky', rain: '5%', wind: '9 km/h', icon: 'sunny', safety: 'Optimal' },
    { day: 'Mon', date: '24 Aug', temp: '30°C', condition: 'Warm & Dry', rain: '0%', wind: '7 km/h', icon: 'sunny', safety: 'Optimal' }
  ];

  const currentDay = forecastDays[selectedDay];

  const radarData = {
    labels: ['Heat Stress', 'Pest Risk', 'Frost Risk', 'Evapotranspiration', 'Soil Drought', 'Wind Drift'],
    datasets: [
      {
        label: 'Current Field Risk Index',
        data: selectedDay === 2 || selectedDay === 3 ? [45, 88, 10, 40, 20, 85] : [65, 30, 15, 75, 42, 25],
        backgroundColor: 'rgba(20, 83, 45, 0.22)',
        borderColor: '#14532d',
        pointBackgroundColor: '#14532d',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#14532d',
        borderWidth: 2.5
      }
    ]
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1c1917',
        titleFont: { family: 'Plus Jakarta Sans', size: 11, weight: 'bold' },
        bodyFont: { family: 'Plus Jakarta Sans', size: 11 }
      }
    },
    scales: {
      r: {
        angleLines: { color: '#e7e5e4' },
        grid: { color: '#f5f2eb' },
        pointLabels: {
          font: { family: 'Plus Jakarta Sans', size: 10, weight: 'bold' },
          color: '#57534e'
        },
        ticks: { display: false, maxTicksLimit: 5 }
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
              {t('weather.title')}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1c1917] tracking-tight font-editorial mt-0.5">
            {t('weather.title')}
          </h2>
          <p className="text-xs sm:text-sm text-[#57534e] max-w-2xl mt-0.5">
            {t('weather.subtitle')}
          </p>
        </div>
        <span className="text-xs font-bold text-[#78716c]">Karnal District • Live</span>
      </div>

      {/* Spraying Safety Index Banner */}
      <div className="paper-card p-4 sm:p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6 border-l-4 border-l-[#14532d]">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[#14532d] text-[22px]">agriculture</span>
            <h3 className="text-sm sm:text-base font-extrabold text-[#1c1917] font-editorial">
              {t('weather.sprayingSafety')}
            </h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f5fdf7] text-[#14532d] border border-[#bbf7d0]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#14532d] animate-pulse"></span>
              {t('weather.liveSafetyIndex')}
            </span>
          </div>
          <p className="text-xs text-[#57534e] mb-3">
            {t('weather.optimalWindowDesc')}
          </p>

          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <div className="bg-[#faf8f5] px-2.5 py-1.5 rounded-xl border border-[#e7e5e4] flex items-center gap-1.5 text-[#1c1917]">
              <span className="material-symbols-outlined text-[16px] text-[#14532d]">air</span>
              {t('weather.windDrift')}: <span className="text-[#14532d]">8 km/h (Safe)</span>
            </div>
            <div className="bg-[#faf8f5] px-2.5 py-1.5 rounded-xl border border-[#e7e5e4] flex items-center gap-1.5 text-[#1c1917]">
              <span className="material-symbols-outlined text-[16px] text-blue-700">thermostat</span>
              {t('weather.temperature')}: <span className="text-[#1c1917]">28°C</span>
            </div>
            <div className="bg-[#faf8f5] px-2.5 py-1.5 rounded-xl border border-[#e7e5e4] flex items-center gap-1.5 text-[#1c1917]">
              <span className="material-symbols-outlined text-[16px] text-[#b45309]">water_drop</span>
              {t('weather.humidity')}: <span className="text-[#1c1917]">54%</span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3 bg-[#f5fdf7] px-4 py-3 rounded-2xl border border-[#bbf7d0] w-full lg:w-auto">
          <span className="material-symbols-outlined text-[#14532d] text-[28px]">check_circle</span>
          <div>
            <span className="text-[9px] font-extrabold text-[#14532d] uppercase tracking-wider block">{t('weather.windowStatus')}</span>
            <span className="text-sm font-extrabold text-[#052e16]">{t('weather.recommendedToSpray')}</span>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast Strip: Scrollable on mobile */}
      <div className="flex sm:grid sm:grid-cols-4 lg:grid-cols-7 gap-2.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
        {forecastDays.map((item, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedDay(idx)}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer shrink-0 w-[140px] sm:w-auto ${
              selectedDay === idx
                ? 'bg-[#14532d] text-white border-[#14532d] shadow-sm'
                : 'paper-card hover:border-[#b45309]'
            }`}
          >
            <div className="flex justify-between items-center mb-1.5">
              <span className={`text-xs font-bold ${selectedDay === idx ? 'text-emerald-200' : 'text-[#78716c]'}`}>
                {item.day}
              </span>
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
            </div>
            <div className="text-lg font-extrabold mb-0.5">{item.temp}</div>
            <p className={`text-[10px] truncate mb-2 ${selectedDay === idx ? 'text-emerald-100' : 'text-[#78716c]'}`}>
              {item.condition}
            </p>
            <div className="flex items-center justify-between text-[9px] font-bold pt-1.5 border-t border-black/10">
              <span>Rain: {item.rain}</span>
              <span>{item.wind}</span>
            </div>
          </button>
        ))}
      </div>

      {/* 2-Column Grid: Radar Chart & Sub-surface Soil Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Agronomy Risk Radar */}
        <div className="lg:col-span-7 paper-card p-4 sm:p-5">
          <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-[#f5f2eb]">
            <div>
              <h3 className="text-sm font-extrabold text-[#1c1917] font-editorial">{t('weather.riskMatrix')}</h3>
              <p className="text-[11px] text-[#78716c]">6-factor stress analysis for {currentDay.day} ({currentDay.date})</p>
            </div>
            <span className="text-xs font-extrabold text-[#14532d] bg-[#f5fdf7] px-2.5 py-1 rounded-full border border-[#bbf7d0]">
              {currentDay.safety}
            </span>
          </div>

          <div className="h-[260px] sm:h-[300px] w-full flex items-center justify-center">
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>

        {/* Sub-surface Soil Moisture Sensors */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          <div className="paper-card p-4 sm:p-5 flex-1">
            <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-[#f5f2eb]">
              <span className="material-symbols-outlined text-[#14532d] text-[20px]">sensors</span>
              <h3 className="text-sm font-extrabold text-[#1c1917] font-editorial">
                {t('weather.soilMoistureTelemetry')}
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-bold text-[#1c1917] mb-1">
                  <span>{t('weather.topsoil')}</span>
                  <span className="text-[#14532d]">26.4% Moisture (Normal)</span>
                </div>
                <div className="w-full bg-[#f5f2eb] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#14532d] h-full rounded-full" style={{ width: '55%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-[#1c1917] mb-1">
                  <span>{t('weather.rootZone')}</span>
                  <span className="text-emerald-700">34.8% Moisture (Optimal)</span>
                </div>
                <div className="w-full bg-[#f5f2eb] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-[#1c1917] mb-1">
                  <span>{t('weather.deepSubsoil')}</span>
                  <span className="text-blue-700">42.1% Moisture (Saturated)</span>
                </div>
                <div className="w-full bg-[#f5f2eb] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Predictive Smart Irrigation Advice */}
          <div className="paper-card p-4 bg-[#faf8f5] border-l-4 border-l-[#b45309]">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[#b45309] text-[20px]">lightbulb</span>
              <h4 className="text-xs font-extrabold text-[#1c1917] uppercase tracking-wider">
                {t('weather.irrigationAdvisoryTitle')}
              </h4>
            </div>
            <p className="text-xs text-[#57534e] leading-relaxed">
              {t('weather.irrigationAdvisoryBody')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
