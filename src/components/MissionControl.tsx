import React, { useState } from 'react';
import { Play, Square, Target, Layers, Sliders } from 'lucide-react';
import { motion } from 'motion/react';

interface MissionControlProps {
  onLaunch: (config: any) => void;
  onStop: () => void;
  isActive: boolean;
}

export const MissionControl: React.FC<MissionControlProps> = ({ onLaunch, onStop, isActive }) => {
  const [region, setRegion] = useState('Amazon Basin - Sector 7');
  const [resolution, setResolution] = useState(10);

  return (
    <div className="glass-panel p-4 space-y-4">
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <Target className="w-5 h-5 text-brand-secondary" />
        <h2 className="text-sm font-bold uppercase tracking-widest text-white/80">Mission Control</h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-gray-500">Target Region</label>
          <div className="relative">
            <input 
              type="text" 
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-primary/50 transition-colors"
            />
            <Layers className="absolute right-3 top-2.5 w-4 h-4 text-gray-600" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between">
            <label className="text-[10px] uppercase font-bold text-gray-500">Resolution (m/px)</label>
            <span className="text-[10px] font-mono text-brand-primary">{resolution}m</span>
          </div>
          <input 
            type="range" 
            min="10" 
            max="60" 
            step="10"
            value={resolution}
            onChange={(e) => setResolution(parseInt(e.target.value))}
            className="w-full accent-brand-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="flex gap-2 pt-2">
          {!isActive ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onLaunch({ region, resolution, threshold: 0.7 })}
              className="flex-1 bg-brand-primary text-black font-bold py-2 rounded-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,242,255,0.3)]"
            >
              <Play className="w-4 h-4 fill-current" />
              LAUNCH SWARM
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStop}
              className="flex-1 bg-red-500/20 text-red-500 border border-red-500/30 font-bold py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <Square className="w-4 h-4 fill-current" />
              ABORT MISSION
            </motion.button>
          )}
          <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
            <Sliders className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
