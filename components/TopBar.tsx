'use client';

import { useSettingsStore } from '@/store/settingsStore';
import { History, Settings, Palette, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { SidebarContent } from './Sidebar';

export function TopBar() {
  const toggleHistory = useSettingsStore(state => state.toggleHistory);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-[#0f0f16]/50 backdrop-blur-md shrink-0">
        <div className="flex items-center md:hidden">
          <ActionButton 
            icon={<Menu className="w-5 h-5 text-gray-300" />} 
            onClick={() => setMobileMenuOpen(true)} 
            label="Menu" 
          />
        </div>
        <div className="hidden md:flex items-center"></div>
        <div className="flex items-center gap-3 space-x-1">
          <ActionButton icon={<History className="w-4 h-4" />} onClick={toggleHistory} label="History" />
          <ActionButton icon={<Palette className="w-4 h-4" />} onClick={() => {}} label="Theme" />
          <ActionButton icon={<Settings className="w-4 h-4" />} onClick={() => {}} label="Settings" />
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div 
              initial={{ x: '-100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '-100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-64 h-full bg-[#0f0f16]/95 border-r border-white/10 flex flex-col pt-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-6 flex justify-end">
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SidebarContent onItemClick={() => setMobileMenuOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ActionButton({ icon, onClick, label }: { icon: React.ReactNode, onClick: () => void, label: string }) {
  return (
    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClick} className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all shadow-sm" aria-label={label}>
      {icon}
    </motion.button>
  );
}
