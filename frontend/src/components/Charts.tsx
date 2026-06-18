'use client';

import React, { useRef, useEffect } from 'react';

/** ── Types ── */
interface DataPoint { label: string; value: number; }

interface LineChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
  label?: string;
  unit?: string;
}

interface DonutChartProps {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}

interface BarChartProps {
  data: DataPoint[];
  color?: string;
  unit?: string;
  height?: number;
}

/**
 * LineChart — SVG-based responsive trend chart
 */
export function LineChart({ data, color = '#10B981', height = 120, label, unit = 'kg' }: LineChartProps) {
  if (!data.length) return null;
  const W = 320; const H = height;
  const pad = { top: 12, right: 16, bottom: 24, left: 36 };
  const maxV = Math.max(...data.map(d => d.value), 1);
  const minV = Math.min(...data.map(d => d.value), 0);
  const range = maxV - minV || 1;

  const pts = data.map((d, i) => ({
    x: pad.left + (i / Math.max(data.length - 1, 1)) * (W - pad.left - pad.right),
    y: pad.top + (1 - (d.value - minV) / range) * (H - pad.top - pad.bottom),
  }));

  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaD = pathD + ` L ${pts[pts.length-1].x.toFixed(1)} ${(H - pad.bottom).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(H - pad.bottom).toFixed(1)} Z`;

  return (
    <figure aria-label={label ?? 'Line chart'} className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="w-full" style={{ height }}>
        {/* Area fill */}
        <defs>
          <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#grad-${color.replace('#','')})`} />
        {/* Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Data points */}
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill={color} />
            <title>{`${data[i].label}: ${data[i].value} ${unit}`}</title>
          </g>
        ))}
        {/* X labels */}
        {data.map((d, i) => (
          <text key={i} x={pts[i].x} y={H - 4} textAnchor="middle" fontSize="9" fill="#6B8F7E">
            {d.label}
          </text>
        ))}
      </svg>
    </figure>
  );
}

/**
 * DonutChart — SVG donut for category breakdown
 */
export function DonutChart({ segments, size = 120, thickness = 22, centerLabel, centerValue }: DonutChartProps) {
  const r = (size - thickness) / 2;
  const cx = size / 2; const cy = size / 2;
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const arcs = segments.map((seg) => {
    const dash = (seg.value / total) * circumference;
    const arc = { dash, gap: circumference - dash, offset, seg };
    offset += dash;
    return arc;
  });

  return (
    <figure aria-label={`Donut chart: ${segments.map(s => `${s.label} ${s.value}`).join(', ')}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img">
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(16,185,129,0.1)" strokeWidth={thickness} />
        {/* Segments */}
        {arcs.map(({ dash, gap, offset: off, seg }, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={thickness}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-off}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
          >
            <title>{`${seg.label}: ${seg.value} kg`}</title>
          </circle>
        ))}
        {/* Center text */}
        {centerValue && (
          <>
            <text x={cx} y={cy - 6} textAnchor="middle" fontSize="16" fontWeight="700" fill="#E2FBF0" fontFamily="Outfit, sans-serif">
              {centerValue}
            </text>
            {centerLabel && (
              <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#6B8F7E">
                {centerLabel}
              </text>
            )}
          </>
        )}
      </svg>
    </figure>
  );
}

/**
 * BarChart — horizontal bar chart for comparisons
 */
export function BarChart({ data, color = '#10B981', unit = 'kg', height = 160 }: BarChartProps) {
  const maxV = Math.max(...data.map(d => d.value), 1);
  return (
    <figure aria-label="Bar chart" className="w-full space-y-2" style={{ minHeight: height }}>
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3" role="row">
          <span className="text-xs text-[#6B8F7E] w-20 text-right shrink-0" aria-label={d.label}>{d.label}</span>
          <div className="flex-1 h-5 rounded-full bg-[rgba(16,185,129,0.1)] overflow-hidden" role="presentation">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(d.value / maxV) * 100}%`, background: `linear-gradient(90deg, ${color}, #34D399)` }}
              role="progressbar"
              aria-valuenow={d.value}
              aria-valuemax={maxV}
              aria-label={`${d.label}: ${d.value} ${unit}`}
            />
          </div>
          <span className="text-xs font-semibold text-[#34D399] w-16 shrink-0">{d.value} {unit}</span>
        </div>
      ))}
    </figure>
  );
}
