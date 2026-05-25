'use client';
import { BrainCircuit, Sparkles, Send } from 'lucide-react';
import { useState } from 'react';

export function AIAssist() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I am your Math & Science copilot. Need a step-by-step breakdown of an equation, or want to understand a formula?' }
  ]);

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full overflow-hidden relative">
      {/* Background ambient glow */}
      <div className="absolute inset-0 top-1/4 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50 blur-3xl" />

      <div className="flex items-center justify-between p-4 px-6 md:px-8 border-b border-white/5 bg-black/40 backdrop-blur-md z-10 shrink-0">
        <h3 className="font-serif text-2xl font-bold flex items-center gap-2 text-white">
          <BrainCircuit className="w-6 h-6 text-white" /> AI Assist
        </h3>
        <span className="bg-white text-black font-bold font-mono text-[10px] px-2 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-[0_0_10px_rgba(255,255,255,0.5)]">
           <Sparkles className="w-3 h-3" /> Gemini Pro
        </span>
      </div>

      <div className="flex-1 overflow-y-auto w-full p-4 md:p-8 flex flex-col gap-6 scrollbar-hide z-10">
         {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-[85%] md:max-w-[70%] p-5 rounded-3xl ${
                  msg.role === 'user' 
                  ? 'bg-white/10 border border-white/20 rounded-tr-sm text-white' 
                  : 'bg-black/60 border border-white/10 rounded-tl-sm text-white/90 shadow-2xl glass-panel'
               }`}>
                  <p className="font-sans leading-relaxed text-sm md:text-base">
                     {msg.text}
                  </p>
               </div>
            </div>
         ))}
      </div>

      <div className="p-4 md:p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-10 shrink-0">
         <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-2 rounded-2xl backdrop-blur-xl shadow-2xl focus-within:bg-white/10 focus-within:border-white/30 transition-all">
            <input 
               type="text" 
               className="flex-1 bg-transparent border-none text-white px-4 outline-none placeholder:text-white/30 font-sans"
               placeholder="Ask for an explanation, formula, or type a math problem..."
            />
            <button className="bg-white text-black p-3 rounded-xl hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.3)]">
               <Send className="w-5 h-5" />
            </button>
         </div>
         <div className="flex items-center justify-center gap-4 mt-4">
            <button className="text-xs font-mono text-white/30 hover:text-white/60 transition-colors hover:underline">Explain limits</button>
            <button className="text-xs font-mono text-white/30 hover:text-white/60 transition-colors hover:underline">Solve Ax = b</button>
            <button className="text-xs font-mono text-white/30 hover:text-white/60 transition-colors hover:underline">Plot a 3D surface</button>
         </div>
      </div>
    </div>
  );
}
