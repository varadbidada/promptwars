"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVenueStore } from "@/store/venueStore";
import { VenueProvider } from "@/components/VenueProvider";
import { GateBar } from "@/components/gates/GateBar";
import { StatusChip } from "@/components/gates/StatusChip";
import { QRCode } from "@/components/gates/QRCode";
import { LiveDot } from "@/components/gates/LiveDot";
import { ArrowLeft, ChevronDown, ChevronUp, MapPin, Clock, Users, Ticket, CheckCircle2, ArrowRightCircle } from "lucide-react";

type Screen = "ticket" | "pass" | "reassignment" | "updated-pass";

const DIRECTION_STEPS: Record<string, string[]> = {
  "A-B": ["Exit via South concourse ramp", "Follow blue wayfinding at Pillar S12", "Gate B is 280m ahead on your left"],
  "A-C": ["Head East on concourse level 1", "Pass the food court junction", "Gate C is at the West end — 220m"],
  "A-D": ["Take the East escalator at Section F", "Cross the central atrium walkway", "Gate D is at East entrance — 310m"],
  "B-A": ["Walk South past kiosk row", "Turn left at the merchandise stand", "Gate A is 260m — large green banner"],
  "B-C": ["Head West along level-1 concourse", "Follow the amber wayfinding strips", "Gate C is 190m at the West wing"],
  "B-D": ["Cross the central hub via Bridge 2", "Stay on the East corridor", "Gate D is 230m — follow blue signs"],
  "C-A": ["Take South exit from West wing", "Walk past Washroom block W2", "Gate A is 200m — green banners ahead"],
  "C-B": ["Head North on West concourse", "Use elevator at Pillar W7", "Gate B is 175m on your right"],
  "C-D": ["Cross the central bridge — Bridge 3", "Follow East signage", "Gate D is 240m — follow orange signs"],
  "D-A": ["Head South on East concourse", "Pass Gate D Security desk", "Gate A is 290m — follow green signage"],
  "D-B": ["Walk West across Bridge 2", "Take North elevator", "Gate B is 210m ahead"],
  "D-C": ["Head West on Level 0 walkway", "Follow amber wayfinding at Hub-E", "Gate C is 225m at West side"],
};

const slideVariants = {
  enter: (dir: number) => ({ x: dir * 100, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: -dir * 100, opacity: 0 }),
};

