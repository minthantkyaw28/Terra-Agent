import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, MapPin, Activity } from 'lucide-react';
import { SimFinding } from '../lib/demoSimulation';
import { cn } from '../lib/utils';

interface FindingCardProps {
  finding: SimFinding;
  onClick: (finding: SimFinding) => void;
  selected?: boolean;
}

export const FindingCard: React.FC<FindingCardProps> = ({ finding, onClick, selected }) => {
  const getSeverityColor = (severity: number) => {
    if (severity >= 10) return 'bg-red-500';
    if (severity >= 7) return 'bg-orange-500';
    if (severity >= 4) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const getSeverityTextClass = (severity: number) => {
    if (severity >= 10) return 'text-red-500 border-red-500/30 bg-red-500/10';
    if (severity >= 7) return 'text-orange-500 border-orange-500/30 bg-orange-500/10';
    if (severity >= 4) return 'text-amber-500 border-amber-500/30 bg-amber-500/10';
    return 'text-green-500 border-green-500/30 bg-green-500/10';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => onClick(finding)}
      className={cn(
        "group cursor-pointer p-4 rounded-xl border transition-all duration-300 relative overflow-hidden",
        selected 
          ? "bg-brand-primary/10 border-brand-primary/50 shadow-[0_0_20px_rgba(0,242,255,0.15)]" 
          : "bg-white/5 border-white/5 hover:border-white/20"
      )}
    >
      {/* Severity Bar Background */}
      <div className="absolute top-0 left-0 w-1 h-full bg-white/5" />
      <motion.div 
        initial={{ height: 0 }}
        animate={{ height: `${finding.severity * 10}%` }}
        className={cn("absolute top-0 left-0 w-1 transition-all duration-1000", getSeverityColor(finding.severity))}
      />

      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-lg">{finding.flag}</span>
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{finding.region}</span>
          </div>
          <h3 className="text-sm font-bold text-gray-100 leading-tight">{finding.miningType}</h3>
        </div>
        <div className={cn(
          "px-2 py-1 rounded text-[10px] font-black border uppercase tracking-tighter",
          getSeverityTextClass(finding.severity)
        )}>
          {finding.severity >= 10 ? 'CRITICAL' : 'CONFIRMED'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
          <MapPin className="w-3 h-3" />
          <span>{finding.coords[0].toFixed(1)}°, {finding.coords[1].toFixed(1)}°</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono justify-end">
          <Activity className="w-3 h-3" />
          <span>Δ NDVI: {finding.ndviDelta.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {finding.features.slice(0, 2).map((feature) => (
          <span 
            key={feature} 
            className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-mono text-gray-400 uppercase"
          >
            {feature.replace('_', ' ')}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-1 text-[10px] font-bold text-brand-primary/80">
          <span className="animate-pulse">●</span>
          <span>{(finding.confidence * 100).toFixed(0)}% CONFIDENCE</span>
        </div>
        <button className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-white group-hover:text-brand-primary transition-colors">
          VIEW EVIDENCE
          <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};
