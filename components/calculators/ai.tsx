'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Send, Loader2, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export function AIHelper() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage = query.trim();
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("Gemini API key is not configured.");
      
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: [
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: "You are OmniCalc AI, a math genius and advanced mathematical assistant within a futuristic calculator app. Help the user solve math problems, explain financial concepts, or set up equations. Answer concisely and use standard mathematical notation. If relevant, show step-by-step working.",
        }
      });

      setMessages(prev => [...prev, { role: 'ai', content: response.text || "No response generated." }]);
    } catch (error) {
       setMessages(prev => [...prev, { role: 'ai', content: `Error: ${error instanceof Error ? error.message : "Something went wrong"}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto pt-4 pb-0">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-brand-emerald/10 text-brand-emerald mb-3 box-glow-emerald">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-white tracking-tight">OmniCalc AI Helper</h1>
        <p className="text-white/50 text-sm mt-2">Ask complex math problems, or explore advanced formulas.</p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 glass-panel rounded-2xl overflow-hidden flex flex-col mb-4">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
             <div className="h-full flex flex-col items-center justify-center text-white/30 text-sm text-center px-8">
               <p>&quot;If I deposit $500 monthly at 7% for 20 years, what will I have?&quot;</p>
               <p className="mt-2 text-brand-emerald/50">&quot;Solve the integral of x^2 * e^x dx&quot;</p>
             </div>
          )}
          
          {messages.map((msg, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={i}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`
                max-w-[85%] rounded-2xl px-5 py-3 text-sm md:text-base leading-relaxed break-words font-sans
                ${msg.role === 'user' 
                  ? 'bg-brand-emerald/20 text-white border border-brand-emerald/30 shadow-[0_4px_15px_rgba(16,185,129,0.1)]' 
                  : 'bg-white/5 text-white/90 border border-white/10'}
              `}>
                {msg.content.split('\n').map((line, idx) => (
                  <p key={idx} className={line === '' ? 'h-4' : ''}>{line}</p>
                ))}
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start">
              <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-brand-emerald flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-mono">Computing...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-black/20 border-t border-white/10">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask OmniCalc..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-4 pr-12 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-emerald/50 focus:ring-1 focus:ring-brand-emerald/50 transition-all font-sans"
            />
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="absolute right-2 p-2 rounded-lg text-brand-emerald hover:bg-brand-emerald/10 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="text-center mt-3 text-xs text-brand-emerald/60">
            Powered by Google Gemini 3.1 Pro
          </div>
        </div>
      </div>
    </div>
  );
}
