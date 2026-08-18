import React, { useState } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, CircleMarker } from 'react-leaflet';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function SatellitePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [selectedParcel, setSelectedParcel] = useState('North Field 4');
  const [selectedLayer, setSelectedLayer] = useState('NDVI');
  const [treatmentScheduled, setTreatmentScheduled] = useState(false);

  // Field Coordinates (Karnal coordinates)
  const centerPosition = [29.6857, 76.9905];

  const parcels = {
    'North Field 4': {
      name: 'North Field 4 - Sharbati Wheat',
      crop: 'Wheat (Rabi 2026)',
      size: '6.4 Acres',
      acquired: 'Today, 10:30 AM (Sentinel-2 10m)',
      ndviScore: '0.82',
      canopyScore: '82',
      moisture: '45%',
      stressZone: 'SE Quadrant (0.8 Acres Low Nitrogen)',
      polygon: [
        [29.6875, 76.9880],
        [29.6890, 76.9925],
        [29.6845, 76.9940],
        [29.6830, 76.9895]
      ]
    },
    'South Parcel B': {
      name: 'South Parcel B - Mustard',
      crop: 'Mustard (Brassica)',
      size: '4.2 Acres',
      acquired: 'Yesterday, 11:15 AM',
      ndviScore: '0.74',
      canopyScore: '74',
      moisture: '38%',
      stressZone: 'Optimal Uniform Growth',
      polygon: [
        [29.6815, 76.9885],
        [29.6830, 76.9930],
        [29.6795, 76.9940],
        [29.6780, 76.9895]
      ]
    }
  };

  const current = parcels[selectedParcel] || parcels['North Field 4'];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#e7e5e4]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#14532d] animate-pulse"></span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#14532d]">
              {t('satellite.resolutionBadge')}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1c1917] tracking-tight font-editorial mt-0.5">
            {t('satellite.title')}
          </h2>
          <p className="text-xs sm:text-sm text-[#57534e] max-w-2xl mt-0.5">
            {t('satellite.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <select
            value={selectedParcel}
            onChange={(e) => setSelectedParcel(e.target.value)}
            className="p-2 text-xs font-bold bg-white border border-[#e7e5e4] rounded-xl text-[#1c1917] focus:outline-[#14532d] shadow-2xs"
          >
            {Object.keys(parcels).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 sm:gap-6 items-start">
        {/* Left / Main: Map Canvas */}
        <div className="flex-1 w-full paper-card p-4 sm:p-6 flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#f5f2eb] pb-3 mb-4">
            <div>
              <h3 className="text-base font-extrabold text-[#1c1917] font-editorial">{current.name}</h3>
              <p className="text-[11px] text-[#78716c] mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-[#78716c]">schedule</span>
                {t('satellite.acquired')}: {current.acquired}
              </p>
            </div>

            <div className="flex items-center gap-1 bg-[#f5f2eb] p-1 rounded-xl overflow-x-auto no-scrollbar max-w-full">
              {['NDVI', 'NDRE', 'EVI', 'MSAVI'].map((layer) => (
                <button
                  key={layer}
                  onClick={() => setSelectedLayer(layer)}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                    selectedLayer === layer
                      ? 'bg-white text-[#14532d] shadow-2xs'
                      : 'text-[#78716c] hover:text-[#1c1917]'
                  }`}
                >
                  {layer}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Leaflet Map Container */}
          <div className="relative w-full h-[320px] sm:h-[400px] lg:h-[460px] rounded-2xl overflow-hidden border border-[#e7e5e4]">
            <MapContainer
              center={centerPosition}
              zoom={15}
              scrollWheelZoom={false}
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Parcel Polygon with NDVI Emerald Gradient */}
              <Polygon
                positions={current.polygon}
                pathOptions={{
                  color: '#14532d',
                  fillColor: '#16a34a',
                  fillOpacity: 0.55,
                  weight: 2.5
                }}
              >
                <Popup>
                  <div className="font-sans text-xs">
                    <p className="font-extrabold text-[#14532d]">{current.name}</p>
                    <p>Crop: {current.crop}</p>
                    <p>NDVI Score: {current.ndviScore}</p>
                    <p>Size: {current.size}</p>
                  </div>
                </Popup>
              </Polygon>

              {/* Simulated Stress Hotspot Pin */}
              <CircleMarker
                center={[29.6845, 76.9915]}
                radius={9}
                pathOptions={{
                  color: '#b45309',
                  fillColor: '#f59e0b',
                  fillOpacity: 0.85,
                  weight: 2
                }}
              >
                <Popup>
                  <div className="font-sans text-xs">
                    <p className="font-bold text-[#b45309]">Nitrogen Stress Detected</p>
                    <p className="text-[11px] text-[#57534e]">NDVI: 0.58 (Low Biomass Zone)</p>
                  </div>
                </Popup>
              </CircleMarker>
            </MapContainer>

            {/* Map Legend Overlay */}
            <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-xs p-2.5 rounded-xl border border-[#e7e5e4] shadow-xs text-[10px] font-bold text-[#1c1917] flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a]"></span>
                <span>Healthy (87%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
                <span>Low N (13%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right / Sidebar: Diagnostic Crop Analytics */}
        <div className="w-full lg:w-[340px] space-y-4">
          {/* Canopy Health Card */}
          <div className="paper-card p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#14532d] text-[20px]">spa</span>
                <h4 className="text-xs font-extrabold text-[#1c1917] uppercase tracking-wider">
                  {t('satellite.canopyHealthIndex')}
                </h4>
              </div>
              <span className="text-lg font-extrabold text-[#14532d] font-editorial">
                {current.canopyScore}/100
              </span>
            </div>
            <p className="text-xs text-[#57534e] leading-relaxed">
              {t('satellite.canopyHealthDesc')}
            </p>
          </div>

          {/* Root Zone Moisture Card */}
          <div className="paper-card p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-700 text-[20px]">water_drop</span>
                <h4 className="text-xs font-extrabold text-[#1c1917] uppercase tracking-wider">
                  {t('satellite.rootZoneMoisture')}
                </h4>
              </div>
              <span className="text-lg font-extrabold text-blue-700 font-editorial">{current.moisture}</span>
            </div>
            <p className="text-xs text-[#57534e] leading-relaxed">
              {t('satellite.rootZoneDesc')}
            </p>
          </div>

          {/* Nitrogen Deficit Alert Card */}
          <div className="paper-card p-4 sm:p-5 border-l-4 border-l-[#b45309] bg-[#faf8f5]">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[#b45309] text-[20px]">warning</span>
              <h4 className="text-xs font-extrabold text-[#b45309] uppercase tracking-wider">
                {t('satellite.nitrogenDeficitAlert')}
              </h4>
            </div>
            <p className="text-xs text-[#57534e] leading-relaxed mb-3">
              {t('satellite.nitrogenDeficitDesc')}
            </p>

            <button
              onClick={() => setTreatmentScheduled(true)}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                treatmentScheduled
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-[#14532d] hover:bg-[#052e16] text-white shadow-2xs'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {treatmentScheduled ? 'done' : 'calendar_add_on'}
              </span>
              {treatmentScheduled ? 'Treatment Scheduled' : t('satellite.scheduleTreatment')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
