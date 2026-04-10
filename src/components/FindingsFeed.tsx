import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, ChevronRight, Volume2, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

interface Finding {
  finding_id: string;
  cell_id: string;
  verdict: {
    severity: number;
    mining_type: string;
    confidence: number;
  };
  confirmed_at: string;
}

interface FindingsFeedProps {
  findings: Finding[];
  onSelect: (finding: Finding) => void;
  selectedId?: string;
}

export const FindingsFeed: React.FC<FindingsFeedProps> = ({ findings, onSelect, selectedId }) => {
  return (
    <div className="glass-panel p-4 h-full flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-500" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-white/80">Confirmed Findings</h2>
        </div>
        <span className="bg-red-500/20 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/30">
          {findings.length} DETECTED
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {findings.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-2 opacity-50">
              <ShieldAlert className="w-8 h-8" />
              <span className="text-[10px] uppercase font-bold">No threats detected yet</span>
            </div>
          ) : (
            findings.map((finding) => (
              <motion.div
                key={finding.finding_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => onSelect(finding)}
                className={cn(
                  "group cursor-pointer p-3 rounded-lg border transition-all duration-200",
                  selectedId === finding.finding_id 
                    ? "bg-brand-primary/10 border-brand-primary/50 shadow-[0_0_15px_rgba(0,242,255,0.1)]" 
                    : "bg-white/5 border-white/5 hover:border-white/20"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-gray-500 uppercase">{finding.finding_id}</span>
                    <span className="text-xs font-bold text-gray-200">{finding.verdict.mining_type}</span>
                  </div>
                  <div className={cn(
                    "w-8 h-8 rounded flex items-center justify-center font-mono text-xs font-bold",
                    finding.verdict.severity >= 8 ? "bg-red-500/20 text-red-500" : "bg-orange-500/20 text-orange-500"
                  )}>
                    {finding.verdict.severity}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <FileText className="w-3 h-3 text-gray-500" />
                    <Volume2 className="w-3 h-3 text-gray-500" />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
                    <span>{(finding.verdict.confidence * 100).toFixed(0)}% CONF</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
