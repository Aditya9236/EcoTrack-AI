'use client';

import React, { useState } from 'react';
import { Send, Bot, User as UserIcon, Loader, Leaf } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  'How can I reduce my transport emissions?',
  'What are the easiest eco swaps at home?',
  'How does my diet affect my footprint?',
  'Tips to save electricity?',
];

/**
 * ChatBuddy — Conversational Gemini-powered Eco Assistant
 */
export default function ChatBuddy() {
  const { getIdToken } = useAuth();
  const [messages, setMessages]   = useState<Message[]>([
    { role: 'assistant', content: "👋 Hi! I'm **Eco-Buddy**, your AI sustainability coach. Ask me anything about reducing your carbon footprint!" }
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = React.useRef<HTMLDivElement>(null);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const token = await getIdToken();
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response ?? 'Sorry, I couldn\'t process that.' }]);
    } catch {
      // Keyword-based fallback
      let reply = 'Great question! Focus on reducing your biggest emission source first — even small consistent actions compound over time. 🌿';
      const lower = text.toLowerCase();
      if (lower.includes('car') || lower.includes('transport')) reply = '🚲 Swapping just 2 car trips per week for cycling or transit can save 250+ kg CO2 per year!';
      else if (lower.includes('food') || lower.includes('meat')) reply = '🥗 A plant-rich diet is one of the highest-impact personal changes — going meatless 3x/week saves ~650 kg CO2 annually!';
      else if (lower.includes('electric') || lower.includes('energy')) reply = '💡 Switching to LED bulbs, unplugging idle devices, and running cold washes can cut home electricity emissions by 20%.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } finally {
      setLoading(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  return (
    <section aria-labelledby="chat-heading" className="glass-card flex flex-col h-[500px]">
      {/* Header */}
      <header className="p-4 border-b border-[rgba(16,185,129,0.15)] flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center animate-pulse-glow">
          <Leaf size={18} className="text-emerald-400" aria-hidden="true" />
        </div>
        <div>
          <h2 id="chat-heading" className="text-sm font-semibold text-emerald-400">Eco-Buddy</h2>
          <p className="text-xs text-[#6B8F7E]">AI Sustainability Coach · Powered by Gemini</p>
        </div>
        <span className="ml-auto badge badge-green">Online</span>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" role="log" aria-label="Chat messages" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-cyan-500/20' : 'bg-emerald-500/20'}`}
              aria-hidden="true">
              {m.role === 'user' ? <UserIcon size={13} className="text-cyan-400" /> : <Bot size={13} className="text-emerald-400" />}
            </div>
            <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-cyan-500/10 border border-cyan-500/20 text-white'
                : 'bg-emerald-500/10 border border-emerald-500/20 text-[#E2FBF0]'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Bot size={13} className="text-emerald-400" />
            </div>
            <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Loader size={14} className="animate-spin text-emerald-400" aria-label="Loading response" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick prompts */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto" role="list" aria-label="Quick prompts">
        {QUICK_PROMPTS.map((q) => (
          <button
            key={q}
            role="listitem"
            className="text-xs text-emerald-400 border border-emerald-500/20 rounded-full px-3 py-1 whitespace-nowrap hover:bg-emerald-500/10 transition-colors focus-visible:outline-2 focus-visible:outline-emerald-400"
            onClick={() => sendMessage(q)}
            aria-label={`Quick prompt: ${q}`}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
        className="p-3 border-t border-[rgba(16,185,129,0.15)] flex gap-2"
        aria-label="Send message"
      >
        <input
          className="eco-input text-sm"
          placeholder="Ask Eco-Buddy anything…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          aria-label="Your message"
          maxLength={500}
        />
        <button
          type="submit"
          className="btn-primary px-3 py-2 shrink-0"
          disabled={loading || !input.trim()}
          aria-label="Send message"
        >
          <Send size={16} aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}
