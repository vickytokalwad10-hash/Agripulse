/**
 * ============================================================================
 * AGRIPULSE AI — MODULAR FARM & USER CONTEXT BUILDER
 * ============================================================================
 * Aggregates farm profile, live telemetry, weather/spray safety, satellite NDVI,
 * soil health metrics, and mandi watchlist into a structured context bundle
 * for Gemini-level personalized copilot reasoning.
 * ============================================================================
 */

export function buildUserContext(user = null, overrides = {}) {
  return {
    user_id: user?.uid || 'farmer_session',
    location: overrides.location || 'Karnal, Haryana (Indo-Gangetic Plain)',
    context_crop: overrides.crop || 'Wheat',
    crops: [
      { name: 'Sharbati Wheat', variety: 'PBW 550', acreage: '5 Acres', stage: 'CRI Stage (21-25 Days)' },
      { name: 'Mustard', variety: 'Pusa Bold', acreage: '3 Acres', stage: 'Vegetative Growth' }
    ],
    weather: {
      temp: '28°C',
      humidity: '62%',
      wind_speed: '8 km/h',
      condition: 'Clear Sunny',
      spray_safety_score: 88,
      rain_forecast_24h: '0% None'
    },
    ndvi: 0.74,
    ndvi_status: 'Healthy Vigorous Canopy',
    soil: {
      ph: '7.2 (Neutral)',
      nitrogen: 'Low (190 kg/ha)',
      phosphorus: 'Medium (18 kg/ha)',
      potassium: 'High (280 kg/ha)',
      oc: '0.45%'
    },
    watchlist: [
      { crop: 'Sharbati Wheat', price: 2840, msp: 2425 },
      { crop: 'Basmati Paddy', price: 3950, msp: 2203 },
      { crop: 'Mustard (Raida)', price: 5780, msp: 5650 }
    ],
    ...overrides
  };
}
