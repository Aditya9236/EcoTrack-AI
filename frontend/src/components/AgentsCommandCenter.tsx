'use client';

import React, { useState } from 'react';
import { Bot, Cpu, Zap, ShoppingBag, Car, Play, Square, Activity, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/** ── Types ── */
interface AgentDef {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  logs: string[];
}

const AGENTS: AgentDef[] = [
  {
    id: 'travel',
    name: 'Travel Optimizer',
    description: 'Analyzes commuting patterns and recommends greener routes.',
    icon: <Car size={18} />,
    color: '#10B981',
    logs: [
      '🔍 Scanning last 7 days of trip logs…',
      '📊 Comparing route alternatives via Maps API…',
      '🚌 Found 3 bus routes averaging 65% lower CO₂ than car.',
      '✅ Recommendation: Take Route 47 bus on Mon/Wed/Fri.',
      '💾 Saving suggestion to your Firestore profile…',
    ],
  },
  {
    id: 'energy',
    name: 'Smart Home Energy',
    description: 'Recommends optimal timing for high-consumption appliances.',
    icon: <Zap size={18} />,
    color: '#22D3EE',
    logs: [
      '⚡ Analyzing electricity bill scan data…',
      '📅 Identifying peak-hour usage (6–9 PM weekdays)…',
      '🕙 Recommendation: Shift laundry to off-peak (10 PM–6 AM).',
      '💡 Estimated saving: 14% electricity reduction monthly.',
      '✅ Goal generated: Off-peak Laundry Challenge (7 days).',
    ],
  },
  {
    id: 'shopper',
    name: 'Sustainable Shopper',
    description: 'Flags high-footprint purchase categories and suggests swaps.',
    icon: <ShoppingBag size={18} />,
    color: '#F59E0B',
    logs: [
      '🛒 Analyzing shopping category footprints…',
      '🔴 Flag: Beef purchase (3x/week) = highest food CO₂ source.',
      '🌱 Swap suggestion: Chickpeas or tofu (75% lower footprint).',
      '🛍️ Eco-brand alternatives identified: 4 local suppliers.',
      '✅ Pledge unlocked: Meatless Monday for 4 weeks.',
    ],
  },
];

/**
 * AgentsCommandCenter — Interactive Antigravity Agent UI panel
 * Shows specialized agents with live activity log simulation.
 */
export default function AgentsCommandCenter() {
  const { getIdToken } = useAuth();
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [logLines, setLogLines]       = useState<Record<string, string[]>>({});
  const [running, setRunning]         = useState<Record<string, boolean>>({});
  const [done, setDone]               = useState<Record<string, boolean>>({});

  const runAgent = async (agent: AgentDef) => {
    if (running[agent.id]) return;
    setRunning(p => ({ ...p, [agent.id]: true }));
    setDone(p => ({ ...p, [agent.id]: false }));
    setLogLines(p => ({ ...p, [agent.id]: [] }));
    setActiveAgent(agent.id);

    // Stream logs line-by-line with timed delays
    for (let i = 0; i < agent.logs.length; i++) {
      await new Promise(r => setTimeout(r, 700 + Math.random() * 500));
      setLogLines(p => ({ ...p, [agent.id]: [...(p[agent.id] ?? []), agent.logs[i]] }));
    }

    setRunning(p => ({ ...p, [agent.id]: false }));
    setDone(p => ({ ...p, [agent.id]: true }));
  };

  const stopAgent = (id: string) => {
    setRunning(p => ({ ...p, [id]: false }));
  };

  return (
    <section aria-labelledby="agents-heading" className="glass-card p-6 space-y-5">
      <header>
        <h2 id="agents-heading" className="text-xl font-semibold text-emerald-400 flex items-center gap-2">
          <Cpu size={20} aria-hidden="true" /> Antigravity Agent Center
        </h2>
        <p className="text-sm text-[#6B8F7E] mt-1">
          Deploy specialized AI agents to analyze your data and generate personalized eco-insights.
        </p>
      </header>

      <div className="space-y-4">
        {AGENTS.map(agent => (
          <div key={agent.id} className="glass-card p-4 space-y-3">
            {/* Agent header */}
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${agent.color}20`, color: agent.color }}
                aria-hidden="true"
              >
                {agent.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white">{agent.name}</h3>
                <p className="text-xs text-[#6B8F7E]">{agent.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {done[agent.id] && (
                  <CheckCircle size={14} className="text-emerald-400" aria-label="Agent completed" />
                )}
                {running[agent.id] && (
                  <span className="flex items-center gap-1 text-xs text-yellow-400">
                    <Activity size={12} className="animate-pulse" aria-hidden="true" />
                    Running
                  </span>
                )}
                <button
                  className={running[agent.id] ? 'btn-secondary text-xs px-2 py-1' : 'btn-primary text-xs px-3 py-1.5'}
                  onClick={() => running[agent.id] ? stopAgent(agent.id) : runAgent(agent)}
                  aria-label={`${running[agent.id] ? 'Stop' : 'Run'} ${agent.name} agent`}
                  aria-busy={running[agent.id]}
                >
                  {running[agent.id]
                    ? <><Square size={11} className="inline mr-1" aria-hidden="true" />Stop</>
                    : <><Play size={11} className="inline mr-1" aria-hidden="true" />Deploy</>
                  }
                </button>
              </div>
            </div>

            {/* Activity log console */}
            {activeAgent === agent.id && (
              <div
                className="rounded-lg bg-black/50 border border-[rgba(16,185,129,0.1)] p-3 font-mono text-xs space-y-1 max-h-32 overflow-y-auto"
                role="log"
                aria-label={`${agent.name} activity log`}
                aria-live="polite"
              >
                <p className="text-[#6B8F7E] flex items-center gap-1 mb-2">
                  <Clock size={10} aria-hidden="true" />
                  {new Date().toLocaleTimeString()} — Agent {agent.name} started
                </p>
                {(logLines[agent.id] ?? []).map((line, i) => (
                  <p key={i} className="text-emerald-300">{line}</p>
                ))}
                {running[agent.id] && (
                  <p className="text-yellow-400 animate-pulse">▌</p>
                )}
                {done[agent.id] && (
                  <p className="text-emerald-400 font-semibold mt-1">✅ Agent completed successfully.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-[10px] text-[#6B8F7E] text-center">
        Powered by Antigravity Agents · Gemini AI backend
      </p>
    </section>
  );
}
