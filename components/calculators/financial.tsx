'use client';

import { useState } from 'react';
import { BadgeDollarSign, Calculator, Percent, TrendingUp, PieChart as PieChartIcon, ArrowRightLeft, ArrowLeftRight, Landmark, Receipt } from 'lucide-react';
import { clsx } from 'clsx';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';

const TABS = [
  { id: 'emi', icon: Landmark, label: 'Loan & EMI' },
  { id: 'investment', icon: TrendingUp, label: 'Investment & SIP' },
  { id: 'salary', icon: Receipt, label: 'Income & Salary' }
] as const;

export function FinancialCalc() {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>('emi');

  // EMI State
  const [loanAmount, setLoanAmount] = useState<number>(100000);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [loanTenure, setLoanTenure] = useState<number>(10); // years

  // Calculate EMI
  const monthlyRate = interestRate / 12 / 100;
  const numPayments = loanTenure * 12;
  const emi = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  const totalPayment = emi * numPayments;
  const totalInterest = totalPayment - loanAmount;

  const emiData = [
    { name: 'Principal', value: loanAmount, color: '#3b82f6' },
    { name: 'Interest', value: totalInterest > 0 ? totalInterest : 0, color: '#f43f5e' }
  ];

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto py-4 px-2 w-full gap-6">
      
      {/* Tabs */}
      <div className="flex bg-white/5 p-1 rounded-2xl glass-panel w-fit self-center">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white/80"
              )}
            >
              <Icon className={clsx("w-4 h-4", isActive ? "text-brand-emerald" : "")} />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full">
         {/* Input Panel */}
         <div className="glass-panel p-6 rounded-2xl border border-white/10 w-full lg:w-1/3 flex flex-col gap-6">
            <h3 className="font-serif text-xl font-bold flex items-center gap-2 text-white">
               Parametrization
            </h3>

            {activeTab === 'emi' && (
               <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                     <div className="flex justify-between items-center"><label className="text-sm text-white/70 font-mono">Loan Amount</label><span className="text-brand-emerald font-mono font-medium">${loanAmount.toLocaleString()}</span></div>
                     <input type="range" min="1000" max="1000000" step="1000" value={loanAmount} onChange={e => setLoanAmount(Number(e.target.value))} className="accent-brand-emerald" />
                  </div>
                  <div className="flex flex-col gap-2">
                     <div className="flex justify-between items-center"><label className="text-sm text-white/70 font-mono">Interest Rate (p.a.)</label><span className="text-brand-emerald font-mono font-medium">{interestRate}%</span></div>
                     <input type="range" min="1" max="25" step="0.1" value={interestRate} onChange={e => setInterestRate(Number(e.target.value))} className="accent-brand-emerald" />
                  </div>
                  <div className="flex flex-col gap-2">
                     <div className="flex justify-between items-center"><label className="text-sm text-white/70 font-mono">Tenure (Years)</label><span className="text-brand-emerald font-mono font-medium">{loanTenure} Years</span></div>
                     <input type="range" min="1" max="30" step="1" value={loanTenure} onChange={e => setLoanTenure(Number(e.target.value))} className="accent-brand-emerald" />
                  </div>
               </div>
            )}
            {/* Additional input forms for SIP/Salary can be added here based on activeTab */}
            {activeTab === 'investment' && <div className="text-white/50 text-sm font-mono p-4 bg-black/20 rounded-xl border border-white/5 text-center">SIP inputs coming soon</div>}
            {activeTab === 'salary' && <div className="text-white/50 text-sm font-mono p-4 bg-black/20 rounded-xl border border-white/5 text-center">Tax brackets coming soon</div>}
         </div>

         {/* Results & Visualization */}
         <div className="flex flex-col w-full lg:w-2/3 gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col gap-1 items-start">
                  <span className="text-xs text-white/50 uppercase font-mono tracking-wider">Monthly EMI</span>
                  <span className="text-2xl font-bold text-white">${emi ? emi.toFixed(2) : '0.00'}</span>
               </div>
               <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col gap-1 items-start">
                  <span className="text-xs text-white/50 uppercase font-mono tracking-wider">Total Interest</span>
                  <span className="text-2xl font-bold text-red-400">${totalInterest > 0 ? totalInterest.toFixed(2) : '0.00'}</span>
               </div>
               <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col gap-1 items-start">
                  <span className="text-xs text-white/50 uppercase font-mono tracking-wider">Total Amount</span>
                  <span className="text-2xl font-bold text-brand-emerald">${totalPayment > 0 ? totalPayment.toFixed(2) : '0.00'}</span>
               </div>
            </div>

            {activeTab === 'emi' && (
               <div className="glass-panel p-6 rounded-2xl border border-white/10 flex-1 flex flex-col md:flex-row items-center justify-center gap-8">
                  <div className="w-[200px] h-[200px] relative">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie
                              data={emiData}
                              cx="50%" cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                              stroke="none"
                           >
                              {emiData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                           </Pie>
                           <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                        </PieChart>
                     </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-4 font-mono w-full md:w-auto">
                     {emiData.map((item) => (
                        <div key={item.name} className="flex justify-between items-center gap-8">
                           <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-sm text-white/70">{item.name}</span>
                           </div>
                           <span className="text-sm font-medium text-white">{((item.value / totalPayment) * 100).toFixed(1)}%</span>
                        </div>
                     ))}
                  </div>
               </div>
            )}
         </div>
      </div>

    </div>
  );
}
