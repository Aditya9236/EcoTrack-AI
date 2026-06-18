'use client';

import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, Zap, Car, Utensils, Recycle, Star, Flame, Trophy } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

/** ── Types ── */
interface Action {
  id: string;
  label: string;
  category: 'transport' | 'energy' | 'food' | 'waste';
  xp: number;
  co2: number;
  icon: React.ReactNode;
}

const ACTIONS: Action[] = [
  { id: 'transit',    label: 'Used public transit',        category: 'transport', xp: 30, co2: 4.5,  icon: <Car size={14} /> },
  { id: 'bike',       label: 'Cycled or walked instead',   category: 'transport', xp: 40, co2: 6.0,  icon: <Car size={14} /> },
  { id: 'unplug',     label: 'Unplugged idle devices',     category: 'energy',    xp: 20, co2: 1.2,  icon: <Zap size={14} /> },
  { id: 'coldwash',   label: 'Cold-wash laundry',          category: 'energy',    xp: 25, co2: 2.0,  icon: <Zap size={14} /> },
  { id: 'plantmeal',  label: 'Ate a plant-based meal',     category: 'food',      xp: 35, co2: 3.5,  icon: <Utensils size={14} /> },
  { id: 'localprod',  label: 'Bought local produce',       category: 'food',      xp: 20, co2: 1.8,  icon: <Utensils size={14} /> },
  { id: 'recycle',    label: 'Sorted and recycled waste',  category: 'waste',     xp: 20, co2: 1.5,  icon: <Recycle size={14} /> },
  { id: 'compost',    label: 'Composted food scraps',      category: 'waste',     xp: 25, co2: 2.2,  icon: <Recycle size={14} /> },
  { id: 'reusebag',   label: 'Used reusable bag/bottle',   category: 'waste',     xp: 15, co2: 0.8,  icon: <Recycle size={14} /> },
];

const CAT_COLORS: Record<string, string> = {
  transport: '#10B981',
  energy:    '#22D3EE',
  food:      '#F59E0B',
  waste:     '#A78BFA',
};

const LEVEL_TITLES = ['Seedling', 'Green Sprout', 'Eco Rookie', 'Nature Guardian', 'Forest Defender', 'Climate Champion'];

/**
 * Tracker — Gamified daily action checklist with XP rewards and Firestore sync
 */
