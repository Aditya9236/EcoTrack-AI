'use client';

import React, { useState } from 'react';
import { TrendingUp, Calendar, Leaf, AlertCircle, Loader, BarChart2, ShieldAlert, Cpu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { LineChart } from './Charts';

interface Interval { expected: number; savings: number; }
interface PredictResult { predictions: { one_month: Interval; six_month: Interval; one_year: Interval; }; }

/**
 * Predictor — Carbon Twin AI simulation
 */
export default function Predictor() {
  const { getIdToken } = useAuth();
  const [baseline, setBaseline]   = useState<number>(4800);
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<PredictResult | null>(null);
  const [error, setError]         = useState<string | null>(null);

  // Twin Lifestyle Toggles
  const [commuteSwap, setCommuteSwap] = useState(false); // saves 1200 kg CO2
  const [dietSwap, setDietSwap]       = useState(false); // saves 950 kg CO2
  const [solarSwap, setSolarSwap]     = useState(false); // saves 1500 kg CO2
  const [ecoHVAC, setEcoHVAC]         = useState(false); // saves 400 kg CO2

  // Runs simulation strictly on user click
  const runSimulation = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    // Calculate dynamic reduction percentage from active swaps
    let savingsTotal = 0;
    if (commuteSwap) savingsTotal += 1200;
    if (dietSwap) savingsTotal += 950;
    if (solarSwap) savingsTotal += 1500;
    if (ecoHVAC) savingsTotal += 400;

    // Cap savings at 90% of baseline
    const reductionPercent = Math.min(90, Math.round((savingsTotal / baseline) * 100)) || 5;

    try {
      const token = await getIdToken();
      const res = await fetch('http://localhost:8000/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ current_annual_baseline: baseline, target_reduction_percentage: reductionPercent }),
      });
      if (!res.ok) throw new Error('Prediction failed');
      setResult(await res.json());
    } catch {
      // Local fallback calculation
      const m = parseFloat((baseline / 12).toFixed(1));
      const r = reductionPercent / 100;
      setResult({
        predictions: {
          one_month: { expected: m, savings: parseFloat((m * r).toFixed(1)) },
          six_month: { expected: parseFloat((baseline / 2).toFixed(1)), savings: parseFloat((baseline / 2 * r).toFixed(1)) },
          one_year:  { expected: baseline, savings: parseFloat((baseline * r).toFixed(1)) },
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const intervals = result ? [
    { key: '1 Month',  data: result.predictions.one_month,  color: '#00F5A0' },
    { key: '6 Months', data: result.predictions.six_month,  color: '#00D9F5' },
    { key: '1 Year',   data: result.predictions.one_year,   color: '#F59E0B' },
  ] : [];

  const chartData = result ? [
    { label: 'Baseline', value: baseline },
    { label: 'Twin (1 Mo)', value: Math.max(0, result.predictions.one_month.expected - result.predictions.one_month.savings) * 12 },
    { label: 'Twin (6 Mo)', value: Math.max(0, result.predictions.six_month.expected - result.predictions.six_month.savings) * 2 },
    { label: 'Twin (1 Yr)',  value: Math.max(0, result.predictions.one_year.expected - result.predictions.one_year.savings) },
  ] : [];

  return (
    <section aria-labelledby="predictor-heading" className="glass-card p-6 space-y-5">
      <header className="flex justify-between items-start">
        <div>
          <h2 id="predictor-heading" className="text-xl font-semibold text-[#00F5A0] flex items-center gap-2">
            <Cpu size={20} aria-hidden="true" /> Carbon Twin AI
          </h2>
          <p className="text-sm text-[#8FA89B] mt-1">Configure your carbon twin and run simulation projections.</p>
        </div>
        <span className="badge badge-blue">Simulation Engine</span>
      </header>

      {/* Configuration Sliders & Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div>
            <label htmlFor="baseline-input" className="block text-xs text-[#8FA89B] uppercase font-semibold mb-1">
              Your Annual Baseline (kg CO₂e)
            </label>
            <input
              id="baseline-input"
              type="number"
              className="eco-input"
              value={baseline}
              onChange={(e) => setBaseline(parseFloat(e.target.value) || 0)}
              min={100}
              step={100}
              aria-label="Your current annual carbon footprint in kg CO2 equivalent"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs text-[#8FA89B] uppercase font-semibold">
              Twin Eco Configuration Swaps
            </label>
            <div className="space-y-2">
              {[
                { id: 'commute', label: 'Commute by Transit/Bike', desc: 'Swap car trips (Saves ~1200kg CO₂)', state: commuteSwap, setter: setCommuteSwap },
                { id: 'diet', label: 'Plant-Based Swaps', desc: 'Meatless food profile (Saves ~950kg CO₂)', state: dietSwap, setter: setDietSwap },
                { id: 'solar', label: 'Solar Electricity Switch', desc: 'Use clean solar energy (Saves ~1500kg CO₂)', state: solarSwap, setter: setSolarSwap },
                { id: 'hvac', label: 'Eco HVAC Thermostat', desc: 'Offset temperature by 2°C (Saves ~400kg CO₂)', state: ecoHVAC, setter: setEcoHVAC },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => opt.setter(!opt.state)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    opt.state
                      ? 'bg-[#00F5A0]/10 border-[#00F5A0]/30 text-white'
                      : 'glass-card hover:border-[#00F5A0]/20'
                  }`}
                  aria-pressed={opt.state}
                >
                  <div>
                    <p className="text-xs font-bold">{opt.label}</p>
                    <p className="text-[10px] text-[#8FA89B] mt-0.5">{opt.desc}</p>
                  </div>
                  <span className={`w-3 h-3 rounded-full ${opt.state ? 'bg-[#00F5A0]' : 'bg-slate-700'}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button & Output Graphs */}
        <div className="flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <p className="text-xs text-[#8FA89B] leading-relaxed">
              Once you configure your carbon twin's lifestyle swaps, press **Run Twin Simulation** to compare projected footprints.
            </p>
            <button
              className="btn-primary w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold"
              onClick={runSimulation}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? <><Loader size={15} className="animate-spin" /> Simulating...</> : <><BarChart2 size={15} /> Run Twin Simulation</>}
            </button>
          </div>

          {result && (
            <div className="glass-card p-4 space-y-3 border-emerald-500/20 animate-fade-in-up">
              <h3 className="text-xs font-semibold text-[#00F5A0] flex items-center gap-1">
                <ShieldAlert size={12} /> Carbon Twin Predictions
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {intervals.map(({ key, data, color }) => (
                  <div key={key} className="text-center p-2 rounded-lg bg-slate-950/40">
                    <p className="text-[9px] text-[#8FA89B] flex items-center justify-center gap-0.5">
                      <Calendar size={8} /> {key}
                    </p>
                    <p className="text-xs font-bold text-white mt-1">{(data.expected - data.savings).toFixed(0)}kg</p>
                    <p className="text-[8px] text-[#00F5A0] font-semibold mt-0.5">-{data.savings.toFixed(0)}kg</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {result && (
        <div className="glass-card p-4 animate-fade-in-up">
          <h3 className="text-xs font-semibold text-[#8FA89B] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Leaf size={12} /> Annual Projection Comparison: You vs Carbon Twin
          </h3>
          <LineChart data={chartData} color="#00F5A0" height={120} label="Annual footprint trajectory" unit="kg" />
        </div>
      )}

      {error && <p className="text-red-400 text-sm flex items-center gap-2" role="alert"><AlertCircle size={14} />{error}</p>}
    </section>
  );
}
