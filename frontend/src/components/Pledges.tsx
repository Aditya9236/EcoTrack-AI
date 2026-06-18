'use client';

import React, { useState } from 'react';
import { Target, Check, Users, Calendar, Flame } from 'lucide-react';

interface Pledge {
  id: string;
  title: string;
  description: string;
  icon: string;
  duration: string;
  participants: number;
  co2Saved: number;
  joined: boolean;
  category: string;
}

const PLEDGES: Pledge[] = [
  { id: 'meatless',    title: 'Meatless Mondays',      description: 'Go plant-based every Monday for a month.',             icon: '🥗', duration: '4 weeks', participants: 12480, co2Saved: 8.2,  joined: false, category: 'food' },
  { id: 'bikeweek',   title: 'Bike to Work Week',      description: 'Cycle instead of driving for 5 consecutive days.',     icon: '🚲', duration: '1 week',  participants: 8930,  co2Saved: 14.5, joined: true,  category: 'transport' },
  { id: 'plasticfree', title: 'Plastic-Free July',     description: 'Refuse all single-use plastics for 31 days.',          icon: '♻️', duration: '1 month', participants: 21000, co2Saved: 5.0,  joined: false, category: 'waste' },
  { id: 'coldshower',  title: 'Cold Shower Challenge', description: 'Take cold showers for 7 days to reduce water heating.', icon: '🚿', duration: '1 week',  participants: 4200,  co2Saved: 3.5,  joined: false, category: 'energy' },
  { id: 'localprod',   title: 'Local Food Fortnight',  description: 'Source all groceries locally for 14 days.',             icon: '🛒', duration: '2 weeks', participants: 6750,  co2Saved: 6.8,  joined: true,  category: 'food' },
  { id: 'zerocar',     title: 'Car-Free Weekend',      description: 'Leave the car at home for an entire weekend.',          icon: '🚶', duration: '2 days',  participants: 9100,  co2Saved: 18.0, joined: false, category: 'transport' },
];

/**
 * Pledges — Community eco-pledge board with participant counts and CO2 impact
 */
export default function Pledges() {
  const [pledges, setPledges] = useState<Pledge[]>(PLEDGES);
  const [filter, setFilter]   = useState('all');

  const categories = ['all', 'transport', 'food', 'energy', 'waste'];
  const filtered = filter === 'all' ? pledges : pledges.filter(p => p.category === filter);
  const joinedCount = pledges.filter(p => p.joined).length;

  const toggleJoin = (id: string) => {
    setPledges(prev => prev.map(p => p.id === id ? { ...p, joined: !p.joined, participants: p.joined ? p.participants - 1 : p.participants + 1 } : p));
  };

  return (
    <section aria-labelledby="pledges-heading" className="glass-card p-6 space-y-5">
      <header className="flex items-start justify-between">
        <div>
          <h2 id="pledges-heading" className="text-xl font-semibold text-emerald-400 flex items-center gap-2">
            <Target size={20} aria-hidden="true" /> Eco Pledges
          </h2>
          <p className="text-sm text-[#6B8F7E] mt-1">Join community challenges. Your action multiplies with thousands.</p>
        </div>
        {joinedCount > 0 && (
          <span className="badge badge-green shrink-0">{joinedCount} Active</span>
        )}
      </header>

      {/* Category filter */}
      <div className="tab-strip" role="tablist" aria-label="Filter pledges by category">
        {categories.map(c => (
          <button
            key={c}
            role="tab"
            aria-selected={filter === c}
            className={`tab-item capitalize ${filter === c ? 'active' : ''}`}
            onClick={() => setFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Pledge cards */}
      <ul className="space-y-3">
        {filtered.map(p => (
          <li key={p.id} className={`glass-card p-4 flex gap-4 items-start ${p.joined ? 'border-emerald-500/40' : ''}`}>
            <span className="text-2xl shrink-0" role="img" aria-label={p.title}>{p.icon}</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white">{p.title}</h3>
              <p className="text-xs text-[#6B8F7E] mt-0.5 leading-relaxed">{p.description}</p>
              <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-[#6B8F7E]">
                <span className="flex items-center gap-1"><Calendar size={10} aria-hidden="true" /> {p.duration}</span>
                <span className="flex items-center gap-1"><Users size={10} aria-hidden="true" /> {p.participants.toLocaleString()} joined</span>
                <span className="flex items-center gap-1 text-emerald-400"><Flame size={10} aria-hidden="true" /> −{p.co2Saved} kg CO₂</span>
              </div>
            </div>
            <button
              className={`shrink-0 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                p.joined
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'border-[rgba(16,185,129,0.2)] text-[#6B8F7E] hover:border-emerald-500/40 hover:text-white'
              }`}
              onClick={() => toggleJoin(p.id)}
              aria-pressed={p.joined}
              aria-label={`${p.joined ? 'Leave' : 'Join'} pledge: ${p.title}`}
            >
              {p.joined ? <><Check size={12} className="inline mr-1" aria-hidden="true" />Joined</> : 'Join'}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
