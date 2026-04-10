/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Activity, 
  Map as MapIcon, 
  ShieldAlert, 
  FileText, 
  Volume2, 
  Layers, 
  Settings,
  Search,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { GoogleGenAI, Modality } from "@google/genai";
import MapComponent from './components/MapComponent';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('monitor');
  const [mapCenter, setMapCenter] = useState<[number, number]>([-3.4653, -62.2159]);
  const [mapZoom, setMapZoom] = useState(12);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const [lat, setLat] = useState("-3.4653");
  const [lon, setLon] = useState("-62.2159");

  const handleAnalyze = async () => {
    setIsLoading(true);
    setIsAnalyzing(false);
    setAnalysisResult(null);

    try {
      // 1. Fetch Satellite Metadata
      const satelliteRes = await fetch('/api/fetch-satellite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: parseFloat(lat), lon: parseFloat(lon), radius: 5000 })
      });
      const satelliteData = await satelliteRes.json();

      // 2. Analyze Region (ML Pipeline Mock)
      const analysisRes = await fetch('/api/analyze-region', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: parseFloat(lat), lon: parseFloat(lon), tile_id: satelliteData.tile_id })
      });
      const analysisData = await analysisRes.json();

      // 3. Gemini Reasoning
      if (analysisData.disturbance_detected) {
        const prompt = `
          Role: Senior Geospatial Intelligence Analyst.
          Context: You are analyzing a region for illegal mining activities based on satellite data.
          Inputs:
          - NDVI Delta: ${analysisData.ndvi_delta}
          - Features Detected: ${analysisData.features.join(', ')}
          - Location: ${lat}, ${lon}
          - Disturbance Detected: ${analysisData.disturbance_detected}

          Task:
          1. Confirm if illegal mining is likely.
          2. Assign a severity score (1-10).
          3. Classify the mining type (e.g., Alluvial, Open-pit).
          4. Assess environmental impact (e.g., Deforestation, Water pollution).
          5. Recommend immediate actions for authorities.

          Output Format: JSON with fields: summary, severity, mining_type, impact, recommendations (array).
        `;

        const response = await ai.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });

        const geminiInsights = JSON.parse(response.text || "{}");
        analysisData.ai_summary = geminiInsights.summary;
        analysisData.severity = geminiInsights.severity;
        analysisData.mining_type = geminiInsights.mining_type;
        analysisData.impact = geminiInsights.impact;
        analysisData.recommendations = geminiInsights.recommendations;
      } else {
        analysisData.ai_summary = "No significant geospatial disturbances detected in the target area. Spectral signatures remain consistent with baseline vegetation levels.";
      }

      setAnalysisResult(analysisData);
      setMapCenter([parseFloat(lat), parseFloat(lon)]);
      setMapZoom(14);
      setIsAnalyzing(true);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = () => {
    if (!analysisResult) return;
    
    const reportHtml = `
      <html>
        <head>
          <title>TerraAgent Intelligence Report</title>
          <style>
            body { font-family: sans-serif; padding: 40px; background: #f4f4f4; }
            .report { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); max-width: 800px; margin: auto; }
            h1 { color: #ef4444; border-bottom: 2px solid #ef4444; padding-bottom: 10px; }
            .meta { color: #666; font-size: 12px; margin-bottom: 20px; }
            .stat { display: inline-block; margin-right: 20px; }
            .stat-val { font-weight: bold; font-size: 20px; }
            .section { margin-top: 30px; }
            .section-title { font-weight: bold; text-transform: uppercase; font-size: 12px; color: #999; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="report">
            <h1>TerraAgent Intelligence Report</h1>
            <div class="meta">Generated on ${new Date().toLocaleString()} | LAT: ${lat} | LON: ${lon}</div>
            
            <div class="section">
              <div class="stat">
                <div class="section-title">Severity Score</div>
                <div class="stat-val">${analysisResult.severity}/10</div>
              </div>
              <div class="stat">
                <div class="section-title">NDVI Delta</div>
                <div class="stat-val">${analysisResult.ndvi_delta.toFixed(4)}</div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">AI Summary</div>
              <p>${analysisResult.ai_summary}</p>
            </div>

            <div class="section">
              <div class="section-title">Impact Assessment</div>
              <p>${analysisResult.impact}</p>
            </div>

            <div class="section">
              <div class="section-title">Recommendations</div>
              <ul>
                ${analysisResult.recommendations.map((r: string) => `<li>${r}</li>`).join('')}
              </ul>
            </div>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleVoiceSummary = async () => {
    if (!analysisResult) return;
    setIsLoading(true);

    try {
      const prompt = `Summarize these findings for a mission briefing: ${analysisResult.ai_summary}. Keep it under 30 seconds.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Charon' }, // Deep, authoritative voice
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0))],
          { type: 'audio/wav' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch (error) {
      console.error("TTS failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (



    <div className="flex h-screen w-screen bg-black text-white font-sans overflow-hidden technical-grid">

      {/* Left Navigation Rail */}
      <nav className="w-16 border-r border-neutral-800 flex flex-col items-center py-6 gap-8 bg-black/50 backdrop-blur-md z-50">
        <div className="w-10 h-10 bg-red-600 rounded-sm flex items-center justify-center mb-4">
          <ShieldAlert size={24} />
        </div>
        
        <button 
          onClick={() => setActiveTab('monitor')}
          className={`p-3 rounded-lg transition-colors ${activeTab === 'monitor' ? 'bg-neutral-800 text-red-500' : 'text-neutral-500 hover:text-white'}`}
        >
          <MapIcon size={20} />
        </button>
        
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`p-3 rounded-lg transition-colors ${activeTab === 'analytics' ? 'bg-neutral-800 text-red-500' : 'text-neutral-500 hover:text-white'}`}
        >
          <Activity size={20} />
        </button>
        
        <button 
          onClick={() => setActiveTab('reports')}
          className={`p-3 rounded-lg transition-colors ${activeTab === 'reports' ? 'bg-neutral-800 text-red-500' : 'text-neutral-500 hover:text-white'}`}
        >
          <FileText size={20} />
        </button>

        <div className="mt-auto flex flex-col gap-6 pb-4">
          <button className="text-neutral-500 hover:text-white"><Layers size={20} /></button>
          <button className="text-neutral-500 hover:text-white"><Settings size={20} /></button>
        </div>
      </nav>

      {/* Main Workspace */}
      <main className="flex-1 relative flex overflow-hidden">
        
        {/* Left Sidebar: Controls */}
        <aside className="w-80 border-r border-neutral-800 bg-black/80 backdrop-blur-xl p-6 flex flex-col gap-8 z-40">
          <div>
            <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-4">Target Region</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase text-neutral-600">Latitude</label>
                <input 
                  type="text" 
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="-3.4653"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 font-mono text-sm focus:border-red-500 outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase text-neutral-600">Longitude</label>
                <input 
                  type="text" 
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                  placeholder="-62.2159"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 font-mono text-sm focus:border-red-500 outline-none transition-colors"
                />
              </div>
              <button 
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-neutral-800 text-white font-bold py-3 rounded flex items-center justify-center gap-2 transition-all group"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Search size={18} className="group-hover:scale-110 transition-transform" />
                    ANALYZE REGION
                  </>
                )}
              </button>

            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-4">Active Alerts</h2>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 border border-neutral-800 rounded bg-neutral-900/50 hover:bg-neutral-800/50 cursor-pointer transition-colors group">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-mono text-red-500 font-bold">CRITICAL</span>
                    <span className="text-[10px] font-mono text-neutral-600">2H AGO</span>
                  </div>
                  <p className="text-xs font-medium group-hover:text-red-400 transition-colors">Illegal Clearing Detected</p>
                  <p className="text-[10px] text-neutral-500 font-mono mt-1">LAT: -3.465 | LON: -62.215</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800">
            <div className="flex items-center justify-between text-[10px] font-mono text-neutral-600">
              <span>SYSTEM STATUS</span>
              <span className="text-green-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                OPERATIONAL
              </span>
            </div>
          </div>
        </aside>

        {/* Center: Map Container */}
        <section className="flex-1 relative bg-neutral-950">
          <MapComponent 
            center={mapCenter} 
            zoom={mapZoom} 
            disturbancePoints={isAnalyzing && analysisResult?.disturbance_detected ? [{ coords: mapCenter, ndvi_delta: analysisResult.ndvi_delta }] : []}
          />

          
          {/* Map Overlays */}
          <div className="absolute top-6 right-6 flex flex-col gap-3 z-30">
            <div className="bg-black/80 backdrop-blur-md border border-neutral-800 p-3 rounded-lg shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                  <Layers size={18} className="text-neutral-400" />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-neutral-500 uppercase">Current Layer</p>
                  <p className="text-xs font-bold">Sentinel-2 (True Color)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Status Bar */}
          <div className="absolute bottom-6 left-6 right-6 h-12 bg-black/80 backdrop-blur-md border border-neutral-800 rounded-lg z-30 flex items-center px-6 justify-between">
            <div className="flex gap-8">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-neutral-500">ZOOM</span>
                <span className="text-xs font-mono">14.2</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-neutral-500">COORD</span>
                <span className="text-xs font-mono">-3.4653, -62.2159</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-neutral-500">SATELLITE</span>
                <span className="text-xs font-mono text-green-500">S2A_ACTIVE</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Sidebar: AI Insights */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.aside 
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className="w-96 border-l border-neutral-800 bg-black/90 backdrop-blur-2xl p-6 flex flex-col gap-6 z-40"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <Activity size={18} className="text-red-500" />
                  AI INTELLIGENCE
                </h2>
                <button 
                  onClick={() => setIsAnalyzing(false)}
                  className="text-neutral-500 hover:text-white"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                <div className={`p-4 rounded-lg border ${analysisResult?.disturbance_detected ? 'bg-red-900/10 border-red-900/30' : 'bg-green-900/10 border-green-900/30'}`}>
                  <p className={`text-[10px] font-mono uppercase mb-2 ${analysisResult?.disturbance_detected ? 'text-red-500' : 'text-green-500'}`}>
                    {analysisResult?.disturbance_detected ? 'Threat Assessment' : 'Region Stable'}
                  </p>
                  <div className="flex items-end gap-2">
                    <span className={`text-4xl font-bold ${analysisResult?.disturbance_detected ? 'text-red-500' : 'text-green-500'}`}>
                      {analysisResult?.severity || 0}
                    </span>
                    <span className="text-xs font-mono opacity-60 mb-1">/ 10</span>
                  </div>
                  <p className="text-xs mt-2 text-neutral-300">{analysisResult?.impact}</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-mono text-neutral-500 uppercase">Geospatial Indicators</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-neutral-900 rounded border border-neutral-800">
                      <p className="text-[10px] font-mono text-neutral-500">NDVI DELTA</p>
                      <p className={`text-lg font-bold ${analysisResult?.ndvi_delta > 0.2 ? 'text-red-400' : 'text-green-400'}`}>
                        {analysisResult?.ndvi_delta?.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-3 bg-neutral-900 rounded border border-neutral-800">
                      <p className="text-[10px] font-mono text-neutral-500">MINING TYPE</p>
                      <p className="text-xs font-bold truncate">{analysisResult?.mining_type}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-mono text-neutral-500 uppercase">Detected Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult?.features?.map((tag: string) => (
                      <span key={tag} className="px-2 py-1 bg-neutral-800 text-[10px] font-mono rounded border border-neutral-700">
                        {tag.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-mono text-neutral-500 uppercase">Gemini Reasoning</h3>
                  <p className="text-xs leading-relaxed text-neutral-400 italic">
                    "{analysisResult?.ai_summary}"
                  </p>
                </div>

                {analysisResult?.recommendations && (
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-mono text-neutral-500 uppercase">Recommended Actions</h3>
                    <div className="space-y-2">
                      {analysisResult.recommendations.map((rec: string, i: number) => (
                        <div key={i} className="flex gap-3 items-start p-2 bg-neutral-900/50 rounded border border-neutral-800/50">
                          <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center mt-0.5 shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          </div>
                          <p className="text-[11px] text-neutral-300">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>



              <div className="pt-4 border-t border-neutral-800 flex gap-3">
                <button 
                  onClick={handleGenerateReport}
                  className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold py-3 rounded flex items-center justify-center gap-2"
                >
                  <FileText size={14} />
                  REPORT
                </button>

                <button 
                  onClick={handleVoiceSummary}
                  disabled={isLoading}
                  className="flex-1 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900 text-white text-xs font-bold py-3 rounded flex items-center justify-center gap-2"
                >
                  <Volume2 size={14} />
                  VOICE
                </button>

              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
