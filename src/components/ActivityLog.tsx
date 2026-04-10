import React, { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';
import { SimLogEntry } from '../lib/demoSimulation';
import { cn } from '../lib/utils';

interface ActivityLogProps {
  entries: SimLogEntry[];
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ entries }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-2 text-gray-500 border-b border-white/5 pb-1">
        <Terminal className="w-3 h-3" />
        <span className="uppercase font-bold tracking-widest text-[10px]">Swarm Event Log</span>
      </div>
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar scroll-smooth pr-2"
      >
        {entries.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <span className="text-gray-700 italic text-[10px]">Waiting for swarm initialization...</span>
          </div>
        )}
        {entries.map((entry, i) => (
          <div 
            key={i} 
            className={cn(
              "flex gap-2 animate-in fade-in slide-in-from-left-2 duration-500 text-[10px] font-mono leading-tight",
              entry.type === 'alert' ? "text-amber-400/90" : 
              entry.type === 'success' ? "text-green-400/90" : "text-brand-primary/80"
            )}
          >
            <span className="text-gray-600 shrink-0">[{entry.timestamp}]</span>
            <span className="font-black shrink-0 opacity-80">[{entry.agent}]</span>
            <span className="text-gray-300/90">{entry.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
