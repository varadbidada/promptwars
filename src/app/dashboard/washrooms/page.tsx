"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Droplets, CheckCircle, Bell, ArrowRight, Zap } from "lucide-react";
import { useDemo } from "@/components/Providers";

export default function WashroomsDashboard() {
  const { isDemoMode } = useDemo();
  const [sentAlerts, setSentAlerts] = useState<Record<number, boolean>>({});

  const handleSend = (id: number) => {
    setSentAlerts(prev => ({ ...prev, [id]: true }));
  };

  const [blocks, setBlocks] = useState([
    { label: "North M", capacity: 85, color: "bg-red-500", text: "text-red-400" },
    { label: "North F", capacity: 92, color: "bg-red-500", text: "text-red-400" },
    { label: "South M", capacity: 42, color: "bg-amber", text: "text-amber" },
    { label: "South F", capacity: 68, color: "bg-amber", text: "text-amber" },
    { label: "East M",  capacity: 25, color: "bg-green", text: "text-green" },
    { label: "East F",  capacity: 15, color: "bg-green", text: "text-green" },
    { label: "West M",  capacity: 12, color: "bg-green", text: "text-green" },
    { label: "West F",  capacity: 8,  color: "bg-green", text: "text-green" },
  ]);

  // Demo mode poller
  useEffect(() => {
    if (!isDemoMode) return;
    const interval = setInterval(() => {
       setBlocks(prev => prev.map(b => {
          let newCap = Math.max(0, Math.min(100, b.capacity + Math.floor(Math.random() * 9) - 3));
          let newColor = newCap > 75 ? "bg-red-500" : newCap > 40 ? "bg-amber" : "bg-green";
          let newText = newCap > 75 ? "text-red-400" : newCap > 40 ? "text-amber" : "text-green";
          return { ...b, capacity: newCap, color: newColor, text: newText };
       }));
    }, 2500);
    return () => clearInterval(interval);
  }, [isDemoMode]);

  const WashroomMap = () => (
     <div className="relative w-full h-[350px] bg-surface/30 border border-glass rounded-xl overflow-hidden flex items-center justify-center p-4 shadow-lg backdrop-blur-md">
        <div className="absolute inset-8 rounded-[40%] border-[4px] border-glass/30 pointer-events-none" />
        <div className="absolute inset-20 rounded-[40%] border-[2px] border-glass/50 pointer-events-none" />
        <div className="absolute w-[180px] h-[90px] rounded-lg border-[2px] border-glass/60 bg-surface/50 pointer-events-none shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]" />
        
        {/* Nodes directly synced to blocks state to pulse actively */}
        <div className="absolute top-[12%] left-1/2 -translate-x-1/2 flex gap-6">
           <div className={`w-6 h-6 rounded-full border-2 border-surface shadow-[0_0_15px_currentColor] transition-colors duration-1000 ${blocks[0].color}`} />
           <div className={`w-6 h-6 rounded-full border-2 border-surface shadow-[0_0_15px_currentColor] transition-colors duration-1000 ${blocks[1].color}`} />
        </div>
        <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 flex gap-6">
           <div className={`w-6 h-6 rounded-full border-2 border-surface shadow-[0_0_15px_currentColor] transition-colors duration-1000 ${blocks[2].color}`} />
           <div className={`w-6 h-6 rounded-full border-2 border-surface shadow-[0_0_15px_currentColor] transition-colors duration-1000 ${blocks[3].color}`} />
        </div>
        <div className="absolute top-1/2 right-[12%] -translate-y-1/2 flex flex-col gap-6">
           <div className={`w-6 h-6 rounded-full border-2 border-surface shadow-[0_0_15px_currentColor] transition-colors duration-1000 ${blocks[4].color}`} />
           <div className={`w-6 h-6 rounded-full border-2 border-surface shadow-[0_0_15px_currentColor] transition-colors duration-1000 ${blocks[5].color}`} />
        </div>
        <div className="absolute top-1/2 left-[12%] -translate-y-1/2 flex flex-col gap-6">
           <div className={`w-6 h-6 rounded-full border-2 border-surface shadow-[0_0_15px_currentColor] transition-colors duration-1000 ${blocks[6].color}`} />
           <div className={`w-6 h-6 rounded-full border-2 border-surface shadow-[0_0_15px_currentColor] transition-colors duration-1000 ${blocks[7].color}`} />
        </div>
     </div>
  );

  const timelineData = Array.from({ length: 30 }).map((_, i) => ({ 
      min: i + 1, 
    val: Math.min(100, (20 + ((i * 11) % 20)) + ((i >= 12 && i <= 22) ? (40 + ((i * 17) % 20)) : 0)),
      isHalftime: (i >= 12 && i <= 22)
  }));

  const suggestions = [
    { id: 1, text: "Open overflow washrooms in Zone C at 44:00 match time", metric: "Reduces peak wait by 3.5m" },
    { id: 2, text: "Deploy 2 extra cleaning staff to North block", metric: "Maintenance alert triggered" },
    { id: 3, text: "Push app notification to 8,200 fans: 'West washrooms are clear — 2 min walk'", metric: "Evens flow distribution" },
  ];

  return (
    <>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end pb-4 border-b border-glass gap-4">
          <div>
              <h1 className="text-3xl lg:text-4xl font-heading font-bold text-white drop-shadow-md">Washroom Intelligence</h1>
              <p className="text-gray-400 text-sm mt-1">Real-time facility load and deployment</p>
          </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
         <div>
            <h3 className="text-white font-heading font-semibold text-lg flex items-center mb-4"><Droplets className="w-5 h-5 text-electric mr-2" />Facility Load Map</h3>
            <WashroomMap />
         </div>

         <div className="bg-surface/40 p-6 border border-glass rounded-xl flex flex-col justify-center h-[350px] mt-11 transition-all">
            <h3 className="text-white font-heading font-semibold text-lg mb-6 border-b border-glass pb-2">Current Occupancy</h3>
            <div className="space-y-3">
               {blocks.map((b, i) => (
                 <div key={i}>
                    <div className="flex justify-between text-xs font-mono mb-1">
                       <span className="text-gray-300">{b.label}</span>
                       <span className={`font-bold transition-colors ${b.text}`}>{b.capacity}%</span>
                    </div>
                    <div className="w-full bg-glass h-2.5 rounded-full overflow-hidden">
                       <motion.div 
                          className={`h-full ${b.color} transition-colors shadow-[0_0_10px_currentColor]`}
                          animate={{ width: `${b.capacity}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                       />
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 pb-12">
         
         <div className="bg-surface/40 p-6 border border-glass rounded-xl flex flex-col shadow-lg">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-white font-heading font-semibold text-lg flex items-center">
                 <Bell className="w-5 h-5 text-amber mr-2" />
                 Predicted Rush (Next 30 Min)
               </h3>
               <div className="flex items-center space-x-2">
                 <div className="w-3 h-3 bg-amber/20 border border-amber/50 rounded-sm" />
                 <span className="text-xs text-gray-500 font-mono tracking-widest">HALFTIME SPIKE</span>
               </div>
            </div>
            
            <div className="flex-1 relative flex items-end h-[200px] gap-1 md:gap-[6px]">
                <div className="absolute top-0 bottom-0 left-[40%] right-[26%] bg-amber/10 border-l border-r border-amber/40 z-0 animate-pulse" />
                {timelineData.map((data, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end group z-10 h-full relative">
                     <div style={{ height: `${data.val}%` }} className={`w-full rounded-t-sm transition-all duration-300 ${data.isHalftime ? 'bg-amber hover:bg-amber/80' : 'bg-electric/60 hover:bg-electric'} shadow-sm`} />
                  </div>
                ))}
            </div>
            <div className="flex justify-between mt-4 pt-4 border-t border-glass text-xs font-mono text-gray-500">
               <span>NOW</span>
               <span>+15m</span>
               <span>+30m</span>
            </div>
         </div>

         <div className="flex flex-col">
            <h3 className="text-white font-heading font-semibold text-lg flex items-center mb-6 border-b border-glass pb-2">
               <Zap className="w-5 h-5 text-electric mr-2" />
               Automated Mitigations
            </h3>
            <div className="space-y-4">
               {suggestions.map((s, i) => {
                  const isSent = !!sentAlerts[s.id];
                  return (
                    <div key={s.id} className={`p-5 bg-surface/40 border ${isSent ? 'border-green/20 bg-green/5' : 'border-glass hover:border-electric/40'} rounded-xl flex items-center justify-between backdrop-blur-sm shadow-md`}>
                       <div className="pr-4">
                          <p className={`font-semibold text-sm transition-colors duration-500 ${isSent ? 'text-gray-500 line-through' : 'text-white'}`}>{s.text}</p>
                          <p className={`text-xs mt-1.5 font-mono transition-colors duration-500 ${isSent ? 'text-green/60' : 'text-electric/80'}`}>{isSent ? 'EXECUTION CONFIRMED' : `> ${s.metric}`}</p>
                       </div>
                       
                       <button onClick={() => handleSend(s.id)} disabled={isSent} className={`shrink-0 flex items-center space-x-2 px-4 py-2.5 rounded-lg font-bold text-xs font-mono transition-all duration-300 ${isSent ? 'bg-green/10 text-green border border-green/30 cursor-not-allowed' : 'bg-electric text-navy shadow-[0_0_15px_rgba(0,229,255,0.2)] hover:bg-white hover:scale-105'}`}>
                          {isSent ? (<><CheckCircle className="w-4 h-4" /><span>SENT</span></>) : (<><ArrowRight className="w-4 h-4" /><span>EXECUTE</span></>)}
                       </button>
                    </div>
                  );
               })}
            </div>
         </div>

      </div>
    </>
  );
}
