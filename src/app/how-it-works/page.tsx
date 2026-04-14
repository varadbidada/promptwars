"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useInView, animate } from "framer-motion";
import { 
  Server, Camera, DoorOpen, Radio, Users, 
  BrainCircuit, Activity, Navigation, Smartphone, Monitor 
} from "lucide-react";

// --- Custom Components ---

function AnimatedStat({ value, suffix = "", prefix = "" }: { value: number, suffix?: string, prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  
  useEffect(() => {
    if (inView && ref.current) {
      const controls = animate(0, value, {
        duration: 2.5,
        ease: "easeOut",
        onUpdate(v) {
           if (ref.current) ref.current.textContent = `${prefix}${Math.floor(v).toLocaleString()}${suffix}`;
        }
      });
      return () => controls.stop();
    }
  }, [value, inView, prefix, suffix]);
  
  return <span ref={ref} className="tabular-nums">{prefix}0{suffix}</span>;
}

function ScanlineTransition() {
  return (
    <div className="w-full h-32 relative flex items-center justify-center overflow-hidden">
       <div className="absolute w-full h-[1px] bg-glass" />
       <motion.div 
         initial={{ width: 0, opacity: 0 }}
         whileInView={{ width: "100%", opacity: [0, 1, 0] }}
         viewport={{ once: false, margin: "-50px" }}
         transition={{ duration: 2, ease: "easeInOut" }}
         className="absolute h-[2px] bg-electric shadow-[0_0_15px_#00E5FF,0_0_30px_#00E5FF] z-10"
       />
    </div>
  );
}

const FlipCard = ({ icon: Icon, title, desc, tech }: any) => {
  const [isFlipped, setIsFlipped] = useState(false);
  return (
    <motion.div 
       className="w-full h-[320px] relative cursor-pointer"
       onClick={() => setIsFlipped(!isFlipped)}
       onMouseLeave={() => setIsFlipped(false)}
       onMouseEnter={() => setIsFlipped(true)}
       initial={{ opacity: 0, y: 30 }}
       whileInView={{ opacity: 1, y: 0 }}
       viewport={{ once: true, margin: "-50px" }}
    >
       <motion.div 
         initial={false}
         animate={{ rotateY: isFlipped ? 180 : 0 }}
         transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
         className="w-full h-full absolute [transform-style:preserve-3d]"
       >
         {/* Front */}
         <div className="absolute inset-0 [backface-visibility:hidden] bg-surface/50 border border-glass rounded-[30px] p-8 flex flex-col items-center justify-center text-center shadow-lg backdrop-blur-md">
            <div className="w-16 h-16 rounded-full bg-electric/10 border border-electric/30 flex items-center justify-center mb-6">
              <Icon className="w-8 h-8 text-electric" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-white leading-tight">{title}</h3>
            <p className="text-gray-400 mt-4 text-[15px] font-medium leading-relaxed">{desc}</p>
            <p className="absolute bottom-6 text-[10px] uppercase tracking-widest font-mono text-gray-500">Hover Details</p>
         </div>
         {/* Back */}
         <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#081B2B] border border-electric rounded-[30px] p-8 flex flex-col items-center justify-center text-center shadow-[inset_0_0_50px_rgba(0,229,255,0.15)]">
            <BrainCircuit className="w-10 h-10 text-electric mb-6 opacity-80" />
            <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-widest font-mono">Neural Pipeline</h3>
            <p className="text-electric/80 font-mono text-[13px] leading-relaxed drop-shadow-sm">{tech}</p>
         </div>
       </motion.div>
    </motion.div>
  );
}

// --- Main Page ---

export default function HowItWorks() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"]});
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-120, 0]);

  return (
    <div className="min-h-screen bg-[#04060C] overflow-hidden text-white pt-20">
      
      {/* Hero Header */}
      <section className="container mx-auto px-6 text-center pt-10 pb-20 max-w-4xl">
         <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
            <span className="text-electric font-mono text-xs uppercase tracking-[0.3em] font-bold">System Architecture</span>
            <h1 className="text-5xl md:text-7xl font-heading font-black mt-6 mb-6 tracking-tight drop-shadow-lg">Deep synchronization. <br/>Zero guesswork.</h1>
            <p className="text-xl text-gray-400 font-medium leading-relaxed">FlowVenue creates a continuous intelligence loop between your stadium's physical footprint and behavioral anticipation algorithms.</p>
         </motion.div>
      </section>

      <ScanlineTransition />

      {/* SECTION 1: The Sensor Network */}
      <section className="container mx-auto px-6 py-20 max-w-6xl">
         <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">The Sensor Network</h2>
            <p className="text-gray-400 text-lg">Ingesting thousands of physical reality data points every second.</p>
         </div>

         <div className="relative w-full aspect-square md:aspect-[2/1] bg-surface/20 border border-glass rounded-[40px] shadow-2xl backdrop-blur-sm overflow-hidden flex items-center justify-center">
            
            <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full pointer-events-none hidden md:block">
               {/* Grid background */}
               <defs>
                 <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                   <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1"/>
                 </pattern>
               </defs>
               <rect width="100%" height="100%" fill="url(#grid)" />

               {/* Turnstile to Edge */}
               <motion.path d="M 150 120 C 300 120, 400 250, 500 250" fill="none" stroke="#00E5FF" strokeWidth="2" strokeDasharray="6 6"
                 initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.5, ease: "easeInOut" }} />
               {/* CCTV to Edge */}
               <motion.path d="M 150 380 C 300 380, 400 250, 500 250" fill="none" stroke="#00E5FF" strokeWidth="2" strokeDasharray="6 6"
                 initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }} />
               {/* BLE to Edge */}
               <motion.path d="M 850 120 C 700 120, 600 250, 500 250" fill="none" stroke="#00E5FF" strokeWidth="2" strokeDasharray="6 6"
                 initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.5, ease: "easeInOut", delay: 0.4 }} />
               {/* Queue Sensor to Edge */}
               <motion.path d="M 850 380 C 700 380, 600 250, 500 250" fill="none" stroke="#00E5FF" strokeWidth="2" strokeDasharray="6 6"
                 initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.5, ease: "easeInOut", delay: 0.6 }} />
               
               {/* Signal Pulses */}
               <motion.circle r="4" fill="#fff" initial={{ offsetDistance: "0%" }} animate={{ offsetDistance: "100%" }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} style={{ offsetPath: "path('M 150 120 C 300 120, 400 250, 500 250')" }} />
               <motion.circle r="4" fill="#fff" initial={{ offsetDistance: "0%" }} animate={{ offsetDistance: "100%" }} transition={{ repeat: Infinity, duration: 2, ease: "linear", delay: 0.5 }} style={{ offsetPath: "path('M 150 380 C 300 380, 400 250, 500 250')" }} />
            </svg>

            {/* DOM Nodes mapped over SVG (Visible mostly on Desktop, stacking on Mobile) */}
            <div className="absolute z-20 md:top-[120px] md:left-[150px] top-[10%] left-1/2 -translate-x-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
               <div className="w-16 h-16 bg-navy border-2 border-glass rounded-2xl flex items-center justify-center shadow-lg group hover:border-electric transition-colors">
                  <DoorOpen className="w-8 h-8 text-gray-400 group-hover:text-electric transition-colors" />
               </div>
               <p className="text-[10px] uppercase font-mono tracking-widest text-center mt-3 text-gray-400">Turnstiles</p>
            </div>
            <div className="absolute z-20 md:top-[380px] md:left-[150px] top-[30%] left-1/4 -translate-x-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
               <div className="w-16 h-16 bg-navy border-2 border-glass rounded-2xl flex items-center justify-center shadow-lg group hover:border-electric transition-colors">
                  <Camera className="w-8 h-8 text-gray-400 group-hover:text-electric transition-colors" />
               </div>
               <p className="text-[10px] uppercase font-mono tracking-widest text-center mt-3 text-gray-400">Optical Vision</p>
            </div>
            <div className="absolute z-20 md:top-[120px] md:left-[850px] top-[50%] left-3/4 -translate-x-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
               <div className="w-16 h-16 bg-navy border-2 border-glass rounded-2xl flex items-center justify-center shadow-lg group hover:border-electric transition-colors">
                  <Radio className="w-8 h-8 text-gray-400 group-hover:text-electric transition-colors" />
               </div>
               <p className="text-[10px] uppercase font-mono tracking-widest text-center mt-3 text-gray-400">BLE Beacons</p>
            </div>
            <div className="absolute z-20 md:top-[380px] md:left-[850px] top-[70%] left-1/2 -translate-x-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
               <div className="w-16 h-16 bg-navy border-2 border-glass rounded-2xl flex items-center justify-center shadow-lg group hover:border-electric transition-colors">
                  <Users className="w-8 h-8 text-gray-400 group-hover:text-electric transition-colors" />
               </div>
               <p className="text-[10px] uppercase font-mono tracking-widest text-center mt-3 text-gray-400">Thermal / LiDAR</p>
            </div>

            {/* Central Edge Node */}
            <div className="absolute z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
               <motion.div 
                 initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ delay: 0.8, type: "spring" }}
                 className="w-24 h-24 bg-navy border-[3px] border-electric rounded-[24px] flex items-center justify-center shadow-[0_0_50px_rgba(0,229,255,0.4)] relative"
               >
                  <div className="absolute inset-0 bg-electric/10 rounded-[20px] animate-pulse" />
                  <Server className="w-10 h-10 text-electric relative z-10" />
               </motion.div>
               <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 1 }} className="text-[12px] font-bold uppercase font-mono tracking-[0.2em] text-center mt-4 text-electric bg-navy px-3 py-1 rounded-full border border-electric/30">
                  Local Edge Compute
               </motion.p>
            </div>
         </div>
      </section>

      <ScanlineTransition />

      {/* SECTION 2: The AI Brain */}
      <section className="container mx-auto px-6 py-20 max-w-6xl">
         <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">The AI Brain</h2>
            <p className="text-gray-400 text-lg">Synthesizes incoming structural data to execute operational decisions autonomously.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FlipCard 
              icon={Users} 
              title="Crowd Forecasting" 
              desc="Predicts density and bottleneck formulation up to 20 minutes before it materializes physically."
              tech="Time-Series LSTM modeling utilizing historical ingress patterns overlaid on live capacity thresholds."
            />
            <FlipCard 
              icon={Activity} 
              title="Wait-time Engine" 
              desc="Calculates queue depth, transaction throughput, and clearance rates universally across all concessions."
              tech="Computer vision heuristics paired with Point-of-Sale APIs to measure exact clearing velocities."
            />
            <FlipCard 
              icon={Navigation} 
              title="Routing Optimizer" 
              desc="Dynamically alters wayfinding nodes and staff deployment via app notifications and digital signage."
              tech="Real-time A* pathfinding and weighted network graphs distributing load across underutilized node channels."
            />
         </div>
      </section>

      <ScanlineTransition />

      {/* SECTION 3: Two Surfaces, One System (Parallax) */}
      <section ref={containerRef} className="container mx-auto px-6 py-32 max-w-6xl">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div>
               <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">Two Surfaces. <br/>One Ecosystem.</h2>
               <p className="text-gray-400 text-lg leading-relaxed mb-8">
                 Bridging the gap between the Operations Command Center and the individualized Attendee App experience. When operations diverts crowd flow, the attendee immediately processes the fastest path automatically updating on their personal device.
               </p>
               <ul className="space-y-6">
                 <li className="flex items-start">
                    <Monitor className="w-6 h-6 text-electric shrink-0 mr-4 mt-1" />
                    <div>
                      <h4 className="text-white font-bold text-lg">Macro Control</h4>
                      <p className="text-gray-400 mt-1">High-level manipulation of global stadium dynamics and automated workforce distribution.</p>
                    </div>
                 </li>
                 <li className="flex items-start">
                    <Smartphone className="w-6 h-6 text-green shrink-0 mr-4 mt-1" />
                    <div>
                      <h4 className="text-white font-bold text-lg">Micro Utility</h4>
                      <p className="text-gray-400 mt-1">Surgical turn-by-turn guidance and automated distress broadcasting directly augmenting the fan's behavior.</p>
                    </div>
                 </li>
               </ul>
            </div>

            <div className="h-[600px] bg-surface/30 border border-glass rounded-[40px] relative overflow-hidden flex items-center justify-center p-8 shadow-2xl backdrop-blur-xl group perspective-[1000px]">
                {/* Parallax elements */}
                <motion.div style={{ y: y1 }} className="absolute left-4 md:-left-12 top-20 w-[400px] h-[300px] bg-[#0A0E1A] border-8 border-navy shadow-[0_30px_60px_rgba(0,0,0,0.6)] rounded-2xl p-4 overflow-hidden -rotate-6">
                   <div className="w-full flex space-x-2 mb-4">
                     <div className="w-1/3 h-12 bg-surface rounded-lg" />
                     <div className="w-2/3 h-12 bg-surface rounded-lg" />
                   </div>
                   <div className="w-full h-32 bg-navy rounded-lg border border-electric/30 p-4">
                      <div className="w-1/2 h-4 bg-electric/20 rounded mb-2" />
                      <div className="w-full h-[2px] bg-electric/50 my-6 shadow-[0_0_10px_#00E5FF]" />
                      <div className="w-1/3 h-4 bg-amber/20 rounded" />
                   </div>
                   <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E1A] via-transparent to-transparent pointer-events-none" />
                   <p className="absolute bottom-4 right-4 text-[10px] font-mono tracking-widest uppercase text-white/50">Operator Dashboard</p>
                </motion.div>

                <motion.div style={{ y: y2 }} className="absolute right-4 md:right-12 bottom-10 w-[240px] h-[480px] bg-[#0A0E1A] border-[10px] border-[#1F2937] shadow-[0_40px_80px_rgba(0,0,0,0.8)] rounded-[35px] p-4 flex flex-col items-center rotate-6">
                   <div className="w-32 h-6 rounded-full bg-surface mb-6 border border-glass" />
                   <div className="w-full h-32 bg-navy rounded-2xl border border-green/30 p-4 mb-4 relative overflow-hidden text-center flex flex-col justify-center">
                      <div className="absolute w-24 h-24 bg-green/20 blur-xl top-0 right-0 rounded-full" />
                      <span className="text-3xl font-heading font-black text-white">4<span className="text-gray-500">:</span>12</span>
                      <span className="text-[10px] text-green mt-1 tracking-widest font-mono uppercase">EST ARRIVAL</span>
                   </div>
                   <div className="w-full h-16 bg-surface rounded-xl mb-4" />
                   <div className="w-full h-16 bg-surface rounded-xl" />
                   <p className="absolute bottom-8 text-[10px] font-mono tracking-widest uppercase text-white/50">Attendee View</p>
                </motion.div>
            </div>

         </div>
      </section>

      <ScanlineTransition />

      {/* SECTION 4: Impact Numbers */}
      <section className="container mx-auto px-6 py-24 max-w-6xl text-center">
         <h2 className="text-3xl md:text-5xl font-heading font-bold mb-20">The Geometric Impact</h2>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-surface/20 border border-glass p-8 rounded-[40px] flex flex-col items-center justify-center transform transition-transform hover:-translate-y-2">
               <span className="text-5xl lg:text-7xl font-heading font-black text-electric mb-4 tracking-tighter drop-shadow-[0_0_15px_rgba(0,229,255,0.3)]">
                 <AnimatedStat value={73} suffix="%" />
               </span>
               <p className="text-gray-300 font-medium text-sm">Reduction in peak wait times</p>
            </div>
            
            <div className="bg-surface/20 border border-glass p-8 rounded-[40px] flex flex-col items-center justify-center transform transition-transform hover:-translate-y-2">
               <span className="text-5xl lg:text-7xl font-heading font-black text-green mb-4 tracking-tighter drop-shadow-[0_0_15px_rgba(0,240,160,0.3)]">
                 <AnimatedStat value={91} suffix="%" />
               </span>
               <p className="text-gray-300 font-medium text-sm">Find companions &lt; 60 secs</p>
            </div>
            
            <div className="bg-surface/20 border border-glass p-8 rounded-[40px] flex flex-col items-center justify-center transform transition-transform hover:-translate-y-2">
               <span className="text-5xl lg:text-7xl font-heading font-black text-amber mb-4 tracking-tighter drop-shadow-[0_0_15px_rgba(255,184,48,0.3)]">
                 <AnimatedStat value={3} suffix="x" />
               </span>
               <p className="text-gray-300 font-medium text-sm">Faster mapped post-match exit</p>
            </div>
            
            <div className="bg-surface/20 border border-glass p-8 rounded-[40px] flex flex-col items-center justify-center transform transition-transform hover:-translate-y-2">
               <span className="text-5xl lg:text-7xl font-heading font-black text-white mb-4 tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                 <AnimatedStat value={100} suffix="%" />
               </span>
               <p className="text-gray-300 font-medium text-sm">Stockout prediction accuracy</p>
            </div>
         </div>
      </section>

    </div>
  );
}
