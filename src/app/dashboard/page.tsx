"use client";

import { useState, useEffect, useRef } from "react";
import { motion, animate } from "framer-motion";
import { Clock, AlertTriangle, Zap, CheckCircle } from "lucide-react";
import { useDemo } from "@/components/Providers";
import { DetailedStadiumMap } from "@/components/DetailedStadiumMap";

function RealTimeClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) return <span className="font-mono text-sm text-electric">00:00:00</span>;

  return (
    <span className="font-mono text-sm text-electric animate-pulse">
      {time.toLocaleTimeString('en-US', { hour12: false })}
    </span>
  );
}

function AnimatedStat({ value, suffix = "", decimal = false }: { value: number, suffix?: string, decimal?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(0);
  
  useEffect(() => {
    const controls = animate(prevValue.current, value, {
      duration: prevValue.current === 0 ? 1.5 : 1,
      ease: "easeOut",
      onUpdate(v) {
        if (ref.current) {
           ref.current.textContent = `${decimal ? v.toFixed(1) : Math.floor(v).toLocaleString()}${suffix}`;
        }
      }
    });
    prevValue.current = value;
    return () => controls.stop();
  }, [value, suffix, decimal]);
  
  return <span ref={ref}>0{suffix}</span>;
}

export default function Dashboard() {
  const { isDemoMode } = useDemo();
  const [tooltip, setTooltip] = useState<{ zone: string, tier: string, count: number, x: number, y: number, heat: number } | null>(null);
  
  const [dispatchStates, setDispatchStates] = useState<Record<number, 'idle' | 'loading' | 'resolved'>>({});

  const handleDispatch = (index: number) => {
    if (dispatchStates[index]) return;
    setDispatchStates(prev => ({ ...prev, [index]: 'loading' }));
    setTimeout(() => {
      setDispatchStates(prev => ({ ...prev, [index]: 'resolved' }));
    }, 1600);
  };

  const resolvedActions = Object.entries(dispatchStates)
    .filter(([, v]) => v === 'resolved')
    .map(([k]) => Number(k));

  const [kpis, setKpis] = useState([
    { label: "Attendance", value: 52100, color: "text-white" },
    { label: "Avg wait", value: 4.2, suffix: " min", color: "text-white", decimal: true },
    { label: "Flow score", value: 96, suffix: "%", color: "text-electric" },
    { label: "Active alerts", value: 3, color: "text-amber" }
  ]);

  // Demo Mode Polling
  useEffect(() => {
    if (!isDemoMode) return;
    const interval = setInterval(() => {
       setKpis(prev => [
         { ...prev[0], value: prev[0].value + Math.floor(Math.random() * 30) - 10 },
         { ...prev[1], value: Math.max(1, +(prev[1].value + (Math.random() * 0.4 - 0.2)).toFixed(1)) },
         { ...prev[2], value: Math.min(100, Math.max(0, prev[2].value + Math.floor(Math.random() * 3) - 1)) },
         prev[3]
       ]);
    }, 2000);
    return () => clearInterval(interval);
  }, [isDemoMode]);

  return (
    <>
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end pb-4 border-b border-glass gap-4">
            <div>
                <h1 className="text-3xl lg:text-4xl font-heading font-bold text-white drop-shadow-md">Overview</h1>
                <p className="text-gray-400 text-sm mt-1">Real-time command center</p>
            </div>
            <div className="flex space-x-2 bg-surface border border-electric/30 shadow-[0_0_10px_rgba(0,229,255,0.1)] rounded-lg px-4 py-2">
                <Clock className="w-4 h-4 text-electric mt-0.5" />
                <RealTimeClock />
            </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {kpis.map((kpi, i) => (
                <div key={kpi.label} className="bg-surface/60 border border-glass rounded-xl p-5 flex flex-col shadow-lg backdrop-blur-md">
                    <span className="text-gray-400 text-xs font-semibold uppercase tracking-widest">{kpi.label}</span>
                    <span className={`text-3xl lg:text-4xl font-heading font-bold mt-2 tracking-tight ${kpi.color}`}>
                        <AnimatedStat value={kpi.value} suffix={kpi.suffix} decimal={kpi.decimal} />
                    </span>
                </div>
            ))}
        </div>

        <div className="bg-surface/30 border border-glass rounded-xl h-[400px] md:h-[550px] flex items-center justify-center relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.05)_0%,transparent_70%)] pointer-events-none" />
            
            <DetailedStadiumMap 
                mode="heatmap"
                dispatchedActions={resolvedActions}
                onBlockHover={(data) => setTooltip(data ? { 
                    zone: data.id, 
                    tier: data.tier, 
                    count: data.occupancy, 
                    x: data.x, 
                    y: data.y - 70, 
                    heat: data.baseHeat 
                } : null)} 
            />
        </div>

    {tooltip && (
        <div className="fixed pointer-events-none z-50 bg-surface/90 border border-glass rounded-lg p-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl transform -translate-x-1/2 -translate-y-full" style={{ left: tooltip.x, top: tooltip.y }}>
            <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">{tooltip.tier} TIER - {tooltip.zone}</p>
            <p className="text-xl font-heading font-bold text-white mt-0.5">
                {tooltip.count}% <span className="text-xs font-normal text-gray-500 uppercase tracking-widest">full</span>
            </p>
            <div className={`text-[10px] font-bold mt-1.5 uppercase tracking-widest ${tooltip.heat > 0.8 ? 'text-red-400' : tooltip.heat > 0.5 ? 'text-amber' : 'text-green'}`}>
                &gt; STATUS: {tooltip.heat > 0.8 ? 'CRITICAL' : tooltip.heat > 0.5 ? 'WARNING' : 'OPTIMAL'}
            </div>
        </div>
    )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
            <div>
                <h3 className="text-white font-heading font-semibold text-lg flex items-center mb-4 border-b border-glass pb-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                  Critical Alerts
                </h3>
                <div className="space-y-3">
                    {[
                        { title: "Washroom North overcrowded", desc: "87% capacity reached", time: "Just now", color: "border-red-500/50 bg-red-500/10", text: "text-red-400" },
                        { title: "Merchandise Queue Warning", desc: "Avg wait time 14 min", time: "2m ago", color: "border-amber/50 bg-amber/10", text: "text-amber" },
                        { title: "Scanner Fault", desc: "Gate D Turnstile #4 offline", time: "5m ago", color: "border-amber/50 bg-amber/10", text: "text-amber" },
                    ].map((alert, i) => (
                        <div key={i} className={`p-4 rounded-xl border ${alert.color} flex justify-between items-start backdrop-blur-sm hover:bg-opacity-20 transition-colors`}>
                            <div>
                                <p className={`font-semibold text-sm ${alert.text}`}>{alert.title}</p>
                                <p className="text-xs text-gray-400 mt-1">{alert.desc}</p>
                            </div>
                            <span className="text-xs text-gray-500 font-mono tracking-tighter">{alert.time}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-white font-heading font-semibold text-lg flex items-center mb-4 border-b border-glass pb-2">
                  <Zap className="w-5 h-5 text-electric mr-2" />
                  AI Recommendations
                </h3>
                <div className="space-y-3">
                    {[
                        { action: "Open Gate E overflow", reason: "Redirect 1,200 fans from Gate D" },
                        { action: "Dispatch cleaning crew", reason: "Washroom North pre-emptive maintenance" },
                        { action: "Enable surge pricing limits", reason: "Post-match ride requests up 400%" },
                    ].map((rec, i) => {
                        const status = dispatchStates[i] || 'idle';
                        const isResolved = status === 'resolved';
                        const isLoading = status === 'loading';
                        
                        return (
                          <div key={i} className={`p-4 rounded-xl border transition-all duration-500 backdrop-blur-sm flex justify-between items-center group ${isResolved ? 'border-green/50 bg-green/10' : 'border-electric/30 bg-electric/5 hover:border-electric'}`}>
                              <div>
                                  <p className={`font-semibold text-sm transition-colors ${isResolved ? 'text-green' : 'text-electric'}`}>{rec.action}</p>
                                  <p className="text-xs text-gray-400 mt-1">{isResolved ? 'Action completed automatically' : rec.reason}</p>
                              </div>
                              <button 
                                onClick={() => handleDispatch(i)}
                                disabled={isLoading || isResolved}
                                className={`ml-4 shrink-0 px-3 py-1.5 rounded-md text-xs font-bold font-mono transition-all flex items-center shadow-[0_0_10px_rgba(0,0,0,0.2)] overflow-hidden relative
                                  ${isResolved ? 'bg-green text-navy shadow-[0_0_15px_rgba(0,240,160,0.4)]' : ''}
                                  ${isLoading ? 'bg-electric/50 text-navy cursor-wait' : ''}
                                  ${status === 'idle' ? 'bg-electric text-navy hover:bg-white hover:text-navy opacity-80 group-hover:opacity-100' : ''}
                                `}
                              >
                                {isLoading ? (
                                   <>
                                     <div className="w-3 h-3 border-2 border-navy border-t-transparent rounded-full animate-spin mr-1.5" />
                                     SYNCING
                                   </>
                                ) : isResolved ? (
                                   <>
                                     <CheckCircle className="w-3 h-3 mr-1.5" />
                                     RESOLVED
                                   </>
                                ) : (
                                   <>
                                     <CheckCircle className="w-3 h-3 mr-1.5 opacity-50" />
                                     DISPATCH
                                   </>
                                )}
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
