"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Navigation, AlertOctagon, CheckCircle2,
  Zap, Radio, Users, CornerUpRight, ArrowUp, X
} from "lucide-react";
import { DetailedStadiumMap } from "@/components/DetailedStadiumMap";

const HEX_COLORS = {
  alex:   "#A78BFA",
  sam:    "#34D399",
  jordan: "#FB923C",
};

const FRIENDS = [
  { id: "alex",   name: "Alex K.",    initials: "AK", loc: "Section B, Row 12",  dist: 120, eta: 3, x: "72%", y: "28%" },
  { id: "sam",    name: "Sam R.",     initials: "SR", loc: "North Food Court",   dist: 55,  eta: 1, x: "32%", y: "46%" },
  { id: "jordan", name: "Jordan M.", initials: "JM", loc: "Washroom West Wing", dist: 280, eta: 7, x: "68%", y: "65%" },
];

// Walking directions per friend
const DIRECTIONS: Record<string, string[]> = {
  alex:   ["Head up to Level 3 via East escalator", "Turn left past Section B signage", "Alex is at Row 12, Seat 4 — look for violet beacon"],
  sam:    ["Exit your row toward the concourse",    "North food court is 55m ahead",     "Sam is near the Burger kiosk on the left"],
  jordan: ["Walk West on Level 1 concourse",        "Pass Washroom Block W1",             "Jordan is at Washroom West Wing entrance"],
};

type PanicState = "idle" | "sending" | "sent";

