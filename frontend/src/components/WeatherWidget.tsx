'use client';

import React, { useState } from 'react';
import { Sun, CloudRain, Wind, RefreshCw, AlertCircle, Thermometer } from 'lucide-react';

interface WeatherData {
  city: string;
  temp: number;
  condition: 'sunny' | 'rainy' | 'windy';
  aqi: number; // 0-500
  tip: string;
}

const WEATHER_PRESETS: WeatherData[] = [
  {
    city: 'New York, NY',
    temp: 24,
    condition: 'sunny',
    aqi: 42,
    tip: '☀️ It is sunny today! Air dry your laundry outdoors instead of running the electric dryer to save ~1.5 kWh.'
  },
  {
    city: 'San Francisco, CA',
    temp: 16,
    condition: 'windy',
    aqi: 68,
    tip: '💨 Strong wind detected. Natural ventilation can cool your home without consuming AC power.'
  },
  {
    city: 'London, UK',
    temp: 14,
    condition: 'rainy',
    aqi: 22,
    tip: '🌧️ Rainy day. Perfect time to check your household rainwater harvest setup and compost bins.'
  }
];

export default function WeatherWidget() {
  const [data, setData] = useState<WeatherData>({
    city: 'Click to select location',
    temp: 20,
    condition: 'sunny',
    aqi: 50,
    tip: 'Press "Load Local AQI" to check local air quality and receive customized green tips.'
  });
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const fetchWeather = () => {
    setLoading(true);
    setTimeout(() => {
      const nextIdx = (selectedIdx + 1) % WEATHER_PRESETS.length;
      setData(WEATHER_PRESETS[nextIdx]);
      setSelectedIdx(nextIdx);
      setLoading(false);
    }, 700);
  };

  const getAqiBadgeColor = (aqi: number) => {
    if (aqi <= 50) return 'badge-green';
    if (aqi <= 100) return 'badge-amber';
    return 'badge-red';
  };

  const getAqiDescription = (aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    return 'Unhealthy';
  };

  const renderIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="text-yellow-400 animate-spin-slow" size={24} />;
      case 'windy': return <Wind className="text-cyan-300" size={24} />;
      case 'rainy': return <CloudRain className="text-blue-400" size={24} />;
      default: return <Sun className="text-yellow-400" size={24} />;
    }
  };

  return (
    <article className="glass-card p-5 space-y-4" aria-labelledby="weather-widget-title">
      <header className="flex justify-between items-center">
        <h3 id="weather-widget-title" className="text-xs font-semibold text-[#6B8F7E] uppercase tracking-widest flex items-center gap-1.5">
          <Thermometer size={14} /> Environmental Widget
        </h3>
        <button
          onClick={fetchWeather}
          disabled={loading}
          className="text-[#6B8F7E] hover:text-white transition-colors p-1"
          aria-label="Refresh environmental location details"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      {data.city === 'Click to select location' ? (
        <div className="text-center py-6">
          <button
            onClick={fetchWeather}
            disabled={loading}
            className="btn-primary text-xs py-1.5 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg shadow-sm"
          >
            {loading ? 'Locating...' : 'Load Local AQI'}
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in-up" aria-live="polite">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {renderIcon(data.condition)}
              <div>
                <p className="text-sm font-bold text-white">{data.city}</p>
                <p className="text-xs text-[#6B8F7E] capitalize">{data.condition} · {data.temp}°C</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`badge ${getAqiBadgeColor(data.aqi)}`}>
                AQI {data.aqi}
              </span>
              <p className="text-[10px] text-[#6B8F7E] mt-0.5">{getAqiDescription(data.aqi)} Air Quality</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/10 flex gap-2">
            <AlertCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs text-[#E2FBF0] leading-relaxed">
              {data.tip}
            </p>
          </div>
        </div>
      )}
    </article>
  );
}
