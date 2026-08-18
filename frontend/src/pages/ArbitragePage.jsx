import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useLanguage } from '../context/LanguageContext';

export default function ArbitragePage() {
  const { t, formatCurrency } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState('wheat');
  const [freightRatePerKm, setFreightRatePerKm] = useState(4.5); // ₹ / km / ton
  const [cargoWeightTons, setCargoWeightTons] = useState(25); // 250 Quintals
  const [govComparisons, setGovComparisons] = useState([]);
  const [govtAttribution, setGovtAttribution] = useState('Source: Agmarknet, Ministry of Agriculture & Farmers Welfare, Government of India (via data.gov.in)');

  useEffect(() => {
    fetchGovtComparison(selectedCrop);
  }, [selectedCrop]);

  const fetchGovtComparison = async (crop) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/markets/compare?crop_id=${crop}`);
      if (res.ok) {
        const data = await res.json();
        setGovComparisons(data.comparison || []);
        if (data.attribution) {
          setGovtAttribution(data.attribution);
        }
      }
    } catch (e) {
      console.warn('Agmarknet comparison fetch note:', e);
    }
  };

  const mandis = [
    { name: 'Karnal Mandi (Base)', state: 'Haryana', distanceKm: 0, spotPrice: 2840, lat: 29.6857, lng: 76.9905, isBase: true },
    { name: 'Khanna Mandi (Asia Largest)', state: 'Punjab', distanceKm: 145, spotPrice: 2985, lat: 30.7071, lng: 76.2167, isBase: false },
    { name: 'Delhi Narela Mandi', state: 'Delhi NCR', distanceKm: 110, spotPrice: 2920, lat: 28.8525, lng: 77.0935, isBase: false },
    { name: 'Rohtak Mandi', state: 'Haryana', distanceKm: 95, spotPrice: 2880, lat: 28.8955, lng: 76.6066, isBase: false },
    { name: 'Jaipur Surajpole Mandi', state: 'Rajasthan', distanceKm: 340, spotPrice: 3050, lat: 26.9124, lng: 75.7873, isBase: false }
  ];

  const cropKeys = [
    { id: 'wheat', labelKey: 'arbitrage.cropWheat' },
    { id: 'paddy', labelKey: 'arbitrage.cropPaddy' },
    { id: 'mustard', labelKey: 'arbitrage.cropMustard' },
    { id: 'soybean', labelKey: 'arbitrage.cropSoybean' },
    { id: 'cotton', labelKey: 'arbitrage.cropCotton' },
    { id: 'onion', labelKey: 'arbitrage.cropOnion' },
  ];

  // Arbitrage Spread Calculation
  const basePrice = mandis.find((m) => m.isBase)?.spotPrice || 2840;

  const calculatedMandis = mandis.map((m) => {
    const grossSpreadPerQtl = m.spotPrice - basePrice;
    const freightCostPerQtl = m.distanceKm === 0 ? 0 : Math.round((m.distanceKm * freightRatePerKm) / 10);
    const mandiCessPerQtl = m.distanceKm === 0 ? 0 : Math.round(m.spotPrice * 0.015);
    const netRealizationPerQtl = grossSpreadPerQtl - freightCostPerQtl - mandiCessPerQtl;
    const totalNetGain = Math.round(netRealizationPerQtl * (cargoWeightTons * 10));

    return {
      ...m,
      grossSpreadPerQtl,
      freightCostPerQtl,
      mandiCessPerQtl,
      netRealizationPerQtl,
      totalNetGain,
      isProfitable: totalNetGain > 0
    };
  });

  // Custom Leaflet Div Icon
  const createModernPin = (price, isBase, isProfitable) => {
    return L.divIcon({
      className: 'custom-modern-pin',
      html: `
        <div style="
          background-color: ${isBase ? '#14532d' : isProfitable ? '#16a34a' : '#78716c'};
          color: white;
          padding: 4px 8px;
          border-radius: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          border: 1.5px solid white;
          text-align: center;
        ">
          ${isBase ? '📍 Base: ' : ''}₹${price}
        </div>
      `,
      iconSize: [84, 28],
      iconAnchor: [42, 14]
    });
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#e7e5e4]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#14532d] animate-pulse"></span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#14532d]">
              {t('arbitrage.title')}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1c1917] tracking-tight font-editorial mt-0.5">
            {t('arbitrage.title')}
          </h2>
          <p className="text-xs sm:text-sm text-[#57534e] max-w-2xl mt-0.5">
            {t('arbitrage.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs font-bold text-[#78716c]">{t('arbitrage.freightCostRate')}:</span>
          <span className="text-xs font-extrabold text-[#14532d] bg-[#f5fdf7] border border-[#bbf7d0] px-3 py-1 rounded-xl shadow-2xs">
            ₹{freightRatePerKm} / km / Ton
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left Column: Interactive Map */}
        <div className="lg:col-span-6 paper-card p-4 sm:p-5">
          <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-[#f5f2eb]">
            <h3 className="text-sm font-extrabold text-[#1c1917] font-editorial">{t('arbitrage.regionalMap')}</h3>
            <span className="text-[11px] font-bold text-[#78716c]">{t('arbitrage.baseLocation')}</span>
          </div>

          <div className="w-full h-[320px] sm:h-[380px] rounded-2xl overflow-hidden border border-[#e7e5e4]">
            <MapContainer
              center={[29.6857, 76.9905]}
              zoom={7}
              scrollWheelZoom={false}
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {calculatedMandis.map((m, idx) => (
                <Marker
                  key={idx}
                  position={[m.lat, m.lng]}
                  icon={createModernPin(m.spotPrice, m.isBase, m.isProfitable)}
                >
                  <Popup>
                    <div className="font-sans text-xs">
                      <p className="font-extrabold text-[#14532d]">{m.name}</p>
                      <p>{t('arbitrage.popupSpotPrice')}: ₹{m.spotPrice}/qtl</p>
                      <p>{t('arbitrage.popupDistance')}: {m.distanceKm} km</p>
                      <p className={`font-bold ${m.isProfitable ? 'text-emerald-700' : 'text-slate-600'}`}>
                        {m.isBase ? t('arbitrage.popupBaseOrigin') : `${t('arbitrage.popupNetGain')}: ₹${m.totalNetGain.toLocaleString('en-IN')}`}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Right Column: Net Realization Matrix Table */}
        <div className="lg:col-span-6 space-y-3 sm:space-y-4">
          <div className="paper-card p-4 sm:p-5">
            <h3 className="text-sm font-extrabold text-[#1c1917] font-editorial mb-3 pb-2 border-b border-[#f5f2eb]">
              {t('arbitrage.realizationMatrix')}
            </h3>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs min-w-[400px]">
                <thead>
                  <tr className="border-b border-[#e7e5e4] text-[#78716c] uppercase tracking-wider font-extrabold text-[10px]">
                    <th className="pb-2">{t('arbitrage.destinationMandi')}</th>
                    <th className="pb-2">{t('arbitrage.spotPrice')}</th>
                    <th className="pb-2">{t('arbitrage.freightCost')}</th>
                    <th className="pb-2 text-right">{t('arbitrage.netGain')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5f2eb]">
                  {calculatedMandis.map((m, idx) => (
                    <tr key={idx} className="hover:bg-[#faf8f5] transition">
                      <td className="py-2.5 font-bold text-[#1c1917]">
                        {m.name}
                        {m.isBase && (
                          <span className="ml-1.5 px-1.5 py-0.2 bg-[#f5f2eb] text-[9px] font-bold text-[#78716c] rounded">
                            {t('arbitrage.origin')}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 font-extrabold text-[#1c1917]">₹{m.spotPrice}</td>
                      <td className="py-2.5 text-[#78716c]">{m.distanceKm}km (-₹{m.freightCostPerQtl})</td>
                      <td className="py-2.5 text-right">
                        {m.isBase ? (
                          <span className="text-[#a8a29e] font-semibold">—</span>
                        ) : m.isProfitable ? (
                          <span className="font-extrabold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-lg">
                            +₹{m.totalNetGain.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="font-semibold text-[#78716c] bg-[#f5f2eb] px-2 py-0.5 rounded-lg">
                            -₹{Math.abs(m.totalNetGain).toLocaleString('en-IN')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Arbitrage Insight */}
          <div className="paper-card p-4 border-l-4 border-l-[#14532d] bg-[#f5fdf7] text-xs">
            <h4 className="font-extrabold text-[#14532d] mb-1 flex items-center gap-1.5 font-editorial text-sm">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              {t('arbitrage.optimalRoute')} ({t('arbitrage.optimalRouteGain')})
            </h4>
            <p className="text-[#15803d] leading-relaxed text-[11px] font-medium">
              {t('arbitrage.optimalRouteDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* 3-Way Multi-Source Market Verification Table */}
      <div className="paper-card p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-[#f5f2eb]">
          <div>
            <h3 className="text-sm font-extrabold text-[#1c1917] font-editorial flex items-center gap-2">
              <span className="material-symbols-outlined text-[#14532d] text-[18px]">balance</span>
              <span>{t('arbitrage.compareGovt')}</span>
            </h3>
            <p className="text-[11px] text-[#78716c]">
              {t('arbitrage.crossVerificationDesc')}
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {cropKeys.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCrop(c.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition ${
                  selectedCrop === c.id
                    ? 'bg-[#14532d] text-white shadow-2xs'
                    : 'bg-[#f5f2eb] text-[#57534e] hover:bg-[#e7e5e4]'
                }`}
              >
                {t(c.labelKey)}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs min-w-[720px]">
            <thead>
              <tr className="border-b border-[#e7e5e4] text-[#78716c] uppercase tracking-wider font-extrabold text-[10px]">
                <th className="pb-2">{t('arbitrage.apmc_source')}</th>
                <th className="pb-2">🌾 AgriPulse Spot</th>
                <th className="pb-2">🏛️ {t('arbitrage.govtModal')}</th>
                <th className="pb-2">📊 {t('arbitrage.enamModal')}</th>
                <th className="pb-2">{t('arbitrage.enamSpread')}</th>
                <th className="pb-2">{t('arbitrage.priceDelta')}</th>
                <th className="pb-2 text-right">{t('arbitrage.verificationDate')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f2eb]">
              {govComparisons.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#faf8f5] transition">
                  <td className="py-2.5 font-bold text-[#1c1917]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span>{row.mandi_name}</span>
                      <span className="text-[10px] text-[#78716c] font-normal">({row.state})</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      {(row.active_sources || ['AgriPulse Network']).map((s, sidx) => (
                        <span key={sidx} className={`text-[8px] font-black px-1.5 py-0.2 rounded ${
                          s === 'e-NAM'
                            ? 'bg-[#eff6ff] text-[#1e40af] border border-[#bfdbfe]'
                            : s === 'Agmarknet'
                            ? 'bg-[#f0fdf4] text-[#14532d] border border-[#bbf7d0]'
                            : 'bg-[#faf8f5] text-[#78716c] border border-[#e7e5e4]'
                        }`}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 font-extrabold text-[#14532d]">
                    ₹{row.agripulse_spot_price}/qtl
                  </td>
                  <td className="py-2.5 font-bold text-[#1c1917]">
                    ₹{row.agmarknet_modal_price}/qtl
                    <span className="text-[10px] text-[#78716c] block font-normal">
                      ₹{row.agmarknet_min_price} – ₹{row.agmarknet_max_price}
                    </span>
                  </td>
                  <td className="py-2.5 font-bold text-[#1e40af]">
                    ₹{row.enam_modal_price}/qtl
                    {row.enam_arrivals_tonnes && (
                      <span className="text-[10px] text-[#3b82f6] block font-medium">
                        {row.enam_arrivals_tonnes} MT Traded
                      </span>
                    )}
                  </td>
                  <td className="py-2.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      row.enam_spread_vs_agmarknet >= 0 ? 'bg-blue-100 text-blue-900' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {row.enam_spread_vs_agmarknet >= 0 ? `+₹${row.enam_spread_vs_agmarknet}` : `-₹${Math.abs(row.enam_spread_vs_agmarknet)}`}/qtl
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      row.is_agripulse_premium ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                    }`}>
                      {row.is_agripulse_premium ? `+₹${row.price_delta}` : `-₹${Math.abs(row.price_delta)}`} ({row.price_delta_pct}%)
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-[#78716c]">
                    📅 {row.agmarknet_arrival_date || row.enam_arrival_date || t('common.today')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Attribution Footer */}
        <div className="pt-2 border-t border-[#f5f2eb] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] text-[#78716c]">
          <div className="flex flex-col gap-0.5">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#14532d] text-[15px]">verified</span>
              <span>{t('arbitrage.attribution')}</span>
            </span>
          </div>
          <span className="font-semibold bg-[#f5f2eb] px-2 py-0.5 rounded border border-[#e7e5e4] shrink-0">
            {t('arbitrage.ndsapBadge')}
          </span>
        </div>
      </div>
    </div>
  );
}
