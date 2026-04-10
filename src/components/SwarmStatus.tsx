import React from 'react';
import { motion } from 'motion/react';
import { Activity, Cpu, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

interface SwarmStatusProps {
  agents: Record<string, string>;
}

export const SwarmStatus: React.FC<SwarmStatusProps> = ({ agents }) => {
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'idle': return 'status-idle';
      case 'busy': return 'status-busy';
      case 'active': return 'status-active';
      case 'offline': return 'status-offline';
      default: return 'status-idle';
    }
  };

  return (
    <div className="glass-panel p-4 h-full flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <Activity className="w-5 h-5 text-brand-primary" />
        <h2 className="text-sm font-bold uppercase tracking-widest text-white/80">Swarm Monitoring</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {Object.entries(agents).map(([id, status]) => (
          <motion.div 
            key={id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between bg-white/5 p-2 rounded-lg border border-white/5"
          >
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                status === 'BUSY' ? "bg-brand-primary animate-pulse shadow-[0_0_8px_#00f2ff]" : "bg-gray-600"
              )} />
              <span className="text-xs font-medium text-gray-300 capitalize">{id.replace('_', ' ')}</span>
            </div>
            <span className={cn("status-badge", getStatusClass(status as string))}>
              {status as string}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[10px] text-gray-500 uppercase font-bold">
        <div className="flex items-center gap-1">
          <Cpu className="w-3 h-3" />
          <span>7 Nodes Active</span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-yellow-500" />
          <span>Syncing...</span>
        </div>
      </div>
    </div>
  );
};
