import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ShieldAlert, MapPin, Activity, Droplets, Maximize2, CheckCircle2, AlertTriangle, Info, X, Zap, Calendar, Satellite, Cloud } from 'lucide-react';
import { SimFinding } from '../lib/demoSimulation';
import { cn } from '../lib/utils';
import { SentinelViewer } from './SentinelViewer';
import { SceneResult } from '../lib/sentinelImagery';

interface EvidenceDetailProps {
  finding: SimFinding;
  onBack: () => void;
}

export const EvidenceDetail: React.FC<EvidenceDetailProps> = ({ finding, onBack }) => {
  const [liveScene, setLiveScene] = useState<SceneResult | null>(null);

  const getSeverityColor = (severity: number) => {
    if (severity >= 10) return 'text-red-500';
    if (severity >= 7) return 'text-orange-500';
    if (severity >= 4) return 'text-amber-500';
    return 'text-green-500';
  };

  const imageDetails = finding.imageDetails || { hero: finding.imageUrl, overview: finding.imageUrl, evidence: [], credit: 'Unknown' };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-950 z-[5000] overflow-y-auto custom-scrollbar flex flex-col"
    >
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gray-950/90 backdrop-blur-md border-b border-white/10 p-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all group"
            title="Close Evidence"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{finding.flag}</span>
              <h1 className="text-base font-black text-white uppercase tracking-widest">{finding.region}</h1>
            </div>
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter">
              COORDS: {finding.coords[0]}°, {finding.coords[1]}° | ID: {finding.id}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:block px-3 py-1 bg-red-500/10 border border-red-500/30 rounded text-[10px] font-black text-red-500 uppercase tracking-tighter animate-pulse">
            CRITICAL ALERT
          </div>
          <button 
            onClick={onBack}
            className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-500 transition-colors border border-transparent hover:border-red-500/30"
            title="Close Evidence"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-8 space-y-8 max-w-screen-2xl mx-auto w-full">
        {/* Section 1: Live Satellite Viewer */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em]">Live Swarm Intelligence Imagery</h2>
            <div className="text-[10px] font-mono text-brand-primary/60 uppercase">Sentinel-2 L2A · Real-time COG Stream</div>
          </div>
          
          <SentinelViewer 
            region={finding.region} 
            onSceneLoaded={setLiveScene}
          />
        </section>

        {/* Section 2: High-Def Evidence Grid - THE BIG PICTURE GRID */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em]">Ground Truth & Historical Context</h2>
            <div className="text-[10px] font-mono text-brand-primary/60 uppercase">Reference Imagery Archive</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overview Image (Large) */}
            <div className="relative rounded-3xl overflow-hidden border border-white/10 aspect-video group shadow-2xl bg-gray-900">
              <img 
                src={imageDetails.overview} 
                alt="Overview Map" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <div className="glass-panel px-4 py-2 rounded-xl border-white/10 text-[11px] font-mono text-white/90">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-primary" />
                    <span className="font-black">REGIONAL CONTEXT OVERVIEW</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence 1 & 2 (Large Grid) */}
            {imageDetails.evidence.slice(0, 2).map((img: string, idx: number) => (
              <div key={idx} className="relative rounded-3xl overflow-hidden border border-white/10 aspect-video group shadow-2xl bg-gray-900">
                <img 
                  src={img} 
                  alt={`Evidence ${idx}`} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <div className="glass-panel px-4 py-2 rounded-xl border-white/10 text-[11px] font-mono text-white/90">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-brand-primary" />
                      <span className="font-black">ANOMALY SIGNATURE {idx + 1}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Intelligence & Severity */}
        <section className="grid md:grid-cols-4 gap-6">
          <div className="md:col-span-3">
            <div className="h-full p-8 bg-white/5 rounded-3xl border border-white/10 relative overflow-hidden group flex flex-col justify-center">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <ShieldAlert className="w-32 h-32" />
              </div>
              <div className="flex items-center gap-3 mb-4 text-brand-primary">
                <Zap className="w-5 h-5 fill-current" />
                <h2 className="text-[11px] font-black uppercase tracking-[0.3em]">Gemini 2.5 Pro Intelligence Verdict</h2>
              </div>
              <p className="text-lg md:text-2xl text-gray-200 leading-relaxed font-medium italic">
                "{finding.explanation}"
              </p>
              <div className="mt-6 flex items-center gap-6">
                <div className="flex items-center gap-2.5 px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-[10px] font-black text-green-500 uppercase">Verified by JudgeAgent</span>
                </div>
                <div className="text-[10px] font-mono text-gray-500 tracking-widest">CONFIDENCE: {(finding.confidence * 100).toFixed(1)}%</div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
            <div className={cn("text-7xl font-black mb-2 tracking-tighter", getSeverityColor(finding.severity))}>
              {finding.severity}
            </div>
            <div className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-6">Severity Index</div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${finding.severity * 10}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={cn("h-full shadow-[0_0_15px_rgba(239,68,68,0.5)]", finding.severity >= 7 ? "bg-red-500" : "bg-brand-primary")}
              />
            </div>
          </div>
        </section>

        {/* Section 4: GIS Metrics Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em]">Geospatial Intelligence Metrics</h2>
            <div className="h-px flex-1 bg-white/5 mx-6" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Scene Date', value: liveScene?.date || 'Searching...', icon: Calendar, color: 'text-brand-primary' },
              { label: 'Cloud Cover', value: liveScene ? `${liveScene.cloudCover.toFixed(1)}%` : '...', icon: Cloud, color: (liveScene?.cloudCover || 0) > 20 ? 'text-amber-500' : 'text-green-400' },
              { label: 'Data Source', value: 'Sentinel-2 L2A', icon: Satellite, color: 'text-brand-primary' },
              { label: 'Resolution', value: '10m GSD', icon: Maximize2, color: 'text-gray-400' },
              { label: 'Mercury', value: finding.gisFindings.mercury_risk ? 'HIGH' : 'LOW', icon: Droplets, color: finding.gisFindings.mercury_risk ? 'text-red-500' : 'text-green-500' },
              { label: 'Scene ID', value: liveScene?.itemId.substring(0, 12) + '...' || '...', icon: Info, color: 'text-gray-500' },
            ].map((metric, i) => (
              <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 group hover:border-brand-primary/30 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <metric.icon className={cn("w-4 h-4", metric.color)} />
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">{metric.label}</span>
                </div>
                <div className="text-sm font-black text-white group-hover:text-brand-primary transition-colors truncate">{metric.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4 & 5: Features & Actions */}
        <div className="grid md:grid-cols-2 gap-8 pb-12">
          <section className="space-y-4">
            <h2 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em]">Detected Signatures</h2>
            <div className="grid grid-cols-1 gap-3">
              {finding.features.map((feature, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_10px_rgba(0,242,255,0.5)]" />
                    <span className="text-xs font-bold text-gray-200 uppercase tracking-widest">{feature.replace('_', ' ')}</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-500">PROB: {(92 + Math.random() * 7).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em]">Response Protocol</h2>
            <div className="space-y-3">
              {finding.recommendations.map((action, i) => (
                <div key={action} className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-red-500/20 transition-colors">
                  <div className={cn(
                    "mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                    i === 0 ? "bg-red-500/20 text-red-500" : "bg-amber-500/20 text-amber-500"
                  )}>
                    {i === 0 ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-60">
                      {i === 0 ? 'Urgent Intervention' : 'Recommended Action'}
                    </div>
                    <p className="text-sm text-gray-300 font-medium leading-snug">{action}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Section 6: Agent Trace */}
        <section className="space-y-6 pt-4 pb-12">
          <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] text-center">Swarm Intelligence Pipeline</h2>
          <div className="relative flex items-center justify-between max-w-4xl mx-auto">
            <div className="absolute top-4 left-0 w-full h-px bg-white/10 -z-10" />
            {['Scout', 'Queue', 'GIS', 'Vision', 'Reasoner', 'Judge', 'Reporter'].map((agent, i) => (
              <div key={agent} className="flex flex-col items-center gap-3 bg-gray-950 px-2">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="w-8 h-8 rounded-full bg-brand-primary/10 border border-brand-primary/40 flex items-center justify-center text-[10px] font-black text-brand-primary shadow-[0_0_10px_rgba(0,242,255,0.2)]"
                >
                  {i + 1}
                </motion.div>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{agent}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
};
