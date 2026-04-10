import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Play, RotateCcw, Activity, Globe, Zap, AlertCircle } from 'lucide-react';
import { AgentStatusRow } from './components/AgentStatusRow';
import { ActivityLog } from './components/ActivityLog';
import { FindingCard } from './components/FindingCard';
import { EvidenceDetail } from './components/EvidenceDetail';
import { MapDisplay } from './components/MapDisplay';
import { runDemoSimulation, SimFinding, SimLogEntry, MapOverlay, AgentStatus } from './lib/demoSimulation';
import { cn } from './lib/utils';

export default function App() {
  const [agents, setAgents] = useState<Record<string, AgentStatus>>({
    orchestrator: 'IDLE',
    scout_1: 'IDLE',
    scout_2: 'IDLE',
    scout_3: 'IDLE',
    priority_queue: 'IDLE',
    memory: 'IDLE',
    gis_analyst: 'IDLE',
    vision: 'IDLE',
    reasoner: 'IDLE',
    judge: 'IDLE',
    reporter: 'IDLE',
    voice: 'IDLE'
  });

  const [logs, setLogs] = useState<SimLogEntry[]>([]);
  const [overlays, setOverlays] = useState<MapOverlay[]>([]);
  const [findings, setFindings] = useState<SimFinding[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<SimFinding | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [missionSummary, setMissionSummary] = useState<string | null>(null);

  const resetSimulation = useCallback(() => {
    setIsSimulating(false);
    setAgents(prev => {
      const reset: Record<string, AgentStatus> = {};
      Object.keys(prev).forEach(k => reset[k] = 'IDLE');
      return reset;
    });
    setLogs([]);
    setOverlays([]);
    setFindings([]);
    setSelectedFinding(null);
    setMissionSummary(null);
  }, []);

  const handleLaunch = () => {
    resetSimulation();
    setIsSimulating(true);
    
    runDemoSimulation({
      onStatusChange: (newAgents) => setAgents(newAgents),
      onLog: (entry) => setLogs(prev => [...prev, entry]),
      onMapUpdate: (newOverlays) => setOverlays(newOverlays),
      onFindingConfirmed: (finding) => setFindings(prev => [finding, ...prev]),
      onMissionComplete: (summary) => {
        setMissionSummary(summary);
      }
    });
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden font-sans selection:bg-brand-primary/30">
      {/* Left Sidebar: Swarm Status */}
      <aside className="w-60 border-r border-white/5 flex flex-col bg-gray-950/50 backdrop-blur-xl z-20">
        <div className="p-4 border-b border-white/5 bg-gradient-to-b from-brand-primary/5 to-transparent">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,242,255,0.2)]">
              <Shield className="w-4 h-4 text-brand-primary" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tighter text-white uppercase leading-none">TerraSentinel</h1>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Swarm OS v2.4</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button 
              onClick={handleLaunch}
              disabled={isSimulating}
              className={cn(
                "w-full py-2 rounded-lg font-black uppercase tracking-[0.2em] text-[9px] flex items-center justify-center gap-2 transition-all duration-500",
                isSimulating 
                  ? "bg-red-500/20 text-red-500 border border-red-500/30 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.2)]" 
                  : "bg-brand-primary text-gray-950 hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(0,242,255,0.3)]"
              )}
            >
              {isSimulating ? (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  Swarm Active
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Launch Swarm
                </>
              )}
            </button>
            <button 
              onClick={resetSimulation}
              className="w-full py-2 rounded-xl font-bold uppercase tracking-widest text-[10px] text-gray-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3 h-3" />
              Reset System
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          <div className="flex items-center justify-between mb-2 px-2">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Swarm Monitoring</span>
            <span className="text-[10px] font-mono text-brand-primary/60">12 AGENTS ONLINE</span>
          </div>
          {Object.entries(agents).map(([id, status]) => (
            <AgentStatusRow key={id} name={id} status={status} />
          ))}
        </div>

        <div className="h-48 p-4 border-t border-white/5 bg-black/20">
          <ActivityLog entries={logs} />
        </div>
      </aside>

      {/* Main Content: Map & Detail */}
      <main className="flex-1 relative flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-12 border-b border-white/5 bg-gray-950/50 backdrop-blur-md flex items-center justify-between px-4 z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {missionSummary || (isSimulating ? "Mission: Global Scan..." : "System Ready")}
              </span>
            </div>
            {isSimulating && (
              <div className="flex items-center gap-3">
                <div className="h-3 w-px bg-white/10" />
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-brand-primary animate-pulse" />
                  <span className="text-[9px] font-mono text-brand-primary uppercase">Active Streams</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-1.5">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-5 h-5 rounded-full border border-gray-950 bg-gray-800 flex items-center justify-center text-[7px] font-bold text-gray-400">
                  S{i}
                </div>
              ))}
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="text-right">
              <div className="text-[9px] font-black text-white uppercase tracking-tighter">WanderHobby</div>
              <div className="text-[7px] font-bold text-brand-primary uppercase tracking-widest">Admin</div>
            </div>
          </div>
        </header>

        {/* Map Area */}
        <div className="flex-1 relative bg-gray-900">
          <MapDisplay 
            overlays={overlays} 
            selectedFindingCoords={selectedFinding?.coords} 
          />
          
          <AnimatePresence>
            {selectedFinding && (
              <EvidenceDetail 
                finding={selectedFinding} 
                onBack={() => setSelectedFinding(null)} 
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Right Sidebar: Intelligence Feed */}
      <aside className="w-64 border-l border-white/5 bg-gray-950/50 backdrop-blur-xl flex flex-col z-20">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-0.5">
            <h2 className="text-[11px] font-black text-white uppercase tracking-widest">Intelligence Feed</h2>
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-brand-primary/10 rounded border border-brand-primary/20">
              <span className="w-1 h-1 rounded-full bg-brand-primary animate-ping" />
              <span className="text-[8px] font-bold text-brand-primary uppercase">Live</span>
            </div>
          </div>
          <p className="text-[8px] text-gray-500 font-medium">Confirmed illegal mining operations.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {findings.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-gray-700" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">No Active Alerts</h3>
                  <p className="text-[10px] text-gray-600">Launch the swarm to begin global monitoring and anomaly detection.</p>
                </div>
              </motion.div>
            ) : (
              findings.map((finding) => (
                <FindingCard 
                  key={finding.id} 
                  finding={finding} 
                  onClick={setSelectedFinding}
                  selected={selectedFinding?.id === finding.id}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* System Health Footer */}
        <div className="p-4 border-t border-white/5 bg-black/20 grid grid-cols-3 gap-2">
          {[
            { label: 'Latency', value: '24ms', color: 'text-green-500' },
            { label: 'Uptime', value: '99.9%', color: 'text-green-500' },
            { label: 'Threats', value: findings.length, color: findings.length > 0 ? 'text-red-500' : 'text-gray-500' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center p-2 bg-white/5 rounded-lg border border-white/5">
              <span className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter mb-1">{stat.label}</span>
              <span className={cn("text-[10px] font-black", stat.color)}>{stat.value}</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
