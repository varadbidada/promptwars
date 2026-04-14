"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Timer, MapPin, Car, Bus, Bell, ArrowRight,
  ShieldAlert, Monitor, User, Navigation,
  CheckCircle, AlertTriangle, ChevronRight
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from "recharts";
import { DetailedStadiumMap } from "@/components/DetailedStadiumMap";

// ─── Animated Step Indicator ─────────────────────────────────────────────────
function StepConnector({ done }: { done: boolean }) {
  return (
    <div className="relative flex flex-col items-center py-1 mx-auto w-[3px]">
      <motion.div
        className="w-[3px] bg-[#00E5FF] rounded-full"
        initial={{ height: 0 }}
        animate={{ height: done ? 36 : 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      <div className="absolute top-0 w-[3px] h-9 bg-white/5 rounded-full" />
    </div>
  );
}

// ─── Attendee Exit Progress ───────────────────────────────────────────────────
function AttendeeView() {
  const [notify, setNotify] = useState(false);
  const [step, setStep] = useState(0);
  const [walking, setWalking] = useState(false);

  const steps = [
    { label: "Exit via Gate W3", sub: "Head South — follow green arrows", icon: Navigation, color: "#00E5FF" },
    { label: "Cross Parking Bridge B", sub: "2 min walk · stay on marked path", icon: ArrowRight, color: "#00F0A0" },
    { label: "Arrive at Parking Zone B", sub: "Your ride is waiting · Slot P2-14", icon: MapPin, color: "#FFB830" },
    { label: "All clear — safe exit!", sub: "Uber confirmed · 4 min away", icon: CheckCircle, color: "#00F0A0" },
  ];

  useEffect(() => {
    if (!walking) return;
    if (step >= steps.length - 1) { setWalking(false); return; }
    const t = setTimeout(() => setStep(s => s + 1), 2200);
    return () => clearTimeout(t);
  }, [walking, step]);

  const MATCH_MINUTES = 90 - step * 4; // tick down as progress advances

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#04060C] text-white flex">
      {/* Left panel: step-by-step guidance */}
      <div className="w-full md:w-[420px] shrink-0 flex flex-col border-r border-white/5 bg-[#080C1A]">
        {/* Hero countdown */}
        <div className="bg-gradient-to-b from-[#00E5FF]/15 via-[#080C1A]/80 to-transparent px-8 pt-10 pb-8 border-b border-white/5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-[11px] font-mono font-bold text-red-400 uppercase tracking-widest">Match Live · 87th Minute</span>
          </div>
          <h1 className="text-5xl font-heading font-black text-white tracking-tight leading-none">
            {String(MATCH_MINUTES).padStart(2, "0")}
            <span className="text-[#00E5FF] animate-pulse">:</span>
            42
          </h1>
          <p className="text-gray-500 text-xs font-mono mt-2 uppercase tracking-widest">Until final whistle</p>
          <div className="w-full bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
            <motion.div
              className="h-full bg-[#00E5FF] rounded-full shadow-[0_0_10px_rgba(0,229,255,0.8)]"
              animate={{ width: `${(step / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <p className="text-[#00E5FF] text-xs font-mono mt-1.5">Step {step + 1} of {steps.length} — {step < steps.length - 1 ? "In Progress" : "Completed"}</p>
        </div>

        {/* Animated steps */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-1">
          <h2 className="text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-4">Your Exit Route</h2>
          {steps.map((s, i) => {
            const isActive = i === step;
            const isDone = i < step;
            const isPending = i > step;
            return (
              <div key={i}>
                <motion.div
                  animate={{
                    opacity: isPending ? 0.3 : 1,
                    scale: isActive ? 1.02 : 1,
                  }}
                  transition={{ duration: 0.4 }}
                  className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                    isActive ? "border-[#00E5FF]/40 bg-[#00E5FF]/8 shadow-[0_0_20px_rgba(0,229,255,0.06)]" :
                    isDone ? "border-[#00F0A0]/20 bg-[#00F0A0]/5" :
                    "border-white/5 bg-transparent"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${
                    isDone ? "border-[#00F0A0] bg-[#00F0A0]/20" :
                    isActive ? "border-[#00E5FF] bg-[#00E5FF]/20" :
                    "border-white/10 bg-white/5"
                  }`}>
                    {isDone ? (
                      <CheckCircle className="w-5 h-5 text-[#00F0A0]" />
                    ) : (
                      <s.icon className="w-5 h-5" style={{ color: isActive ? s.color : "#555" }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-[15px] ${isDone ? "line-through text-gray-600" : isActive ? "text-white" : "text-gray-600"}`}>{s.label}</p>
                    {(isActive || isDone) && <p className="text-[11px] font-mono mt-1" style={{ color: isDone ? "#555" : s.color }}>{s.sub}</p>}
                    {isActive && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
                        <span className="text-[10px] font-mono text-[#00E5FF] uppercase tracking-widest">Currently here</span>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
                {i < steps.length - 1 && <StepConnector done={i < step} />}
              </div>
            );
          })}
        </div>

        {/* Simulate walk button */}
        <div className="px-8 py-6 border-t border-white/5 space-y-3 shrink-0">
          {step < steps.length - 1 ? (
            <button
              onClick={() => { setWalking(true); setStep(s => Math.min(s + 1, steps.length - 1)); }}
              className="w-full py-4 rounded-2xl bg-[#00E5FF] text-[#080C1A] font-heading font-black text-[15px] tracking-wide shadow-[0_0_20px_rgba(0,229,255,0.3)] active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <Navigation className="w-5 h-5" /> Advance to next step
            </button>
          ) : (
            <motion.button
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-full py-4 rounded-2xl bg-[#00F0A0] text-[#080C1A] font-heading font-black text-[15px] tracking-wide shadow-[0_0_20px_rgba(0,240,160,0.3)]"
            >
              🎉 Exit Complete — Enjoy your evening!
            </motion.button>
          )}

          <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/2">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-300 font-medium">Alert me when to leave</span>
            </div>
            <button onClick={() => setNotify(!notify)} className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${notify ? "bg-[#00E5FF]" : "bg-white/10"}`}>
              <motion.div animate={{ x: notify ? 20 : 0 }} transition={{ type: "spring" as const, stiffness: 500, damping: 30 }} className={`w-4 h-4 rounded-full shadow-md ${notify ? "bg-[#080C1A]" : "bg-gray-500"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Right panel: live map */}
      <div className="flex-1 flex flex-col gap-0 overflow-hidden">
        {/* Map header */}
        <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-[#080C1A]/60 backdrop-blur-sm">
          <div>
            <h2 className="text-white font-heading font-bold">Live Egress Map</h2>
            <p className="text-gray-500 text-[11px] font-mono mt-0.5 uppercase tracking-widest">Crowd dispersion · real-time</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-red-400 uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Active Exit Sequence
          </div>
        </div>

        {/* The map fills available space */}
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.04)_0%,transparent_70%)]" />
          <DetailedStadiumMap mode="egress" className="w-full h-full" />

          {/* Animated user path on map */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 800">
            {step >= 1 && (
              <motion.path d="M 500 400 L 500 700" fill="none" stroke="#00E5FF" strokeWidth="4" strokeDasharray="12 8"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: "easeOut" }} />
            )}
            {step >= 2 && (
              <motion.path d="M 500 700 L 700 750" fill="none" stroke="#00F0A0" strokeWidth="4" strokeDasharray="12 8"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: "easeOut" }} />
            )}
            {/* You dot */}
            <motion.circle
              cx={step === 0 ? 500 : step === 1 ? 500 : step === 2 ? 700 : 700}
              cy={step === 0 ? 400 : step === 1 ? 700 : step === 2 ? 750 : 750}
              r="14" fill="#00E5FF" stroke="#080C1A" strokeWidth="4"
              animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
            />
            <text x={step === 0 ? 486 : step <= 1 ? 486 : 686} y={step === 0 ? 455 : 800} fill="#00E5FF" fontSize="14" fontFamily="monospace" fontWeight="bold">YOU</text>

            {/* Gate W3 target */}
            <circle cx="500" cy="760" r="18" fill="#00F0A0" fillOpacity="0.15" stroke="#00F0A0" strokeWidth="2" />
            <text x="450" y="790" fill="#00F0A0" fontSize="11" fontFamily="monospace">GATE W3</text>
          </svg>

          {/* Live stats overlay */}
          <div className="absolute bottom-6 left-6 right-6 grid grid-cols-3 gap-3 pointer-events-none">
            {[
              { label: "Gate W3 Wait", value: `${Math.max(1, 6 - step * 2)} min`, color: "text-[#00E5FF]" },
              { label: "Walking dist.", value: `${Math.max(0, 420 - step * 140)}m`, color: "text-[#00F0A0]" },
              { label: "Uber ETA", value: "4 min", color: "text-[#FFB830]" },
            ].map((stat, i) => (
              <motion.div key={i} className="bg-[#080C1A]/90 backdrop-blur-md border border-white/8 rounded-xl p-3 text-center"
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 + i * 0.1 }}>
                <p className="text-gray-600 text-[9px] font-mono uppercase tracking-widest">{stat.label}</p>
                <p className={`font-heading font-black text-lg mt-1 ${stat.color}`}>{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Ride + transit info strip */}
        <div className="grid grid-cols-2 gap-4 p-6 border-t border-white/5 bg-[#080C1A]/80 shrink-0">
          <div className="flex items-center gap-4 p-4 rounded-xl border border-white/8 bg-white/3">
            <Car className="w-8 h-8 text-white shrink-0" />
            <div>
              <p className="text-white font-bold text-sm">Toyota Prius · AB12 XYZ</p>
              <p className="text-[#00E5FF] text-xs font-mono mt-0.5">David · 4 min away · Zone P2</p>
            </div>
            <span className="ml-auto text-[10px] font-black font-mono bg-white/10 text-white px-2 py-1 rounded-lg uppercase">Confirmed</span>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl border border-white/8 bg-white/3">
            <Bus className="w-8 h-8 text-[#FFB830] shrink-0" />
            <div>
              <p className="text-white font-bold text-sm">Bus 7A · Platform 2</p>
              <p className="text-[#FFB830] text-xs font-mono mt-0.5">Departs in 11 min · 240 seats</p>
            </div>
            <ChevronRight className="ml-auto w-5 h-5 text-gray-600" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Operator View ────────────────────────────────────────────────────────────
function OperatorView() {
  const gates = [
    { name: "Gate North", rate: 450, capacity: 500, color: "bg-red-500",    text: "text-red-400",   status: "CRITICAL" },
    { name: "Gate East",  rate: 210, capacity: 600, color: "bg-[#00F0A0]",  text: "text-[#00F0A0]", status: "CLEAR"    },
    { name: "Gate South", rate: 380, capacity: 400, color: "bg-[#FFB830]",  text: "text-[#FFB830]", status: "BUSY"     },
    { name: "Gate West",  rate: 120, capacity: 500, color: "bg-[#00F0A0]",  text: "text-[#00F0A0]", status: "CLEAR"    },
  ];

  const rideData = Array.from({ length: 12 }).map((_, i) => ({
    time: i, demand: i > 7 ? 250 + ((i * 47) % 400) : 50 + ((i * 13) % 50)
  }));

  const [zones, setZones] = useState([
    { sec: "Section A, B (VIP)",    time: "90 min", status: "DISPATCHED" as const },
    { sec: "Section C, F (Lower)",  time: "93 min", status: "PENDING"    as const },
    { sec: "Section D, E (Upper)",  time: "98 min", status: "HOLD"       as const },
  ]);

  const advanceZone = (i: number) => {
    setZones(z => z.map((zone, idx) => {
      if (idx !== i) return zone;
      const next = zone.status === "HOLD" ? "PENDING" : "DISPATCHED";
      return { ...zone, status: next };
    }));
  };

  const statusConfig = {
    DISPATCHED: "text-[#00F0A0] bg-[#00F0A0]/10 border-[#00F0A0]/30",
    PENDING:    "text-[#FFB830] bg-[#FFB830]/10 border-[#FFB830]/30",
    HOLD:       "text-gray-400 bg-white/5 border-white/10",
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#04060C] text-white flex flex-col">
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-[#080C1A]/80 backdrop-blur-sm shrink-0">
        <div>
          <h1 className="text-3xl font-heading font-black text-white tracking-tight">Egress Command Center</h1>
          <p className="text-[#00E5FF]/60 font-mono text-[11px] uppercase tracking-widest mt-1">Staggered exit protocols · live throughput mapping</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-3 bg-red-500/10 border border-red-500/30 rounded-xl">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <span className="text-red-400 font-mono text-xs font-bold uppercase tracking-widest">Active Exit Sequence</span>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-6 p-6 lg:p-8 min-h-0">
        {/* Main Map */}
        <div className="xl:col-span-2 bg-[#080C1A] border border-white/8 rounded-3xl relative overflow-hidden flex flex-col shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#00E5FF]" />
              <h3 className="text-white font-bold text-sm">Live Crowd Dispersion Map</h3>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" /> Live
            </div>
          </div>
          <div className="flex-1 relative min-h-[400px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.05)_0%,transparent_60%)]" />
            <DetailedStadiumMap mode="egress" className="w-full h-full" />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-5 overflow-y-auto">
          {/* Staggered exit control */}
          <div className="bg-[#0D1220] border border-[#00E5FF]/15 rounded-2xl p-5 shrink-0">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
              <ShieldAlert className="w-4 h-4 text-[#00E5FF]" />
              <h3 className="text-white font-bold text-sm">Staggered Exit Control</h3>
            </div>
            <div className="space-y-3">
              {zones.map((zone, i) => (
                <motion.div key={i} layout className={`flex justify-between items-center p-3.5 rounded-xl border cursor-pointer group ${statusConfig[zone.status]}`} onClick={() => advanceZone(i)}>
                  <div>
                    <p className="text-white font-bold text-[13px]">{zone.sec}</p>
                    <p className="font-mono text-[10px] mt-1 uppercase tracking-widest opacity-60 flex items-center gap-1">
                      <Timer className="w-3 h-3" /> Release: Match +{zone.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-black font-mono px-2.5 py-1.5 rounded-lg border tracking-widest ${statusConfig[zone.status]}`}>{zone.status}</span>
                    {zone.status !== "DISPATCHED" && (
                      <p className="text-[9px] text-gray-600 font-mono mt-1 group-hover:text-gray-400 transition-colors">tap to advance</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            <button className="w-full mt-4 py-3 rounded-xl border border-[#00E5FF]/30 text-[#00E5FF] text-[11px] font-mono font-bold uppercase tracking-widest hover:bg-[#00E5FF]/10 transition-colors">
              Override Sequence
            </button>
          </div>

          {/* Gate throughput */}
          <div className="bg-[#0D1220] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
              <ArrowRight className="w-4 h-4 text-gray-500" />
              <h3 className="text-white font-bold text-sm">Gate Throughput</h3>
              <span className="ml-auto text-[9px] font-mono text-gray-600 uppercase">fans/min</span>
            </div>
            <div className="space-y-4">
              {gates.map((g, i) => {
                const pct = (g.rate / g.capacity) * 100;
                return (
                  <div key={i}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest">{g.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black font-mono px-2 py-0.5 rounded-full border ${g.status === "CRITICAL" ? "text-red-400 border-red-500/30 bg-red-500/10" : g.status === "BUSY" ? "text-[#FFB830] border-[#FFB830]/30 bg-[#FFB830]/10" : "text-[#00F0A0] border-[#00F0A0]/30 bg-[#00F0A0]/10"}`}>{g.status}</span>
                        <span className={`text-[11px] font-bold font-mono ${g.text}`}>{g.rate}<span className="text-gray-600">/{g.capacity}</span></span>
                      </div>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <motion.div className={`h-full ${g.color} rounded-full shadow-[0_0_8px_currentColor]`}
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.5, delay: 0.15 * i }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ride demand chart */}
          <div className="bg-[#0D1220] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
              <Car className="w-4 h-4 text-gray-500" />
              <h3 className="text-white font-bold text-sm">Live Ride-Hail Demand</h3>
              <span className="ml-auto flex items-center gap-1.5 text-[9px] font-mono text-red-400 uppercase">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Surge
              </span>
            </div>
            <div className="h-[80px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rideData} margin={{ top: 4, right: 4, left: -25, bottom: 0 }}>
                  <Line type="monotone" dataKey="demand" stroke="#00E5FF" strokeWidth={2.5} dot={false} isAnimationActive animationDuration={2000} />
                  <YAxis hide domain={["dataMin - 100", "dataMax + 100"]} />
                  <Tooltip contentStyle={{ background: "#0D1220", border: "1px solid #ffffff10", borderRadius: 8, fontSize: 10 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Parking matrix */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            {[
              { name: "Zone A", status: "Full",  cls: "border-red-500/30 bg-red-500/8 text-red-400" },
              { name: "Zone B", status: "60%",   cls: "border-[#FFB830]/30 bg-[#FFB830]/8 text-[#FFB830]" },
              { name: "Zone C", status: "Clear", cls: "border-[#00F0A0]/30 bg-[#00F0A0]/8 text-[#00F0A0]" },
            ].map((z, i) => (
              <div key={i} className={`border p-4 rounded-xl text-center ${z.cls}`}>
                <p className="text-[9px] font-mono uppercase tracking-widest opacity-70 mb-1">{z.name}</p>
                <p className="font-heading font-black text-lg">{z.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page Shell ───────────────────────────────────────────────────────────────
export default function PostMatchExit() {
  const [view, setView] = useState<"attendee" | "operator">("attendee");
  return (
    <div className="bg-[#04060C]">
      {/* View toggle bar */}
      <div className="sticky top-16 z-40 bg-[#080C1A]/90 backdrop-blur-md border-b border-white/5 flex justify-center py-3 shrink-0">
        <div className="bg-white/5 border border-white/8 p-1 rounded-xl flex gap-1">
          {[
            { id: "attendee" as const, icon: User,    label: "Attendee View" },
            { id: "operator" as const, icon: Monitor, label: "Operator View" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setView(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                view === tab.id ? "bg-[#00E5FF] text-[#080C1A] shadow-[0_4px_12px_rgba(0,229,255,0.35)]" : "text-gray-500 hover:text-white"
              }`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === "attendee" ? (
          <motion.div key="attendee" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.35 }}>
            <AttendeeView />
          </motion.div>
        ) : (
          <motion.div key="operator" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35 }}>
            <OperatorView />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
