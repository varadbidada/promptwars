"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Map as MapIcon, Home, ShoppingBag, LogOut, 
  MapPin, Radio, AlertOctagon, CornerUpLeft, CornerUpRight, ArrowUp
} from "lucide-react";

// Mock Data
const SQUAD = [
  { id: "alex",   name: "Alex K.",    hex: "#A78BFA", routeStroke: "#A78BFA", loc: "Section B, Row 12", dist: 120, eta: 3, av: "AK", x: 230, y: 50,  border: "border-[#A78BFA]", bg: "bg-[#A78BFA]", text: "text-[#A78BFA]" },
  { id: "sam",    name: "Sam R.",     hex: "#34D399", routeStroke: "#34D399", loc: "North Food Court",  dist: 55,  eta: 1, av: "SR", x: 60,  y: 160, border: "border-[#34D399]", bg: "bg-[#34D399]", text: "text-[#34D399]" },
  { id: "jordan", name: "Jordan M.",  hex: "#FB923C", routeStroke: "#FB923C", loc: "Washroom W2",       dist: 280, eta: 7, av: "JM", x: 220, y: 250, border: "border-[#FB923C]", bg: "bg-[#FB923C]", text: "text-[#FB923C]" }
];

export default function SquadTracker() {
  const [navId, setNavId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  
  // Navigation Steps Simulator State
  const [simStep, setSimStep] = useState(0);

  const active = navId ? SQUAD.find(f => f.id === navId) : null;

  return (
    <div className="min-h-screen bg-[#04060C] flex flex-col items-center justify-center p-0 md:p-8 font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes sonarRing {
          0% { transform: scale(0); opacity: 0.8; }
          100% { transform: scale(3.5); opacity: 0; }
        }
        .animate-sonar-1 { animation: sonarRing 4s cubic-bezier(0, 0.2, 0.8, 1) infinite; }
        .animate-sonar-2 { animation: sonarRing 4s cubic-bezier(0, 0.2, 0.8, 1) infinite; animation-delay: 1.33s; }
        .animate-sonar-3 { animation: sonarRing 4s cubic-bezier(0, 0.2, 0.8, 1) infinite; animation-delay: 2.66s; }
      `}} />

      <div className="w-full max-w-[390px] h-[100dvh] md:h-[844px] bg-[#080C1A] relative overflow-hidden flex flex-col md:rounded-[45px] md:border-[12px] md:border-[#1F2937] shadow-[0_30px_80px_rgba(0,0,0,0.9)] shrink-0">
        
        {/* iOS Status Bar */}
        <div className="hidden md:flex justify-between items-center px-7 pt-4 text-white text-[13px] font-semibold z-50">
            <span>9:41</span>
            <div className="flex space-x-1.5 items-center">
              <div className="w-4 h-3.5 border border-white rounded-[3px] flex items-center justify-center"><div className="w-[10px] h-2 bg-white rounded-[1px]"/></div>
              <div className="w-3.5 h-3.5 bg-white rounded-full" />
              <div className="w-6 h-3.5 border border-white rounded-[4px] p-[1px]"><div className="w-4 h-full bg-white rounded-sm"/></div>
            </div>
        </div>

        <AnimatePresence mode="wait">
           {!navId ? (
              // STATE 1: RADAR VIEW
              <motion.div 
                key="radar" 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 1.05 }} 
                transition={{ duration: 0.4 }}
                className="flex-1 flex flex-col relative z-10"
              >
                  <header className="px-6 pt-12 pb-4 shrink-0 text-center relative z-20">
                     <h1 className="text-2xl font-heading font-black text-white tracking-tight">Squad Radar</h1>
                     <p className="text-[#00E5FF] text-[11px] font-mono tracking-widest uppercase mt-1 flex justify-center items-center">
                        <Radio className="w-3 h-3 mr-1.5 animate-pulse" /> Live Polling
                     </p>
                  </header>

                  <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                     {/* Radar Stage Dimensions: 280x280 centered */}
                     <div className="w-[280px] h-[280px] relative mt-[-60px]">
                        
                        {/* CSS Sonar Rings */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-[#00E5FF] animate-sonar-1 z-0" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-[#00E5FF] animate-sonar-2 z-0" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-[#00E5FF] animate-sonar-3 z-0" />

                        {/* Static Distance Grid Rings */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140px] h-[140px] rounded-full border border-white/5 z-0 flex items-start justify-center"><span className="text-[8px] text-white/20 mt-1 font-mono">50m</span></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-white/5 z-0 flex items-start justify-center"><span className="text-[8px] text-white/20 mt-1 font-mono">100m</span></div>

                        {/* Center "You" */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_20px_#00E5FF] border-[3px] border-[#00E5FF] z-20" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#00E5FF]/20 animate-pulse z-10" />

                        {/* Dashed Line SVG for Active Hover Target */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                           {hoverId && SQUAD.map(f => f.id === hoverId && (
                              <motion.line 
                                key={`line-${f.id}`}
                                x1="140" y1="140" x2={f.x} y2={f.y} 
                                stroke={f.hex} strokeWidth="1.5" strokeDasharray="3 3"
                                initial={{ strokeDashoffset: 100 }} animate={{ strokeDashoffset: 0 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                              />
                           ))}
                        </svg>

                        {/* Plotted Friends */}
                        {SQUAD.map((f, i) => (
                           <motion.div 
                              key={f.id}
                              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 10, delay: i * 0.15 }}
                              className="absolute z-20 flex flex-col items-center"
                              style={{ left: f.x, top: f.y, transform: 'translate(-50%, -50%)' }}
                           >
                              <div className={`w-3 h-3 rounded-full ${f.bg} shadow-[0_0_15px_currentColor] box-content border-[2px] border-[#080C1A]`} />
                              <div className="mt-1.5 flex flex-col items-center">
                                 <span className={`text-[10px] font-bold ${f.text}`}>{f.name.split(' ')[0]}</span>
                                 <span className="text-[8px] text-gray-500 font-mono text-center leading-tight mt-0.5 whitespace-nowrap">{f.dist}m</span>
                              </div>
                           </motion.div>
                        ))}
                     </div>
                  </div>

                  {/* Friend Roster Panel */}
                  <div className="bg-[#101524] rounded-t-3xl border-t border-white/5 p-6 pb-28 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-30">
                     <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-5" />
                     <h3 className="text-white text-sm font-bold mb-4 font-heading">Active Roster Status</h3>
                     <div className="space-y-3">
                        {SQUAD.map((f) => (
                           <div 
                              key={`row-${f.id}`}
                              className={`flex items-center p-3.5 rounded-2xl border transition-all cursor-pointer ${hoverId === f.id ? 'bg-white/5 border-white/10' : 'bg-transparent border-transparent hover:bg-white/5'}`}
                              onMouseEnter={() => setHoverId(f.id)}
                              onMouseLeave={() => setHoverId(null)}
                              onClick={() => { setNavId(f.id); setSimStep(0); }}
                           >
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-navy ${f.bg} shrink-0`}>{f.av}</div>
                              <div className="flex-1 ml-3">
                                 <p className="text-white font-bold text-[14px]">{f.name}</p>
                                 <p className="text-gray-400 text-[11px] font-mono mt-0.5 break-words flex items-center"><MapPin className="w-3 h-3 mr-1 text-gray-500 shrink-0" /> {f.loc}</p>
                              </div>
                              <div className="text-right shrink-0">
                                 <p className="text-white font-bold text-[14px]">{f.dist}m</p>
                                 <p className="text-[#00E5FF] tracking-widest text-[9px] font-mono uppercase mt-0.5">ETA {f.eta}m</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
              </motion.div>
           ) : active ? (
              // STATE 2: GPS NAVIGATION
              <motion.div 
                 key="gps" 
                 initial={{ opacity: 0, x: 100 }} 
                 animate={{ opacity: 1, x: 0 }} 
                 exit={{ opacity: 0, x: -100 }} 
                 transition={{ duration: 0.5, type: "spring", damping: 20 }}
                 className="flex-1 flex flex-col relative z-20 pb-20"
              >
                  {/* Top Header Card */}
                  <div className="bg-[#101524]/90 backdrop-blur-md pt-14 pb-4 px-6 border-b border-white/5 flex items-center justify-between shrink-0 shadow-lg relative z-30">
                     <button onClick={() => setNavId(null)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 transition-colors">
                        <CornerUpLeft className="w-5 h-5 text-gray-300" />
                     </button>
                     <div className="flex flex-col items-center flex-1 mx-2">
                        <div className="flex items-center space-x-2">
                           <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-navy ${active.bg}`}>{active.av}</div>
                           <h2 className="text-white font-bold text-lg font-heading">{active.name}</h2>
                        </div>
                        <p className={`text-[11px] font-mono tracking-widest font-bold mt-1 ${active.text}`}>{Math.max(0, active.dist - (simStep * 40))}m REMAINING</p>
                     </div>
                     <div className={`w-10 h-10 rounded-full border-2 ${active.border} flex items-center justify-center`}>
                        <span className={`text-[12px] font-bold ${active.text}`}>{Math.max(0, active.eta - simStep)}</span>
                     </div>
                  </div>

                  {/* SVG Indoor Floor Plan & Route */}
                  <div className="relative flex-1 bg-[#04060C] overflow-hidden flex items-center justify-center shadow-inner">
                     <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:20px_20px]" />
                     
                     <svg viewBox="0 0 300 400" className="w-[120%] h-[120%] max-w-[500px] opacity-80 z-0">
                        {/* Abstract building corridors */}
                        <path d="M 50 50 L 250 50 L 250 150 L 150 150 L 150 350 L 50 350 Z" className="fill-[#0A0E1A] stroke-white/10 stroke-[3]" />
                        <path d="M 250 50 L 350 50 L 350 250 L 250 250 Z" className="fill-[#0A0E1A] stroke-white/10 stroke-[3]" />
                        
                        {/* Dynamic Nav Path Mapping (Using basic switch mapping) */}
                        {active.id === "alex" && (
                           <motion.path 
                             d="M 100 300 L 100 100 L 250 100" fill="none" stroke={active.routeStroke} strokeWidth="6" strokeDasharray="8 8"
                             initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }}
                           />
                        )}
                        {active.id === "sam" && (
                           <motion.path 
                             d="M 100 300 L 100 100 L 50 100" fill="none" stroke={active.routeStroke} strokeWidth="6" strokeDasharray="8 8"
                             initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }}
                           />
                        )}
                        {active.id === "jordan" && (
                           <motion.path 
                             d="M 100 300 L 100 200 L 250 200" fill="none" stroke={active.routeStroke} strokeWidth="6" strokeDasharray="8 8"
                             initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }}
                           />
                        )}
                        
                        {/* Dot Overlays */}
                        {active.id === "alex" && (
                           <>
                              <circle cx="250" cy="100" r="12" className={`animate-pulse ${active.bg} shadow-[0_0_20px_currentColor]`} />
                              <circle cx="100" cy={300 - (simStep * 60)} r="8" className="fill-[#00E5FF] stroke-[#080C1A] stroke-[2px]" />
                           </>
                        )}
                        {active.id === "sam" && (
                           <>
                              <circle cx="50" cy="100" r="12" className={`animate-pulse ${active.bg} shadow-[0_0_20px_currentColor]`} />
                              <circle cx="100" cy={300 - (simStep * 60)} r="8" className="fill-[#00E5FF] stroke-[#080C1A] stroke-[2px]" />
                           </>
                        )}
                        {active.id === "jordan" && (
                           <>
                              <circle cx="250" cy="200" r="12" className={`animate-pulse ${active.bg} shadow-[0_0_20px_currentColor]`} />
                              <circle cx="100" cy={300 - (simStep * 30)} r="8" className="fill-[#00E5FF] stroke-[#080C1A] stroke-[2px]" />
                           </>
                        )}
                     </svg>
                  </div>

                  {/* Turn by Turn Instructions */}
                  <div className="bg-[#101524]/90 backdrop-blur-xl border-t border-[#00E5FF]/20 px-6 pt-5 pb-8 shrink-0 relative z-30">
                     
                     <div className="flex justify-between items-center mb-5">
                        <h3 className="text-white text-xs uppercase tracking-widest font-mono font-bold text-gray-500">Route Instructions</h3>
                        <button 
                           onClick={() => setSimStep(prev => prev < 3 ? prev + 1 : 0)}
                           className="bg-[#00E5FF] text-navy px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(0,229,255,0.4)] active:scale-95 transition-transform"
                        >
                           Simulate Walk
                        </button>
                     </div>

                     <div className="space-y-3">
                        <div className={`bg-white/5 border border-white/10 rounded-xl p-4 flex items-center transition-opacity duration-500 ${simStep === 0 ? 'opacity-100' : simStep > 0 ? 'hidden' : ''}`}>
                           <div className="w-10 h-10 rounded-full bg-[#00E5FF]/20 flex items-center justify-center mr-4 shrink-0 shadow-inner">
                              <ArrowUp className="w-5 h-5 text-[#00E5FF]" />
                           </div>
                           <div className="flex-1">
                              <p className="text-white font-bold text-[15px]">Proceed straight past Gate B</p>
                              <p className="text-gray-400 text-[12px] font-medium mt-1">45m • 1 min walk</p>
                           </div>
                        </div>

                        <div className={`bg-white/5 border border-white/10 rounded-xl p-4 flex items-center transition-opacity duration-500 ${simStep === 1 ? 'opacity-100' : simStep > 1 ? 'hidden' : 'opacity-40 scale-95'}`}>
                           <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-4 shrink-0">
                              <CornerUpRight className="w-5 h-5 text-white" />
                           </div>
                           <div className="flex-1">
                              <p className="text-white font-bold text-[15px]">Turn right at Concourse 2</p>
                              <p className="text-gray-400 text-[12px] font-medium mt-1">30m • Central Atrium</p>
                           </div>
                        </div>

                        <div className={`bg-white/5 border border-white/10 rounded-xl p-4 flex items-center transition-opacity duration-500 ${simStep >= 2 ? 'opacity-100 bg-[#34D399]/10 border-[#34D399]/30' : 'opacity-20 scale-90'}`}>
                           <div className="w-10 h-10 rounded-full bg-[#34D399]/20 flex items-center justify-center mr-4 shrink-0">
                              <MapIcon className="w-5 h-5 text-[#34D399]" />
                           </div>
                           <div className="flex-1">
                              <p className="text-white font-bold text-[15px]">{simStep >= 2 ? 'Arrived at Destination' : `Arrive at ${active.loc}`}</p>
                              <p className="text-gray-400 text-[12px] font-medium mt-1">{active.name} is waiting here</p>
                           </div>
                        </div>
                     </div>

                     <button className="w-full mt-6 bg-red-500/10 border border-red-500/50 hover:bg-red-500/20 text-red-500 font-bold py-3.5 rounded-xl uppercase tracking-widest text-[12px] transition-colors flex items-center justify-center">
                        <AlertOctagon className="w-4 h-4 mr-2" /> I'm lost — alert my squad
                     </button>
                  </div>
              </motion.div>
           ) : null}
        </AnimatePresence>

        {/* Global Bottom Navigation Shell */}
        <div className="absolute w-full bottom-0 bg-[#0A0E1A]/95 border-t border-white/5 backdrop-blur-2xl z-40 pb-4 pt-1">
            <div className="flex justify-between items-center px-6 py-2">
               {[
                 { icon: Home, label: "Home" },
                 { icon: MapIcon, label: "Map" },
                 { icon: Users, label: "Squad", active: true },
                 { icon: ShoppingBag, label: "Orders" },
                 { icon: LogOut, label: "Exit" }
               ].map((item, i) => (
                 <button key={i} className={`flex flex-col items-center justify-center transition-all p-2 w-14 ${item.active ? 'text-[#00E5FF] scale-105' : 'text-gray-500 hover:text-gray-300'}`}>
                    <item.icon className={`w-5 h-5 ${item.active ? 'stroke-[2.5px] drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]' : 'stroke-[2px]'}`} />
                    <span className="text-[9px] font-semibold tracking-wider mt-1.5">{item.label}</span>
                 </button>
               ))}
            </div>
            {/* iOS home indicator */}
            <div className="w-full flex justify-center mt-1">
              <div className="w-1/3 h-[5px] bg-white/40 rounded-full" />
            </div>
        </div>

      </div>
    </div>
  );
}