export default function CompanionFinder() {
  const [selected, setSelected] = useState<string | null>(null);
  const [navStep, setNavStep] = useState(0);
  const [panicState, setPanicState] = useState<PanicState>("idle");
  const [showMeetup, setShowMeetup] = useState(false);
  const [meetupSet, setMeetupSet] = useState(false);
  const [shareLocation, setShareLocation] = useState(true);

  // pulse "scanning" dots
  const [pingDot, setPingDot] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPingDot(d => (d + 1) % FRIENDS.length), 3000);
    return () => clearTimeout(t);
  }, []);

  const handlePanic = () => {
    setPanicState("sending");
    setTimeout(() => setPanicState("sent"), 1800);
    setTimeout(() => setPanicState("idle"), 6000);
  };

  const activeFriend = selected ? FRIENDS.find(f => f.id === selected) : null;
  const activeColor = selected ? HEX_COLORS[selected as keyof typeof HEX_COLORS] : "#00E5FF";
  const activeSteps = selected ? DIRECTIONS[selected] : [];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#04060C] text-white flex flex-col xl:flex-row">

      {/* ── LEFT SIDEBAR ── */}
      <div className="w-full xl:w-[380px] shrink-0 border-r border-white/5 bg-[#080C1A] flex flex-col">
        {/* Header */}
        <div className="px-7 py-6 border-b border-white/5">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-heading font-black text-white tracking-tight">Companion Finder</h1>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-red-400 uppercase tracking-widest">
              <Radio className="w-3 h-3 animate-pulse" /> Live
            </div>
          </div>
          <p className="text-gray-600 text-xs font-mono">Tap a friend to start navigation</p>
        </div>

        {/* Location share toggle */}
        <div className="mx-7 mt-5 flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-white/2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${shareLocation ? "bg-[#00E5FF] animate-pulse" : "bg-gray-600"}`} />
            <span className="text-sm font-medium text-gray-300">Share my location</span>
          </div>
          <button onClick={() => setShareLocation(s => !s)}
            className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${shareLocation ? "bg-[#00E5FF]" : "bg-white/10"}`}>
            <motion.div animate={{ x: shareLocation ? 20 : 0 }} transition={{ type: "spring" as const, stiffness: 500, damping: 30 }}
              className={`w-4 h-4 rounded-full shadow-md ${shareLocation ? "bg-[#080C1A]" : "bg-gray-500"}`} />
          </button>
        </div>

        {/* Friend list */}
        <div className="flex-1 overflow-y-auto px-7 py-5 space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-3">Your Group · 3 members</p>
          {FRIENDS.map((f, i) => {
            const color = HEX_COLORS[f.id as keyof typeof HEX_COLORS];
            const isActive = selected === f.id;
            return (
              <motion.button
                key={f.id}
                onClick={() => { setSelected(isActive ? null : f.id); setNavStep(0); }}
                layout
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                  isActive ? "border-white/20 bg-white/5 scale-[1.01]" : "border-white/5 bg-white/2 hover:bg-white/4"
                }`}
              >
                {/* Avatar with pulsing ring when "scanning" */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-[#080C1A] text-sm"
                    style={{ backgroundColor: color }}>
                    {f.initials}
                  </div>
                  {pingDot === i && (
                    <motion.div className="absolute inset-0 rounded-full border-2 pointer-events-none"
                      style={{ borderColor: color }}
                      animate={{ scale: [1, 1.6], opacity: [0.8, 0] }}
                      transition={{ duration: 1, ease: "easeOut" }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-[14px]">{f.name}</p>
                  <p className="text-[11px] font-mono mt-0.5 flex items-center gap-1 truncate" style={{ color }}>
                    <MapPin className="w-3 h-3 shrink-0" /> {f.loc}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white font-bold">{f.dist}m</p>
                  <p className="text-[10px] font-mono uppercase tracking-widest mt-0.5" style={{ color }}>ETA {f.eta}m</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Navigation steps (shown when a friend is selected) */}
        <AnimatePresence>
          {activeFriend && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden border-t border-white/5"
            >
              <div className="px-7 py-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500">
                    Route to {activeFriend.name}
                  </p>
                  <button onClick={() => setSelected(null)} className="text-gray-600 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {activeSteps.map((step, i) => {
                    const done = i < navStep;
                    const active = i === navStep;
                    return (
                      <motion.div key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: active ? 1 : done ? 0.5 : 0.25, x: 0 }}
                        transition={{ delay: i * 0.12 }}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                          active ? "border-white/15 bg-white/5" : "border-transparent"
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5"
                          style={{ borderColor: done ? "#00F0A0" : active ? activeColor : "#333" }}>
                          {done ? <CheckCircle2 className="w-3.5 h-3.5 text-[#00F0A0]" /> :
                            i === 0 ? <ArrowUp className="w-3 h-3" style={{ color: activeColor }} /> :
                            i === 1 ? <CornerUpRight className="w-3 h-3" style={{ color: activeColor }} /> :
                            <MapPin className="w-3 h-3" style={{ color: activeColor }} />}
                        </div>
                        <p className={`text-sm leading-snug ${active ? "text-white font-medium" : "text-gray-600"}`}>{step}</p>
                      </motion.div>
                    );
                  })}
                </div>
                {navStep < activeSteps.length - 1 ? (
                  <button onClick={() => setNavStep(s => s + 1)}
                    className="w-full mt-4 py-3 rounded-xl text-[11px] font-mono font-bold uppercase tracking-widest transition-all active:scale-95"
                    style={{ backgroundColor: activeColor + "20", color: activeColor, border: `1px solid ${activeColor}40` }}>
                    <Navigation className="w-4 h-4 inline mr-2" /> Next step
                  </button>
                ) : (
                  <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                    className="mt-4 p-3 rounded-xl text-center text-sm font-bold" style={{ backgroundColor: "#00F0A0" + "20", color: "#00F0A0", border: "1px solid #00F0A040" }}>
                    <CheckCircle2 className="w-4 h-4 inline mr-2" /> You&apos;ve arrived!
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emergency button */}
        <div className="px-7 py-5 border-t border-white/5 shrink-0">
          <button
            onClick={handlePanic}
            disabled={panicState !== "idle"}
            className={`w-full py-4 min-h-[56px] rounded-2xl font-bold text-[14px] transition-all active:scale-[0.98] flex items-center justify-center gap-2 border ${
              panicState === "idle"    ? "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20" :
              panicState === "sending" ? "bg-[#FFB830]/10 text-[#FFB830] border-[#FFB830]/30" :
              "bg-[#00F0A0]/10 text-[#00F0A0] border-[#00F0A0]/30"
            }`}
          >
            <AnimatePresence mode="wait">
              {panicState === "idle" && (
                <motion.span key="idle" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5" /> I&apos;m lost — Alert my squad
                </motion.span>
              )}
              {panicState === "sending" && (
                <motion.span key="sending" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> Syncing GPS...
                </motion.span>
              )}
              {panicState === "sent" && (
                <motion.span key="sent" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> Location broadcasted!
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* ── RIGHT: FULL MAP ── */}
      <div className="flex-1 flex flex-col relative min-h-[500px]">
        {/* Map header */}
        <div className="px-7 py-5 border-b border-white/5 bg-[#080C1A]/80 backdrop-blur-sm flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-white font-heading font-bold">
              {activeFriend ? `Navigating to ${activeFriend.name}` : "Live Venue Map"}
            </h2>
            <p className="text-gray-600 text-[11px] font-mono mt-0.5 uppercase tracking-widest">
              {activeFriend ? `${activeFriend.dist}m · ${activeFriend.eta} min walk` : "All squad members shown · tap to navigate"}
            </p>
          </div>
          {!showMeetup && !meetupSet && (
            <button onClick={() => setShowMeetup(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#00E5FF]/30 bg-[#00E5FF]/8 text-[#00E5FF] text-[11px] font-mono font-bold uppercase tracking-widest hover:bg-[#00E5FF]/15 transition-colors">
              <Zap className="w-3.5 h-3.5" /> Plan Meetup
            </button>
          )}
          {meetupSet && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#00F0A0]/30 bg-[#00F0A0]/8 text-[#00F0A0] text-[11px] font-mono font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Meetup Set · West Pillar 4
            </div>
          )}
        </div>

        {/* Meetup plan banner */}
        <AnimatePresence>
          {showMeetup && !meetupSet && (
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              className="mx-6 mt-4 p-4 rounded-2xl border border-[#00E5FF]/30 bg-[#00E5FF]/8 flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-white font-bold flex items-center gap-2"><Users className="w-4 h-4 text-[#00E5FF]" /> Meet at West concourse, Pillar 4</p>
                <p className="text-gray-400 text-xs font-mono mt-1">AI selected — centroid of all 3 squad members · everyone ≤3 min walk</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => { setMeetupSet(true); setShowMeetup(false); }}
                  className="px-4 py-2 rounded-xl bg-[#00E5FF] text-[#080C1A] font-bold text-xs font-mono uppercase tracking-widest">
                  Set Point
                </button>
                <button onClick={() => setShowMeetup(false)} className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The map */}
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.04)_0%,transparent_70%)]" />
          <DetailedStadiumMap mode="abstract" className="w-full h-full" />

          {/* SVG overlay for pins + route */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Meetup point */}
            {meetupSet && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" as const, stiffness: 200 }}
                className="absolute" style={{ left: "35%", top: "52%", transform: "translate(-50%,-50%)" }}>
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-[#00E5FF]/20 border-2 border-[#00E5FF] flex items-center justify-center">
                    <Users className="w-4 h-4 text-[#00E5FF]" />
                  </div>
                  <motion.div className="absolute inset-0 rounded-full border-2 border-[#00E5FF]"
                    animate={{ scale: [1, 2], opacity: [0.5, 0] }} transition={{ repeat: Infinity, duration: 2 }} />
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-mono text-[#00E5FF] bg-[#080C1A]/90 px-2 py-1 rounded-full border border-[#00E5FF]/20">
                    MEET HERE
                  </div>
                </div>
              </motion.div>
            )}

            {/* Animated route line when navigating */}
            {activeFriend && (
              <svg className="absolute inset-0 w-full h-full">
                <motion.line
                  x1="50%" y1="58%"
                  x2={activeFriend.x} y2={activeFriend.y}
                  stroke={activeColor} strokeWidth="2.5" strokeDasharray="8 5"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </svg>
            )}

            {/* You dot */}
            <div className="absolute" style={{ left: "50%", top: "58%", transform: "translate(-50%,-50%)" }}>
              <motion.div className="w-5 h-5 rounded-full bg-white border-[3px] border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.8)]"
                animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-[#00E5FF] whitespace-nowrap">YOU</div>
            </div>

            {/* Friend pins */}
            {FRIENDS.map((f) => {
              const color = HEX_COLORS[f.id as keyof typeof HEX_COLORS];
              const isActive = selected === f.id;
              return (
                <div key={f.id} className="absolute" style={{ left: f.x, top: f.y, transform: "translate(-50%,-50%)" }}>
                  <motion.div
                    animate={isActive ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                    transition={{ repeat: isActive ? Infinity : 0, duration: 1.5 }}
                    className="w-5 h-5 rounded-full border-2 border-white/50"
                    style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}80` }} />
                  {isActive && (
                    <motion.div className="absolute inset-0 rounded-full border-2"
                      style={{ borderColor: color }}
                      animate={{ scale: [1, 2.2], opacity: [0.8, 0] }}
                      transition={{ repeat: Infinity, duration: 1.2 }} />
                  )}
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-mono whitespace-nowrap" style={{ color }}>
                    {f.initials}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom friend status strip */}
        <div className="border-t border-white/5 bg-[#080C1A]/80 backdrop-blur-sm shrink-0 px-6 py-4 grid grid-cols-3 gap-3">
          {FRIENDS.map(f => {
            const color = HEX_COLORS[f.id as keyof typeof HEX_COLORS];
            const isActive = selected === f.id;
            return (
              <button key={f.id} onClick={() => { setSelected(isActive ? null : f.id); setNavStep(0); }}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${isActive ? "border-white/15 bg-white/5" : "border-white/5 hover:bg-white/3"}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] text-[#080C1A] shrink-0"
                  style={{ backgroundColor: color }}>{f.initials}</div>
                <div className="min-w-0">
                  <p className="text-white font-bold text-[12px] truncate">{f.name.split(" ")[0]}</p>
                  <p className="text-[10px] font-mono" style={{ color }}>{f.dist}m · {f.eta}m</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
