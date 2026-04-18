"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Zap, X, Play, Square, FlameKindling, Users, Waves, Package } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVenueStore } from "@/store/venueStore";

type SimScenario = "gate_surge" | "crowd_wave" | "washroom_spike" | "inventory_crisis";

interface ScenarioConfig {
  id: SimScenario;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const SCENARIOS: ScenarioConfig[] = [
  { id: "gate_surge",       label: "Gate Congestion Surge", description: "Spikes a random gate to critical — triggers auto-reassignment", icon: Zap,            color: "text-red-400",     bgColor: "bg-red-500/10 border-red-500/30" },
  { id: "crowd_wave",       label: "Crowd Wave Arrival",    description: "Simulates 8,000 fans arriving at once — all gates spike", icon: Users,          color: "text-[#FFB830]",   bgColor: "bg-[#FFB830]/10 border-[#FFB830]/30" },
  { id: "washroom_spike",   label: "Halftime Washroom Rush",description: "All washrooms hit 90%+ — overtime cleaning dispatch fires", icon: Waves,          color: "text-[#A78BFA]",   bgColor: "bg-[#A78BFA]/10 border-[#A78BFA]/30" },
  { id: "inventory_crisis", label: "Inventory Stockout",    description: "North Stand Beer drops to 3% — reorder + redirect triggers", icon: Package,        color: "text-[#FB923C]",   bgColor: "bg-[#FB923C]/10 border-[#FB923C]/30" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [panelOpen, setPanelOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [activeScenarios, setActiveScenarios] = useState<Set<SimScenario>>(new Set());
  const [eventLog, setEventLog] = useState<{ msg: string; color: string; id: number }[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logId = useRef(0);

  const simulateCongestion = useVenueStore(s => s.simulateCongestion);
  const driftGates = useVenueStore(s => s.driftGates);
  const addActivity = useVenueStore(s => s.addActivity);
  const gates = useVenueStore(s => s.gates);

  if (pathname?.startsWith("/attendee")) return null;

  const addLog = (msg: string, color = "text-[#00E5FF]") => {
    setEventLog(prev => [{ msg, color, id: ++logId.current }, ...prev.slice(0, 5)]);
  };

  const fireScenario = (scenario: SimScenario) => {
    if (scenario === "gate_surge") {
      const pick = gates[Math.floor((Date.now() / 1000) % gates.length)];
      simulateCongestion(pick.id);
      addLog(`⚡ Gate ${pick.id} surge fired — ${pick.capacity_pct}% → critical`, "text-red-400");
      addActivity({ message: `[SIM] Gate ${pick.id} congestion surge triggered`, type: "surge" });
    }
    if (scenario === "crowd_wave") {
      gates.forEach((g, i) => {
        setTimeout(() => {
          simulateCongestion(g.id);
          addLog(`🌊 Crowd wave hit Gate ${g.id}`, "text-[#FFB830]");
        }, i * 600);
      });
    }
    if (scenario === "washroom_spike") {
      addLog("🚻 Halftime! Washrooms hitting 90%+", "text-[#A78BFA]");
      addActivity({ message: "[SIM] Halftime washroom rush — all blocks at 90%+", type: "surge" });
    }
    if (scenario === "inventory_crisis") {
      addLog("🍺 North Stand Beer: 3% — REORDER TRIGGERED", "text-[#FB923C]");
      addActivity({ message: "[SIM] Beer at North Stand critically low", type: "surge" });
    }
  };

  const startSimulation = () => {
    if (activeScenarios.size === 0) return;
    setRunning(true);
    addLog("▶ Simulation started", "text-[#00F0A0]");

    // Fire immediately
    activeScenarios.forEach(fireScenario);

    // Then fire every 6s for active scenarios
    intervalRef.current = setInterval(() => {
      driftGates();
      activeScenarios.forEach(fireScenario);
    }, 6000);
  };

  const stopSimulation = () => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    addLog("⏹ Simulation stopped", "text-gray-400");
  };

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const toggleScenario = (id: SimScenario) => {
    if (running) return;
    setActiveScenarios(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-glass bg-navy/80 backdrop-blur shadow-sm">
        <div className="container mx-auto flex h-16 items-center px-4 justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-electric/10 border border-electric/30 shadow-inner">
              <Activity className="h-5 w-5 text-electric animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite] drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]" />
            </div>
            <span className="font-heading text-xl font-bold tracking-tight text-white flex items-center">
              Flow<span className="text-electric mr-6">Venue</span>
              <div className="hidden md:flex items-center bg-red-500/10 border border-red-500/30 px-2.5 py-0.5 rounded shadow-[inset_0_0_10px_rgba(239,68,68,0.1)] text-[10px] font-mono tracking-widest text-red-500 font-bold uppercase">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5 animate-pulse drop-shadow-[0_0_5px_rgba(239,68,68,1)]" />
                LIVE · Match Day 7
              </div>
            </span>
          </Link>

          <div className="flex items-center space-x-6 flex-1 justify-end">
            <nav className="hidden lg:flex items-center space-x-6 text-[11px] font-bold text-gray-400 font-mono tracking-widest uppercase">
              <Link href="/dashboard" className={`transition-all hover:text-electric hover:scale-105 ${pathname === '/dashboard' ? 'text-electric drop-shadow-[0_0_10px_rgba(0,229,255,0.4)]' : ''}`}>Dashboard</Link>
              <Link href="/exit" className={`transition-all hover:text-electric hover:scale-105 ${pathname === '/exit' ? 'text-electric drop-shadow-[0_0_10px_rgba(0,229,255,0.4)]' : ''}`}>Egress Control</Link>
              <Link href="/how-it-works" className={`transition-all hover:text-electric hover:scale-105 ${pathname === '/how-it-works' ? 'text-electric drop-shadow-[0_0_10px_rgba(0,229,255,0.4)]' : ''}`}>Technology</Link>
            </nav>

            <div className="h-6 w-px bg-glass mx-2 hidden md:block" />

            {/* Simulator button */}
            <button
              aria-label="Toggle Simulator Panel"
              aria-expanded={panelOpen}
              aria-controls="simulator-panel"
              onClick={() => setPanelOpen(o => !o)}
              className={`flex items-center space-x-2 border rounded-full px-4 py-1.5 text-[10px] font-black font-mono tracking-widest uppercase transition-all duration-300 ${
                running
                  ? 'bg-[#00F0A0]/15 border-[#00F0A0]/60 text-[#00F0A0] shadow-[0_0_20px_rgba(0,240,160,0.3)] animate-pulse'
                  : panelOpen
                  ? 'bg-[#00E5FF]/15 border-[#00E5FF]/50 text-[#00E5FF]'
                  : 'bg-surface border-glass text-gray-500 hover:text-white hover:bg-glass/50'
              }`}
            >
              <FlameKindling className={`w-3.5 h-3.5 ${running ? 'text-[#00F0A0]' : ''}`} />
              <span>{running ? 'SIM RUNNING' : 'SCENARIO SIM'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Slide-down simulation panel */}
      <AnimatePresence>
        {panelOpen && (
          <>
            {/* Backdrop */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              aria-hidden="true"
              onClick={() => setPanelOpen(false)} />

            {/* Panel */}
            <motion.div
              id="simulator-panel"
              role="dialog"
              aria-labelledby="simulator-panel-title"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
              className="fixed top-16 right-4 z-50 w-[420px] bg-[#0D1220] border border-[#00E5FF]/20 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <div>
                  <h2 id="simulator-panel-title" className="text-white font-heading font-black text-base">Match Day Scenario Simulator</h2>
                  <p className="text-gray-500 text-[10px] font-mono mt-0.5 uppercase tracking-widest">Select scenarios → Start to fire live events</p>
                </div>
                <button aria-label="Close panel" onClick={() => setPanelOpen(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors focus:ring-2 focus:ring-[#00E5FF]">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Scenarios */}
              <div className="p-4 space-y-2">
                {SCENARIOS.map(sc => {
                  const active = activeScenarios.has(sc.id);
                  return (
                    <button key={sc.id} onClick={() => toggleScenario(sc.id)} disabled={running}
                      aria-pressed={active}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all focus:ring-2 focus:ring-[#00E5FF] ${active ? sc.bgColor : 'border-white/5 bg-white/2 hover:bg-white/4'} ${running ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${active ? sc.bgColor : 'bg-white/5'}`}>
                        <sc.icon className={`w-4 h-4 ${active ? sc.color : 'text-gray-500'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold ${active ? 'text-white' : 'text-gray-400'}`}>{sc.label}</p>
                        <p className="text-[10px] text-gray-600 font-mono mt-0.5 leading-tight truncate">{sc.description}</p>
                      </div>
                      <div className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-all ${active ? 'bg-[#00E5FF] border-[#00E5FF]' : 'border-white/20'}`}>
                        {active && <div className="w-2 h-2 bg-[#080C1A] rounded-sm" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Start / Stop */}
              <div className="px-4 pb-4 flex gap-2">
                {!running ? (
                  <button aria-label="Start Simulation" onClick={startSimulation} disabled={activeScenarios.size === 0}
                    className="flex-1 py-3 rounded-xl bg-[#00E5FF] text-[#080C1A] font-mono font-black text-[12px] uppercase tracking-widest disabled:opacity-30 flex items-center justify-center gap-2 active:scale-95 transition-transform">
                    <Play className="w-4 h-4" /> Start Simulation
                  </button>
                ) : (
                  <button aria-label="Stop Simulation" onClick={stopSimulation}
                    className="flex-1 py-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 font-mono font-black text-[12px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform">
                    <Square className="w-4 h-4" /> Stop Simulation
                  </button>
                )}
              </div>

              {/* Event log */}
              {eventLog.length > 0 && (
                <div aria-live="polite" aria-atomic="true" className="border-t border-white/5 px-4 py-3 space-y-1.5 bg-black/20">
                  <p className="text-[9px] text-gray-600 font-mono uppercase tracking-widest mb-2" aria-hidden="true">Event Log</p>
                  <AnimatePresence mode="popLayout">
                    {eventLog.map(ev => (
                      <motion.p key={ev.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className={`text-[10px] font-mono ${ev.color}`}>
                        {ev.msg}
                      </motion.p>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Running pulse banner */}
              {running && (
                <div aria-live="assertive" className="bg-[#00F0A0]/10 border-t border-[#00F0A0]/20 px-4 py-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00F0A0] animate-ping" />
                  <p className="text-[#00F0A0] text-[10px] font-mono font-bold uppercase tracking-widest">Live simulation active — events fire every 6s</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
