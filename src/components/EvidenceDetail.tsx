import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ShieldAlert, MapPin, Activity, Droplets, Maximize2, CheckCircle2, AlertTriangle, Info, X, Zap } from 'lucide-react';
import { SimFinding } from '../lib/demoSimulation';
import { cn } from '../lib/utils';

interface EvidenceDetailProps {
  finding: SimFinding;
  onBack: () => void;
}

export const EvidenceDetail: React.FC<EvidenceDetailProps> = ({ finding, onBack }) => {
  const getSeverityColor = (severity: number) => {
    if (severity >= 10) return 'text-red-500';
    if (severity >= 7) return 'text-orange-500';
    if (severity >= 4) return 'text-amber-500';
    return 'text-green-500';
  };

  const imageDetails = finding.imageDetails || { hero: finding.imageUrl, overview: finding.imageUrl, evidence: [], credit: 'Unknown' };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 bg-gray-950 z-[2000] overflow-y-auto custom-scrollbar flex flex-col"
    >
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gray-950/90 backdrop-blur-md border-b border-white/10 p-4 flex items-center justify-between">
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
              <span className="text-lg">{finding.flag}</span>
              <h1 className="text-sm font-black text-white uppercase tracking-widest">{finding.region}</h1>
            </div>
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter">
              COORDS: {finding.coords[0]}°, {finding.coords[1]}° | ID: {finding.id}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-red-500/10 border border-red-500/30 rounded text-[10px] font-black text-red-500 uppercase tracking-tighter animate-pulse">
            CRITICAL ALERT
          </div>
          <button 
            onClick={onBack}
            className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-500 transition-colors border border-transparent hover:border-red-500/30"
            title="Close Evidence"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-8 max-w-6xl mx-auto w-full">
        {/* Section 1: Hero & Evidence Gallery */}
        <section className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3 relative rounded-2xl overflow-hidden border border-white/10 aspect-video group shadow-2xl">
              <img 
                src={imageDetails.hero} 
                alt="Satellite Evidence Hero" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* SVG Overlay for Polygon */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                <motion.polygon 
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                  points="35,35 65,30 70,65 40,75" 
                  className="fill-red-500/10 stroke-red-500 stroke-[0.2]"
                />
              </svg>

              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div className="glass-panel px-3 py-2 rounded-lg border-white/10 text-[10px] font-mono text-white/90">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-3 h-3 text-brand-primary" />
                    <span>ACTIVE EXCAVATION DETECTED</span>
                  </div>
                  <div className="text-gray-400 uppercase">CREDIT: {imageDetails.credit}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex-1 relative rounded-xl overflow-hidden border border-white/10 group">
                <img 
                  src={imageDetails.overview} 
                  alt="Overview Map" 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="px-2 py-1 bg-black/60 backdrop-blur-md rounded border border-white/20 text-[8px] font-black uppercase tracking-widest">Overview</div>
                </div>
              </div>
              {imageDetails.evidence.slice(0, 2).map((img: string, idx: number) => (
                <div key={idx} className="flex-1 relative rounded-xl overflow-hidden border border-white/10 group">
                  <img 
                    src={img} 
                    alt={`Evidence ${idx}`} 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="px-2 py-1 bg-black/60 backdrop-blur-md rounded border border-white/20 text-[8px] font-black uppercase tracking-widest">Evidence {idx + 1}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: Intelligence Summary */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ShieldAlert className="w-24 h-24" />
              </div>
              <div className="flex items-center gap-3 mb-4 text-brand-primary">
                <Zap className="w-5 h-5 fill-current" />
                <h2 className="text-xs font-black uppercase tracking-[0.2em]">Gemini 2.5 Pro Intelligence Verdict</h2>
              </div>
              <p className="text-lg text-gray-200 leading-relaxed font-medium italic">
                "{finding.explanation}"
              </p>
              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-[10px] font-black text-green-500 uppercase">Verified by JudgeAgent</span>
                </div>
                <div className="text-[10px] font-mono text-gray-500">CONFIDENCE SCORE: {(finding.confidence * 100).toFixed(1)}%</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
              <div className={cn("text-6xl font-black mb-2 tracking-tighter", getSeverityColor(finding.severity))}>
                {finding.severity}
              </div>
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Threat Severity Index</div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${finding.severity * 10}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={cn("h-full shadow-[0_0_10px_rgba(239,68,68,0.5)]", finding.severity >= 7 ? "bg-red-500" : "bg-brand-primary")}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: GIS Metrics Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Geospatial Intelligence Metrics</h2>
            <div className="h-px flex-1 bg-white/5 mx-4" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'NDVI Delta', value: finding.ndviDelta.toFixed(2), icon: Activity, color: 'text-red-400' },
              { label: 'Area Disturbed', value: `${finding.disturbanceKm2} km²`, icon: Maximize2, color: 'text-orange-400' },
              { label: 'Features', value: finding.features.length, icon: ShieldAlert, color: 'text-brand-primary' },
              { label: 'Mercury Risk', value: finding.gisFindings.mercury_risk ? 'HIGH' : 'LOW', icon: Droplets, color: finding.gisFindings.mercury_risk ? 'text-red-500' : 'text-green-500' },
              { label: 'Velocity', value: finding.spreadVelocity.toUpperCase(), icon: Activity, color: 'text-amber-400' },
              { label: 'Data Source', value: 'S-2 / L-8', icon: Info, color: 'text-gray-400' },
            ].map((metric, i) => (
              <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all group">
                <div className="flex items-center gap-2 mb-2">
                  <metric.icon className={cn("w-3.5 h-3.5", metric.color)} />
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">{metric.label}</span>
                </div>
                <div className="text-lg font-black text-white group-hover:text-brand-primary transition-colors">{metric.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4 & 5: Features & Actions */}
        <div className="grid md:grid-cols-2 gap-8">
          <section className="space-y-4">
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Detected Signatures</h2>
            <div className="space-y-2">
              {finding.features.map((feature, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(0,242,255,0.5)]" />
                    <span className="text-xs font-bold text-gray-200 uppercase tracking-widest">{feature.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-gray-500">PROB: {(92 + Math.random() * 7).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Response Protocol</h2>
            <div className="space-y-3">
              {finding.recommendations.map((action, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-red-500/20 transition-colors">
                  <div className={cn(
                    "mt-1 w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
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
