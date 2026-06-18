'use client';

import React, { useState } from 'react';
import { Activity, RefreshCw } from 'lucide-react';

interface CarbonRadarProps {
  transport?: number;
  electricity?: number;
  food?: number;
  waste?: number;
}

export default function CarbonRadar({ transport = 42, electricity = 28, food = 20, waste = 10 }: CarbonRadarProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ transport, electricity, food, waste });

  const handleRecalculate = () => {
    setLoading(true);
    setTimeout(() => {
      // Simulate reading latest database counts
      setData({
        transport: +(transport + (Math.random() * 8 - 4)).toFixed(1),
        electricity: +(electricity + (Math.random() * 6 - 3)).toFixed(1),
        food: +(food + (Math.random() * 4 - 2)).toFixed(1),
        waste: +(waste + (Math.random() * 2 - 1)).toFixed(1),
      });
      setLoading(false);
    }, 600);
  };

  // Radar chart dimensions
  const size = 180;
  const center = size / 2;
  const radius = size * 0.35; // max radius

  // 4 categories at 0, 90, 180, 270 degrees
  // Angles: transport = 0 (top), electricity = 90 (right), food = 180 (bottom), waste = 270 (left)
  // Converting polar to cartesian coordinates
  const getPoint = (value: number, angleDeg: number) => {
    const valPercent = Math.min(Math.max(value, 0), 100) / 100;
    const currentRadius = radius * valPercent;
    const angleRad = (angleDeg - 90) * (Math.PI / 180);
    return {
      x: center + currentRadius * Math.cos(angleRad),
      y: center + currentRadius * Math.sin(angleRad),
    };
  };

  // Compute points
  const pTransport = getPoint(data.transport, 0);
  const pElectricity = getPoint(data.electricity, 90);
  const pFood = getPoint(data.food, 180);
  const pWaste = getPoint(data.waste, 270);

  // Generate SVG path for the polygon shape
  const polygonPath = `M ${pTransport.x.toFixed(1)} ${pTransport.y.toFixed(1)} 
                       L ${pElectricity.x.toFixed(1)} ${pElectricity.y.toFixed(1)} 
                       L ${pFood.x.toFixed(1)} ${pFood.y.toFixed(1)} 
                       L ${pWaste.x.toFixed(1)} ${pWaste.y.toFixed(1)} Z`;

  // Standard Target Points for comparison (e.g. target is 30% each or ideal levels)
  const targetPoints = [
    getPoint(30, 0),
    getPoint(25, 90),
    getPoint(20, 180),
    getPoint(15, 270)
  ];
  const targetPath = `M ${targetPoints[0].x.toFixed(1)} ${targetPoints[0].y.toFixed(1)} 
                     L ${targetPoints[1].x.toFixed(1)} ${targetPoints[1].y.toFixed(1)} 
                     L ${targetPoints[2].x.toFixed(1)} ${targetPoints[2].y.toFixed(1)} 
                     L ${targetPoints[3].x.toFixed(1)} ${targetPoints[3].y.toFixed(1)} Z`;

  return (
    <article className="glass-card p-5 space-y-4 flex flex-col items-center relative overflow-hidden" aria-labelledby="radar-title">
      <header className="w-full flex justify-between items-center">
        <h3 id="radar-title" className="text-xs font-semibold text-[#6B8F7E] uppercase tracking-widest flex items-center gap-1.5">
          <Activity size={14} /> Carbon Radar
        </h3>
        <button
          onClick={handleRecalculate}
          disabled={loading}
          className="text-[#6B8F7E] hover:text-white transition-colors p-1"
          aria-label="Recalculate radar distribution matrix"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      {/* Radar SVG spider web */}
      <div className="relative w-44 h-44 flex items-center justify-center bg-slate-950/20 rounded-full border border-emerald-500/5 shadow-inner">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible" role="img" aria-label="Emissions distribution spider-web chart">
          {/* Radial Grid lines (web structure) */}
          {[25, 50, 75, 100].map((level) => {
            const pt0 = getPoint(level, 0);
            const pt1 = getPoint(level, 90);
            const pt2 = getPoint(level, 180);
            const pt3 = getPoint(level, 270);
            return (
              <polygon
                key={level}
                points={`${pt0.x},${pt0.y} ${pt1.x},${pt1.y} ${pt2.x},${pt2.y} ${pt3.x},${pt3.y}`}
                fill="none"
                stroke="rgba(16,185,129,0.08)"
                strokeWidth="1"
              />
            );
          })}

          {/* Core Axis Lines */}
          <line x1={center} y1={center - radius} x2={center} y2={center + radius} stroke="rgba(16,185,129,0.15)" strokeWidth="1" />
          <line x1={center - radius} y1={center} x2={center + radius} y2={center} stroke="rgba(16,185,129,0.15)" strokeWidth="1" />

          {/* Category Axis Labels */}
          <text x={center} y={center - radius - 6} textAnchor="middle" fontSize="9" fontWeight="600" fill="#6B8F7E">Transport</text>
          <text x={center + radius + 18} y={center + 3} textAnchor="middle" fontSize="9" fontWeight="600" fill="#6B8F7E">Energy</text>
          <text x={center} y={center + radius + 12} textAnchor="middle" fontSize="9" fontWeight="600" fill="#6B8F7E">Food</text>
          <text x={center - radius - 18} y={center + 3} textAnchor="middle" fontSize="9" fontWeight="600" fill="#6B8F7E">Waste</text>

          {/* Target Profile Overlay */}
          <polygon
            points={`${targetPoints[0].x},${targetPoints[0].y} ${targetPoints[1].x},${targetPoints[1].y} ${targetPoints[2].x},${targetPoints[2].y} ${targetPoints[3].x},${targetPoints[3].y}`}
            fill="rgba(34,211,238,0.05)"
            stroke="rgba(34,211,238,0.4)"
            strokeWidth="1"
            strokeDasharray="2,2"
          />

          {/* User Profile Shape */}
          <polygon
            points={`${pTransport.x},${pTransport.y} ${pElectricity.x},${pElectricity.y} ${pFood.x},${pFood.y} ${pWaste.x},${pWaste.y}`}
            fill="rgba(16,185,129,0.18)"
            stroke="#10B981"
            strokeWidth="2"
          />

          {/* Active Data Points */}
          <circle cx={pTransport.x} cy={pTransport.y} r="3" fill="#10B981" />
          <circle cx={pElectricity.x} cy={pElectricity.y} r="3" fill="#10B981" />
          <circle cx={pFood.x} cy={pFood.y} r="3" fill="#10B981" />
          <circle cx={pWaste.x} cy={pWaste.y} r="3" fill="#10B981" />
        </svg>
      </div>

      <div className="flex gap-4 text-[10px] w-full justify-center text-[#6B8F7E]">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 bg-emerald-500/30 border border-emerald-500 rounded-sm" />
          <span>You</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 bg-cyan-500/10 border border-cyan-400 border-dashed rounded-sm" />
          <span>Target Limit</span>
        </div>
      </div>
      
      <button
        onClick={handleRecalculate}
        disabled={loading}
        className="btn-secondary text-[11px] py-1 px-3 w-full border-[rgba(16,185,129,0.15)]"
      >
        {loading ? 'Recomputing...' : 'Recompute Radar'}
      </button>
    </article>
  );
}
