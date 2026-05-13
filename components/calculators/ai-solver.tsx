'use client';
import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { BrainCircuit, Upload, Send, Trash2, Loader2, PlayCircle, Settings2 } from 'lucide-react';
import { useCalc } from '@/components/calc-context';
import { GoogleGenAI } from '@google/genai';
import { clsx } from 'clsx';
import Markdown from 'react-markdown';

export function AISolver() {
  const [query, setQuery] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isEli5, setIsEli5] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setImage(reader.result as string);
        reader.readAsDataURL(file);
     }
  };

  const handleSolve = async () => {
     if (!query && !image) return;
     try {
        setLoading(true); setResult(null);
        if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) throw new Error("Missing NEXT_PUBLIC_GEMINI_API_KEY");
        const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
        let prompt = `You are an expert mathematical and scientific AI solver.\n\nTask: Solve the provided problem step-by-step.\n\nRequirements:\n- Break down the logic clearly.\n- Output the final answer prominently.\n- Format using Markdown with math equations where necessary.\n\nProblem: ${query}`;
        if (isEli5) prompt += "\n\nCRITICAL MODIFIER: Explain this like I am 5 years old. Use simple analogies, avoid complex jargon unless explained, and make it fun and easy to understand.";
        const content: any[] = [prompt];
        if (image) {
           const base64Data = image.split(',')[1];
           const mimeType = image.split(';')[0].split(':')[1];
           content.push({ inlineData: { data: base64Data, mimeType } });
        }
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: content });
        setResult(response.text || "No response generated.");
     } catch (err: any) {
        setResult(`Error: ${err.message}`);
     } finally {
        setLoading(false);
     }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto py-4 px-2 w-full">
       <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="font-serif text-2xl font-bold flex items-center gap-2"><BrainCircuit className="w-6 h-6 text-brand-violet" /> AI Solver</h3>
            <p className="text-sm text-white/50 mt-1 font-mono">Upload an equation or describe your math problem.</p>
          </div>
          <button onClick={() => setIsEli5(!isEli5)} className={clsx("hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border", isEli5 ? "border-brand-emerald bg-brand-emerald/20 text-brand-emerald shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "border-white/10 glass-panel text-white hover:bg-white/10")}>
             <Settings2 className="w-4 h-4" /> Explain like I'm 5
          </button>
       </div>
       <div className="glass-panel p-4 md:p-6 rounded-2xl border border-white/10 mb-6 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
             <div className="flex-1">
                <textarea rows={4} value={query} onChange={e => setQuery(e.target.value)} placeholder="E.g., Solve for x: 2x^2 + 5x - 3 = 0 or upload an image..." className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder-white/30 outline-none focus:border-brand-violet transition-colors resize-none font-sans" />
             </div>
             {image && (
                <div className="relative w-full md:w-48 h-32 md:h-auto rounded-xl overflow-hidden border border-white/10 shrink-0">
                   <img src={image} alt="Upload" className="w-full h-full object-cover" />
                   <button onClick={() => setImage(null)} className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-lg text-white hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
             )}
          </div>
          <div className="flex items-center justify-between mt-2">
             <div className="flex gap-2">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-xl glass-button text-sm font-medium text-white hover:text-brand-cyan transition-colors"><Upload className="w-4 h-4" /> Image</button>
                <button onClick={() => setIsEli5(!isEli5)} className={clsx("md:hidden flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border", isEli5 ? "border-brand-emerald bg-brand-emerald/20 text-brand-emerald shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "border-white/10 glass-panel text-white hover:bg-white/10")}>ELI5</button>
             </div>
             <button onClick={handleSolve} disabled={loading || (!query && !image)} className="flex items-center gap-2 px-6 py-2 rounded-xl bg-brand-violet text-white font-medium hover:bg-brand-violet/80 transition-colors disabled:opacity-50 box-glow-violet disabled:shadow-none">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Solve
             </button>
          </div>
       </div>
       <div className="flex-1 relative">
          {(result || loading) ? (
             <div className="glass-panel rounded-2xl border border-white/10 h-full p-6 overflow-y-auto w-full">
                {loading ? (
                   <div className="flex flex-col items-center justify-center h-full text-brand-violet/50 gap-4"><BrainCircuit className="w-12 h-12 animate-pulse" /><span className="font-mono text-sm uppercase tracking-widest">Processing...</span></div>
                ) : (
                   <div className="markdown-body text-white/90 font-sans leading-relaxed text-sm md:text-base prose prose-invert max-w-none"><Markdown>{result}</Markdown></div>
                )}
             </div>
          ) : (
             <div className="glass-panel border border-white/5 rounded-2xl h-full flex flex-col items-center justify-center text-white/20 p-6 text-center">
                <BrainCircuit className="w-16 h-16 mb-4 opacity-50" />
                <p className="font-medium text-lg">AI Ready to Solve</p>
                <p className="text-sm max-w-sm mt-2 font-mono">Use Gemini AI to get explanations for complex equations, word problems, or geometric proofs.</p>
             </div>
          )}
       </div>
    </div>
  );
}