function EntryContent() {
  const [screen, setScreen] = useState<Screen>("ticket");
  const [dir, setDir] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [simLoading, setSimLoading] = useState(false);
  const [countdown, setCountdown] = useState(8);

  const gates = useVenueStore(s => s.gates);
  const user = useVenueStore(s => s.currentUser);
  const notification = useVenueStore(s => s.notification);
  const clearNotification = useVenueStore(s => s.clearNotification);
  const simulateCongestion = useVenueStore(s => s.simulateCongestion);
  const isSimulating = useVenueStore(s => s.isSimulating);

  const myGate = gates.find(g => g.id === user.assignedGate)!;
  const qrValue = JSON.stringify({ ticket: user.ticket, gate: user.assignedGate, section: user.section, row: user.row, seat: user.seat, ts: Date.now() });

  // Navigate to reassignment screen when notification fires
  useEffect(() => {
    if (notification && screen !== "reassignment") {
      setDir(1);
      setScreen("reassignment");
      setCountdown(8);
    }
  }, [notification]);

  // Countdown auto-dismiss
  useEffect(() => {
    if (screen !== "reassignment") return;
    if (countdown <= 0) { clearNotification(); setDir(-1); setScreen("ticket"); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [screen, countdown]);

  const go = (to: Screen, direction = 1) => { setDir(direction); setScreen(to); };

  const handleSimulate = () => {
    setSimLoading(true);
    simulateCongestion(user.assignedGate);
    setTimeout(() => setSimLoading(false), 3000);
  };

  const handleAccept = () => {
    clearNotification();
    go("updated-pass", 1);
  };

  const handleDecline = () => {
    clearNotification();
    go("pass", -1);
  };

  const steps = notification
    ? DIRECTION_STEPS[`${notification.fromGate}-${notification.toGate}`] ?? [
        "Exit current gate area", "Follow venue wayfinding signs", `Proceed to ${notification.toGate}`
      ]
    : [];

  const fromGate = notification ? gates.find(g => g.id === notification.fromGate) : null;
  const toGate = notification ? gates.find(g => g.id === notification.toGate) : null;

  return (
    <div className="min-h-screen bg-[#04060C] flex items-center justify-center p-0 md:p-8">
      {/* Phone frame */}
      <div className="w-full max-w-[390px] h-[100dvh] md:h-[844px] bg-[#080C1A] relative overflow-hidden flex flex-col md:rounded-[45px] md:border-[12px] md:border-[#1F2937] shadow-[0_30px_80px_rgba(0,0,0,0.9)]">
        {/* iOS status bar */}
        <div className="hidden md:flex justify-between items-center px-7 pt-4 text-white text-[13px] font-semibold shrink-0 z-50">
          <span>9:41</span>
          <div className="flex space-x-1.5 items-center">
            <div className="w-4 h-3.5 border border-white rounded-[3px] flex items-center justify-center"><div className="w-[10px] h-2 bg-white rounded-[1px]" /></div>
            <div className="w-3.5 h-3.5 bg-white rounded-full" />
            <div className="w-6 h-3.5 border border-white rounded-[4px] p-[1px]"><div className="w-4 h-full bg-white rounded-sm" /></div>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0 z-30 bg-[#080C1A]/90 backdrop-blur-md">
          {screen !== "ticket" ? (
            <button onClick={() => go("ticket", -1)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-gray-300" />
            </button>
          ) : (
            <span className="text-white font-heading font-black text-lg tracking-tight">FlowVenue</span>
          )}
          <LiveDot label="LIVE · MATCH DAY 7" />
        </div>

        {/* Screen content */}
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={screen}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring" as const, stiffness: 280, damping: 28 }}
            className="flex-1 overflow-y-auto scrollbar-hide pb-8"
          >

            {/* ── SCREEN 1: MY TICKET ── */}
            {screen === "ticket" && (
              <div className="p-6 space-y-6">
                <div>
                  <p className="text-gray-500 text-xs font-mono uppercase tracking-widest">Welcome back</p>
                  <h1 className="text-2xl font-heading font-black text-white mt-1">{user.name}</h1>
                </div>

                {/* Ticket card */}
                <div className="bg-gradient-to-br from-[#00E5FF]/10 to-[#A78BFA]/10 border border-[#00E5FF]/30 rounded-3xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/5 rounded-full blur-2xl" />
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-[10px] text-[#00E5FF]/70 font-mono uppercase tracking-widest">Match Ticket</p>
                      <h2 className="text-white font-heading font-bold text-lg mt-1">Premier League · Round 28</h2>
                    </div>
                    <Ticket className="w-6 h-6 text-[#00E5FF]/50" />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {[
                      { label: "Section", value: user.section },
                      { label: "Row", value: user.row },
                      { label: "Seat", value: user.seat },
                    ].map(f => (
                      <div key={f.label} className="bg-black/30 rounded-xl p-3 text-center border border-white/5">
                        <p className="text-[9px] text-gray-500 font-mono uppercase tracking-widest">{f.label}</p>
                        <p className="text-white font-heading font-black text-xl mt-1">{f.value}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-[10px] text-gray-600 font-mono mt-3">{user.ticket}</p>
                </div>

                {/* Live gate traffic */}
                <div>
                  <h3 className="text-gray-400 text-xs font-mono uppercase tracking-widest mb-3">Live Gate Traffic</h3>
                  <div className="space-y-2.5">
                    {gates.map(g => (
                      <div key={g.id} className={`flex items-center gap-3 p-3 rounded-xl border ${g.id === user.assignedGate ? 'border-[#00E5FF]/30 bg-[#00E5FF]/5' : 'border-white/5 bg-white/2'}`}>
                        <span className={`text-xs font-mono font-bold w-12 shrink-0 ${g.id === user.assignedGate ? 'text-[#00E5FF]' : 'text-gray-400'}`}>{g.name}</span>
                        <div className="flex-1"><GateBar pct={g.capacity_pct} height="h-1.5" /></div>
                        <span className="text-[11px] font-mono text-gray-400 w-8 text-right">{g.capacity_pct}%</span>
                        <StatusChip status={g.status} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assigned gate card */}
                <div className="relative rounded-3xl border border-[#00E5FF]/40 bg-[#00E5FF]/5 p-5 overflow-hidden">
                  {["scale-1", "scale-[1.3]", "scale-[1.7]"].map((s, i) => (
                    <motion.div key={i} className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-[#00E5FF]/10 pointer-events-none ${s}`}
                      animate={{ scale: [1, 1.5 + i * 0.3, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ repeat: Infinity, duration: 3 + i, delay: i * 0.8 }} />
                  ))}
                  <p className="text-[10px] text-[#00E5FF]/70 font-mono uppercase tracking-widest z-10 relative">Your Assigned Gate</p>
                  <div className="flex items-end justify-between mt-2 z-10 relative">
                    <h2 className="text-5xl font-heading font-black text-white">{myGate.name}</h2>
                    <StatusChip status={myGate.status} />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-4 z-10 relative">
                    <div className="text-center"><p className="text-[9px] text-gray-500 font-mono uppercase">Wait</p><p className="text-white font-bold text-lg mt-1">{myGate.wait_min}m</p></div>
                    <div className="text-center"><p className="text-[9px] text-gray-500 font-mono uppercase">Load</p><p className="text-white font-bold text-lg mt-1">{myGate.capacity_pct}%</p></div>
                    <div className="text-center"><p className="text-[9px] text-gray-500 font-mono uppercase">Walk</p><p className="text-white font-bold text-lg mt-1">4 min</p></div>
                  </div>
                  <div className="mt-4 z-10 relative"><GateBar pct={myGate.capacity_pct} height="h-2" /></div>
                </div>

                <button onClick={() => go("pass", 1)} className="w-full py-4 rounded-2xl bg-[#00E5FF] text-[#080C1A] font-heading font-black text-[15px] tracking-wide shadow-[0_0_20px_rgba(0,229,255,0.3)] active:scale-95 transition-transform flex items-center justify-center gap-2">
                  <ArrowRightCircle className="w-5 h-5" /> View My Entry Pass
                </button>
              </div>
            )}

            {/* ── SCREEN 2: ENTRY PASS ── */}
            {screen === "pass" && (
              <div className="p-6 space-y-6">
                <div className="text-center">
                  <h1 className="text-xl font-heading font-black text-white">Entry Pass</h1>
                  <p className="text-gray-500 text-xs font-mono mt-1">Show this at gate — scan required</p>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center bg-white/3 border border-white/8 rounded-3xl p-6 gap-4">
                  <QRCode value={qrValue} size={180} />
                  <div className="text-center">
                    <p className="text-white font-bold text-lg font-heading">{myGate.name}</p>
                    <p className="text-gray-500 text-xs font-mono mt-1">{user.ticket} · Section {user.section} · Row {user.row} · Seat {user.seat}</p>
                  </div>
                </div>

                {/* Gate status live */}
                <div className={`rounded-2xl border p-4 transition-all duration-500 ${myGate.status === 'critical' || myGate.status === 'busy' ? 'border-red-500/50 bg-red-500/5' : 'border-[#00E5FF]/30 bg-[#00E5FF]/5'}`}>
                  {(myGate.status === 'critical') && (
                    <motion.div className="absolute inset-0 rounded-2xl border-2 border-red-500/60 pointer-events-none"
                      animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2 }} />
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-gray-400 text-xs font-mono uppercase tracking-widest">Gate Status</p>
                    <StatusChip status={myGate.status} />
                  </div>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-3xl font-heading font-black text-white">{myGate.name}</span>
                    <span className="text-gray-500 text-sm font-mono mb-1">{myGate.capacity_pct}% · {myGate.wait_min} min wait</span>
                  </div>
                  <GateBar pct={myGate.capacity_pct} height="h-2.5" />
                </div>

                {/* All gates accordion */}
                <div className="border border-white/8 rounded-2xl overflow-hidden">
                  <button onClick={() => setExpanded(e => !e)} className="w-full flex items-center justify-between p-4 text-gray-400 hover:text-white transition-colors">
                    <span className="text-xs font-mono uppercase tracking-widest">All Gates Live Status</span>
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <AnimatePresence>
                    {expanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                        <div className="px-4 pb-4 space-y-2 border-t border-white/5 pt-3">
                          {gates.map(g => (
                            <div key={g.id} className="flex items-center gap-3">
                              <span className="text-xs font-mono text-gray-400 w-12">{g.name}</span>
                              <div className="flex-1"><GateBar pct={g.capacity_pct} height="h-1.5" /></div>
                              <span className="text-[11px] font-mono text-gray-500 w-7 text-right">{g.capacity_pct}%</span>
                              <StatusChip status={g.status} />
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Simulate button */}
                <button
                  onClick={handleSimulate}
                  disabled={simLoading || isSimulating}
                  className="w-full py-4 rounded-2xl border border-orange-500/40 bg-orange-500/10 text-orange-400 font-mono font-bold text-[13px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {simLoading || isSimulating ? (
                    <><div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />Simulating congestion...</>
                  ) : (
                    <>⚡ Simulate Congestion at {myGate.name}</>
                  )}
                </button>
              </div>
            )}

            {/* ── SCREEN 3: REASSIGNMENT NOTIFICATION ── */}
            {screen === "reassignment" && notification && fromGate && toGate && (
              <div className="p-6 space-y-5">
                {/* Animated top banner */}
                <motion.div
                  initial={{ y: -40, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ type: "spring" as const, stiffness: 200, damping: 20 }}
                  className="bg-[#A78BFA]/10 border border-[#A78BFA]/50 rounded-2xl p-4 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#A78BFA]/40" />
                  <p className="text-[#A78BFA] font-mono text-xs uppercase tracking-widest font-bold mb-1">⚠ Smart Reassignment</p>
                  <p className="text-white font-heading font-bold text-[15px] leading-snug">
                    Gate {notification.fromGate} is now <span className="text-red-400">{fromGate.status}</span>. You&apos;ve been reassigned to Gate {notification.toGate}.
                  </p>
                  {/* Countdown bar */}
                  <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-[#A78BFA]/60 rounded-full"
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{ duration: 8, ease: "linear" }} />
                  </div>
                  <p className="text-gray-500 text-[10px] font-mono mt-1">Auto-dismisses in {countdown}s</p>
                </motion.div>

                {/* Before / After cards */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { gate: fromGate, label: "Before", color: "border-red-500/40 bg-red-500/5", textColor: "text-red-400" },
                    { gate: toGate, label: "After", color: "border-[#00F0A0]/40 bg-[#00F0A0]/5", textColor: "text-[#00F0A0]" },
                  ].map(({ gate, label, color, textColor }) => (
                    <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`rounded-2xl border p-4 ${color}`}>
                      <p className={`text-[9px] font-mono uppercase tracking-widest font-bold ${textColor}`}>{label}</p>
                      <p className="text-white font-heading font-black text-xl mt-1">{gate.name}</p>
                      <div className="mt-3"><GateBar pct={gate.capacity_pct} height="h-2" /></div>
                      <div className="flex justify-between mt-2 text-[10px] font-mono">
                        <span className={textColor}>{gate.capacity_pct}%</span>
                        <span className="text-gray-500">{gate.wait_min}m wait</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Time saved */}
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.35 }}
                  className="bg-[#00F0A0]/10 border border-[#00F0A0]/30 rounded-2xl p-4 text-center">
                  <p className="text-[#00F0A0] font-heading font-black text-2xl">~{notification.savedMinutes} min saved</p>
                  <p className="text-gray-400 text-xs font-mono mt-1">based on current gate throughput</p>
                </motion.div>

                {/* Walking steps */}
                <div className="space-y-2">
                  <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest">Walking directions</p>
                  {steps.map((step, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.15 }}
                      className="flex items-start gap-3 p-3 bg-white/3 rounded-xl border border-white/5">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-white">{i + 1}</span>
                      </div>
                      <p className="text-gray-300 text-sm leading-snug">{step}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="space-y-3">
                  <button onClick={handleAccept} className="w-full py-4 rounded-2xl bg-[#00F0A0] text-[#080C1A] font-heading font-black text-[15px] tracking-wide active:scale-95 transition-transform flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> Accept — Open New Gate Pass
                  </button>
                  <button onClick={handleDecline} className="w-full py-4 rounded-2xl border border-white/10 text-gray-400 font-mono text-[13px] uppercase tracking-widest active:scale-95 transition-transform">
                    Keep Original Gate
                  </button>
                </div>
              </div>
            )}

            {/* ── SCREEN 4: UPDATED PASS ── */}
            {screen === "updated-pass" && (
              <div className="p-6 space-y-6">
                <div className="text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" as const, stiffness: 200 }} className="w-14 h-14 rounded-full bg-[#00F0A0]/20 border border-[#00F0A0]/40 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-7 h-7 text-[#00F0A0]" />
                  </motion.div>
                  <h1 className="text-xl font-heading font-black text-white">Updated Entry Pass</h1>
                  <p className="text-[#00F0A0] text-xs font-mono mt-1 uppercase tracking-widest">Gate reassignment confirmed</p>
                </div>

                <div className="flex flex-col items-center bg-[#00F0A0]/5 border border-[#00F0A0]/30 rounded-3xl p-6 gap-4">
                  <QRCode value={JSON.stringify({ ticket: user.ticket, gate: user.assignedGate, section: user.section, row: user.row, seat: user.seat, ts: Date.now() })} size={180} />
                  <div className="text-center">
                    <p className="text-[#00F0A0] font-heading font-black text-2xl">{myGate.name}</p>
                    <p className="text-gray-500 text-xs font-mono mt-1">{user.ticket} · {myGate.direction} Entrance</p>
                  </div>
                </div>

                <div className="bg-[#00F0A0]/10 border border-[#00F0A0]/30 rounded-2xl p-4 text-center">
                  <p className="text-[#00F0A0] font-heading font-black text-xl">Gate {myGate.name} — {myGate.capacity_pct}% · {myGate.wait_min} min wait</p>
                  <div className="mt-3"><GateBar pct={myGate.capacity_pct} height="h-2" /></div>
                </div>

                <button onClick={() => go("ticket", -1)} className="w-full py-4 rounded-2xl bg-[#00E5FF] text-[#080C1A] font-heading font-black text-[15px] tracking-wide active:scale-95 transition-transform">
                  All good — Enjoy the match! 🎉
                </button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function AttendeeEntryPage() {
  return (
    <VenueProvider>
      <EntryContent />
    </VenueProvider>
  );
}