export default function Tracker() {
  const { user, isMockMode } = useAuth();
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [xp, setXp]           = useState(0);
  const [level, setLevel]     = useState(1);
  const [streak, setStreak]   = useState(0);
  const [totalCo2, setTotalCo2] = useState(0);
  const [toast, setToast]     = useState<string | null>(null);

  // Load user XP/level from Firestore or localStorage
  useEffect(() => {
    const load = async () => {
      if (user && !isMockMode) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const d = snap.data();
          setXp(d.totalXp ?? 0);
          setLevel(d.level ?? 1);
          setStreak(d.streakCount ?? 0);
        }
      } else {
        setXp(parseInt(localStorage.getItem('eco_xp') ?? '0'));
        setLevel(parseInt(localStorage.getItem('eco_level') ?? '1'));
        setStreak(parseInt(localStorage.getItem('eco_streak') ?? '0'));
      }
    };
    load();
  }, [user]);

  const XP_PER_LEVEL = 200;
  const xpInLevel = xp % XP_PER_LEVEL;
  const progress = (xpInLevel / XP_PER_LEVEL) * 100;
  const levelTitle = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];

  const toggleAction = async (action: Action) => {
    const isChecked = checked.has(action.id);
    const next = new Set(checked);
    if (isChecked) {
      next.delete(action.id);
      setXp(p => Math.max(0, p - action.xp));
      setTotalCo2(p => Math.max(0, parseFloat((p - action.co2).toFixed(1))));
    } else {
      next.add(action.id);
      const newXp = xp + action.xp;
      const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
      setXp(newXp);
      setTotalCo2(p => parseFloat((p + action.co2).toFixed(1)));
      if (newLevel > level) {
        setLevel(newLevel);
        setToast(`🎉 Level Up! You're now a ${LEVEL_TITLES[Math.min(newLevel - 1, LEVEL_TITLES.length - 1)]}!`);
        setTimeout(() => setToast(null), 3500);
      } else {
        setToast(`+${action.xp} XP — ${action.co2} kg CO₂ saved! 🌿`);
        setTimeout(() => setToast(null), 2000);
      }

      // Sync to Firestore
      if (user && !isMockMode) {
        try {
          await updateDoc(doc(db, 'users', user.uid), {
            totalXp: newXp,
            level: newLevel,
            lastActive: serverTimestamp(),
          });
        } catch { /* Offline — will sync later */ }
      } else {
        localStorage.setItem('eco_xp', newXp.toString());
        localStorage.setItem('eco_level', newLevel.toString());
      }
    }
    setChecked(next);
  };

  const grouped = ['transport', 'energy', 'food', 'waste'].map(cat => ({
    cat,
    actions: ACTIONS.filter(a => a.category === cat),
  }));

  return (
    <section aria-labelledby="tracker-heading" className="glass-card p-6 space-y-5">
      {/* XP Header */}
      <header className="flex items-center justify-between">
        <div>
          <h2 id="tracker-heading" className="text-xl font-semibold text-emerald-400 flex items-center gap-2">
            <CheckSquare size={20} aria-hidden="true" /> Daily Eco Actions
          </h2>
          <p className="text-xs text-[#6B8F7E] mt-0.5">Check off today&apos;s green habits to earn Eco XP</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#6B8F7E]">Streak</p>
          <p className="text-emerald-400 font-bold flex items-center gap-1 justify-end">
            <Flame size={14} aria-hidden="true" /> {streak} days
          </p>
        </div>
      </header>

      {/* Level bar */}
      <div className="glass-card p-3 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <Trophy size={12} aria-hidden="true" /> Level {level} · {levelTitle}
          </span>
          <span className="text-[#6B8F7E]">{xpInLevel}/{XP_PER_LEVEL} XP</span>
        </div>
        <div className="xp-bar" role="progressbar" aria-valuenow={xpInLevel} aria-valuemax={XP_PER_LEVEL} aria-label={`${xpInLevel} of ${XP_PER_LEVEL} XP to next level`}>
          <div className="xp-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-[#6B8F7E] text-right">
          CO₂ offset today: <span className="text-emerald-400 font-medium">{totalCo2} kg</span>
        </p>
      </div>

      {/* Action groups */}
      <div className="space-y-4">
        {grouped.map(({ cat, actions }) => (
          <div key={cat}>
            <h3 className="text-xs uppercase tracking-widest text-[#6B8F7E] mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: CAT_COLORS[cat] }} aria-hidden="true" />
              {cat}
            </h3>
            <ul className="space-y-2">
              {actions.map((a) => {
                const done = checked.has(a.id);
                return (
                  <li key={a.id}>
                    <button
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                        done
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'glass-card hover:border-emerald-500/30'
                      }`}
                      onClick={() => toggleAction(a)}
                      aria-pressed={done}
                      aria-label={`${done ? 'Uncheck' : 'Check'} "${a.label}" — earns ${a.xp} XP and saves ${a.co2} kg CO₂`}
                    >
                      {done
                        ? <CheckSquare size={18} className="text-emerald-400 shrink-0" aria-hidden="true" />
                        : <Square size={18} className="text-[#6B8F7E] shrink-0" aria-hidden="true" />
                      }
                      <span className={`flex-1 text-sm ${done ? 'line-through text-[#6B8F7E]' : 'text-white'}`}>
                        {a.label}
                      </span>
                      <span className="badge badge-green text-[10px]">+{a.xp} XP</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <Star size={16} className="text-emerald-400 shrink-0" aria-hidden="true" />
          <span className="text-sm text-white">{toast}</span>
        </div>
      )}
    </section>
  );
}
