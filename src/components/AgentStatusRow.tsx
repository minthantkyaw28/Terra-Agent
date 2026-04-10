import React from 'react';
import { cn } from '../lib/utils';
import { AgentStatus } from '../lib/demoSimulation';

interface AgentStatusRowProps {
  name: string;
  status: AgentStatus;
  task?: string;
}

export const AgentStatusRow: React.FC<AgentStatusRowProps> = ({ name, status, task }) => {
  const getStatusClass = (s: AgentStatus) => {
    switch (s) {
      case 'IDLE': return 'status-idle';
      case 'SCANNING':
      case 'PROCESSING':
      case 'BUSY': return 'status-busy';
      case 'ACTIVE':
      case 'COMPLETE': return 'status-active';
      case 'OFFLINE': return 'status-offline';
      default: return 'status-idle';
    }
  };

  const getDotColor = (s: AgentStatus) => {
    switch (s) {
      case 'IDLE': return 'bg-gray-600';
      case 'SCANNING':
      case 'PROCESSING':
      case 'BUSY': return 'bg-brand-primary animate-pulse shadow-[0_0_8px_#00f2ff]';
      case 'ACTIVE': return 'bg-green-500 shadow-[0_0_8px_#22c55e]';
      case 'COMPLETE': return 'bg-brand-primary shadow-[0_0_8px_#00f2ff]';
      case 'OFFLINE': return 'bg-red-500 shadow-[0_0_8px_#ef4444]';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="flex items-center justify-between bg-white/5 p-1.5 rounded-lg border border-white/5 transition-all duration-300">
      <div className="flex items-center gap-2">
        <div className={cn("w-1.5 h-1.5 rounded-full transition-all duration-500", getDotColor(status))} />
        <span className="text-[10px] font-medium text-gray-300 capitalize">{name.replace('_', ' ')}</span>
      </div>
      <div className="flex flex-col items-end">
        <span className={cn("status-badge transition-all duration-300", getStatusClass(status))}>
          {status}
        </span>
      </div>
    </div>
  );
};
