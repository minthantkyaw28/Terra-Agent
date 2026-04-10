import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Volume2, Download, ExternalLink, ShieldCheck, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

interface FindingDetailsProps {
  finding: any;
  onClose: () => void;
}

export const FindingDetails: React.FC<FindingDetailsProps> = ({ finding, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleAudio = () => {
    // In a real app, this would control an <audio> element
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setTimeout(() => setIsPlaying(false), 5000); // Mock end
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="glass-panel w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              finding.verdict.severity >= 8 ? "bg-red-500/20 text-red-500" : "bg-orange-500/20 text-orange-500"
            )}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{finding.verdict.mining_type}</h2>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                <span>ID: {finding.finding_id}</span>
                <span>•</span>
                <span>LOC: {finding.bbox[0].toFixed(4)}, {finding.bbox[1].toFixed(4)}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 flex gap-8">
          {/* Left Column: Report */}
          <div className="flex-1 space-y-6">
            <div className="prose prose-invert max-w-none">
              <div 
                className="report-content text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: finding.report_html }} 
              />
            </div>
          </div>

          {/* Right Column: Actions & Metadata */}
          <div className="w-72 space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
              <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Intelligence Briefing</h3>
              <button 
                onClick={toggleAudio}
                className={cn(
                  "w-full py-3 rounded-lg flex items-center justify-center gap-3 font-bold transition-all",
                  isPlaying 
                    ? "bg-brand-primary text-black shadow-[0_0_20px_rgba(0,242,255,0.4)]" 
                    : "bg-white/10 text-white hover:bg-white/20"
                )}
              >
                <Volume2 className={cn("w-5 h-5", isPlaying && "animate-bounce")} />
                {isPlaying ? "PLAYING BRIEFING..." : "PLAY AUDIO BRIEF"}
              </button>
              <p className="text-[10px] text-gray-500 italic text-center">
                Voice synthesized by VoiceAgent (Gradio TTS)
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Chain of Custody</h3>
              <div className="space-y-2">
                {[
                  { agent: 'GIS Analyst', status: 'Verified' },
                  { agent: 'Vision Engine', status: 'Classified' },
                  { agent: 'Reasoner', status: 'Analyzed' },
                  { agent: 'Judge', status: 'Confirmed' },
                ].map((step, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-400">{step.agent}</span>
                    <div className="flex items-center gap-1 text-green-500">
                      <ShieldCheck className="w-3 h-3" />
                      <span className="font-bold">{step.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button className="w-full py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                <Download className="w-4 h-4" />
                EXPORT GEOJSON
              </button>
              <button className="w-full py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                <ExternalLink className="w-4 h-4" />
                STAC BROWSER
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
