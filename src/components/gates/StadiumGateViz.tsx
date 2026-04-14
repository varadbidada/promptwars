"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVenueStore } from "@/store/venueStore";
import type { Gate } from "@/store/venueStore";

// Stadium geometry constants (SVG viewBox 0 0 600 500)
const CX = 300, CY = 250;
const GATE_POSITIONS: Record<string, { x: number; y: number; label: string; inward: { x: number; y: number } }> = {
  A: { x: 300, y: 460, label: "A", inward: { x: 300, y: 370 } }, // South
  B: { x: 300, y: 40,  label: "B", inward: { x: 300, y: 130 } }, // North
  C: { x: 40,  y: 250, label: "C", inward: { x: 130, y: 250 } }, // West
  D: { x: 560, y: 250, label: "D", inward: { x: 470, y: 250 } }, // East
};

const STATUS_COLOR: Record<string, string> = {
  clear: "#00F0A0", moderate: "#FFB830", busy: "#F97316", critical: "#EF4444"
};

// --- Particle type
interface Particle {
  id: number;
  gateId: string;
  progress: number;       // 0-1, fraction along path
  isRedirect: boolean;
  fromGateId?: string;
  speed: number;
  opacity: number;
}

let pid = 0;

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

// Quadratic bezier point
function bezier(p0: {x:number;y:number}, p1: {x:number;y:number}, p2: {x:number;y:number}, t: number) {
  return {
    x: (1-t)*(1-t)*p0.x + 2*(1-t)*t*p1.x + t*t*p2.x,
    y: (1-t)*(1-t)*p0.y + 2*(1-t)*t*p1.y + t*t*p2.y,
  };
}

// Get redirection arc control point between two gates
function redirectControl(from: {x:number;y:number}, to: {x:number;y:number}) {
  return { x: lerp(from.x, to.x, 0.5) + (from.y - to.y) * 0.4, y: lerp(from.y, to.y, 0.5) + (to.x - from.x) * 0.4 };
}

export function StadiumGateViz() {
  const gates = useVenueStore(s => s.gates);
  const notification = useVenueStore(s => s.notification);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [redirectEvents, setRedirectEvents] = useState<{ from: string; to: string; id: number }[]>([]);
  const rafRef = useRef<number>(0);
  const lastSpawnRef = useRef<Record<string, number>>({});
  const frameRef = useRef(0);

  // Spawn and move particles via rAF
  useEffect(() => {
    const tick = () => {
      frameRef.current++;

      setParticles(prev => {
        let next = prev
          .map(p => ({ ...p, progress: p.progress + p.speed }))
          .filter(p => p.progress < 1 && p.opacity > 0);

        // Spawn new entry particles proportional to gate capacity
        gates.forEach(gate => {
          const last = lastSpawnRef.current[gate.id] ?? 0;
          const interval = Math.max(4, 30 - Math.floor(gate.capacity_pct / 5)); // busier = more particles
          if (frameRef.current - last > interval) {
            lastSpawnRef.current[gate.id] = frameRef.current;
            next = [...next, {
              id: ++pid, gateId: gate.id, progress: 0,
              isRedirect: false, speed: 0.008 + (gate.capacity_pct / 10000),
              opacity: 1,
            }];
          }
        });

        return next.slice(-200); // cap
      });

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [gates]);

  // When notification fires, show redirect arc event
  useEffect(() => {
    if (!notification) return;
    const event = { from: notification.fromGate, to: notification.toGate, id: ++pid };
    setRedirectEvents(prev => [...prev, event]);
    // Spawn a burst of redirect particles
    setParticles(prev => [
      ...prev,
      ...Array.from({ length: 18 }).map((_, i) => ({
        id: ++pid,
        gateId: notification.toGate,
        fromGateId: notification.fromGate,
        progress: i * 0.04,
        isRedirect: true,
        speed: 0.007,
        opacity: 1,
      }))
    ]);
    const t = setTimeout(() => setRedirectEvents(e => e.filter(ev => ev.id !== event.id)), 5000);
    return () => clearTimeout(t);
  }, [notification]);

  // Compute particle screen position
  const getParticlePos = (p: Particle) => {
    const gate = GATE_POSITIONS[p.gateId];
    if (!gate) return { x: CX, y: CY };

    if (p.isRedirect && p.fromGateId) {
      const fromGate = GATE_POSITIONS[p.fromGateId];
      if (!fromGate) return { x: CX, y: CY };
      // Arc: fromGate → toGate entrance → stadium interior
      const ctrl = redirectControl(fromGate, gate);
      if (p.progress < 0.5) {
        return bezier(fromGate, ctrl, gate, p.progress * 2);
      }
      // Then funnel inward
      const t2 = (p.progress - 0.5) * 2;
      return bezier(gate, gate.inward, { x: CX + (gate.inward.x - gate.x) * 0.5, y: CY + (gate.inward.y - gate.y) * 0.5 }, t2);
    }

    // Normal entry: gate → inward → sector
    const ctrl = { x: lerp(gate.x, CX, 0.3), y: lerp(gate.y, CY, 0.3) };
    return bezier(gate, ctrl, { x: CX + (Math.random() - 0.5) * 80, y: CY + (Math.random() - 0.5) * 60 }, p.progress);
  };

  const gateMap: Record<string, Gate> = {};
  gates.forEach(g => { gateMap[g.id] = g; });

  // Crowd fill level ellipse (inner fill scales with average capacity)
  const avgCap = Math.round(gates.reduce((s, g) => s + g.capacity_pct, 0) / gates.length);

  return (
    <div className="relative w-full aspect-[6/5] bg-[#04060C] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
      {/* Scanline */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 4px)" }} />

      {/* Ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.04)_0%,transparent_70%)] pointer-events-none" />

      <svg viewBox="0 0 600 500" className="w-full h-full">
        <defs>
          <filter id="glow-soft">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-strong">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="pitch-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0D2010" />
            <stop offset="100%" stopColor="#060F08" />
          </radialGradient>
          <radialGradient id="crowd-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* CAD grid */}
        <g opacity="0.06">
          {Array.from({length:12}).map((_,i)=>(
            <line key={`gv${i}`} x1={i*50} y1="0" x2={i*50} y2="500" stroke="#00E5FF" strokeWidth="0.5"/>
          ))}
          {Array.from({length:10}).map((_,i)=>(
            <line key={`gh${i}`} x1="0" y1={i*50} x2="600" y2={i*50} stroke="#00E5FF" strokeWidth="0.5"/>
          ))}
        </g>

        {/* Outer stadium ring */}
        <ellipse cx={CX} cy={CY} rx="255" ry="215" fill="#0A0E1A" stroke="#ffffff08" strokeWidth="20" />
        {/* Seating area ring (simplified) */}
        <ellipse cx={CX} cy={CY} rx="240" ry="200" fill="none" stroke="#1a2040" strokeWidth="28" />
        {/* Crowd glow fill */}
        <ellipse cx={CX} cy={CY} rx="215" ry="178" fill="url(#crowd-grad)" />

        {/* Crowd fill indicator (scales with avg capacity) */}
        <ellipse cx={CX} cy={CY} rx={Math.round(215 * avgCap / 100)} ry={Math.round(178 * avgCap / 100)} fill="#00E5FF" opacity="0.025" />

        {/* Concourse ring line */}
        <ellipse cx={CX} cy={CY} rx="185" ry="155" fill="none" stroke="#ffffff05" strokeWidth="8" />

        {/* Pitch */}
        <ellipse cx={CX} cy={CY} rx="115" ry="90" fill="url(#pitch-grad)" stroke="#1a3020" strokeWidth="2" />
        <ellipse cx={CX} cy={CY} rx="100" ry="76" fill="none" stroke="#1f4028" strokeWidth="1.5" />
        <circle cx={CX} cy={CY} r="22" fill="none" stroke="#1f4028" strokeWidth="1.5" />
        <line x1={CX} y1={CY - 76} x2={CX} y2={CY + 76} stroke="#1f4028" strokeWidth="1.5" />
        <circle cx={CX} cy={CY} r="3" fill="#2a5535" />
        <text x={CX} y={CY + 5} textAnchor="middle" fill="#2a5535" fontSize="10" fontFamily="monospace">PITCH</text>

        {/* Redirect arc paths (SVG animated) */}
        {redirectEvents.map(ev => {
          const from = GATE_POSITIONS[ev.from];
          const to = GATE_POSITIONS[ev.to];
          if (!from || !to) return null;
          const ctrl = redirectControl(from, to);
          const d = `M ${from.x} ${from.y} Q ${ctrl.x} ${ctrl.y} ${to.x} ${to.y}`;
          return (
            <motion.path key={`arc-${ev.id}`} d={d} fill="none" stroke="#A78BFA" strokeWidth="2.5"
              strokeDasharray="8 6"
              initial={{ pathLength: 0, opacity: 0.9 }}
              animate={{ pathLength: 1, opacity: [0.9, 0.9, 0] }}
              transition={{ duration: 1.8, ease: "easeOut" }}
            />
          );
        })}

        {/* Particles */}
        {particles.map(p => {
          const pos = getParticlePos(p);
          const gate = gateMap[p.gateId];
          const color = gate ? STATUS_COLOR[gate.status] : "#00E5FF";
          const isRedir = p.isRedirect;
          return (
            <circle key={p.id}
              cx={pos.x} cy={pos.y}
              r={isRedir ? 3.5 : 2.5}
              fill={isRedir ? "#A78BFA" : color}
              opacity={Math.max(0, 1 - p.progress * 1.1)}
              filter={isRedir ? "url(#glow-strong)" : "url(#glow-soft)"}
            />
          );
        })}

        {/* Gate markers */}
        {Object.entries(GATE_POSITIONS).map(([id, pos]) => {
          const gate = gateMap[id];
          const color = gate ? STATUS_COLOR[gate.status] : "#888";
          const isCritical = gate?.status === "critical";
          return (
            <g key={`gate-${id}`} filter={isCritical ? "url(#glow-strong)" : "url(#glow-soft)"}>
              {/* Entry tunnel line */}
              <line x1={pos.x} y1={pos.y} x2={pos.inward.x} y2={pos.inward.y}
                stroke={color} strokeWidth="6" strokeOpacity="0.15" strokeLinecap="round" />
              {/* Gate box */}
              <rect x={pos.x - 22} y={pos.y - 14} width="44" height="28" rx="8"
                fill={color + "22"} stroke={color} strokeWidth={isCritical ? 2.5 : 1.5} />
              <text x={pos.x} y={pos.y + 5} textAnchor="middle" fill={color}
                fontSize="11" fontWeight="bold" fontFamily="monospace">Gate {id}</text>

              {/* Capacity % below */}
              <text x={pos.x} y={pos.y + 24} textAnchor="middle" fill={color}
                fontSize="9" fontFamily="monospace" opacity="0.8">
                {gate?.capacity_pct ?? "—"}% · {gate?.wait_min ?? "—"}m
              </text>

              {/* Critical pulse ring */}
              {isCritical && (
                <motion.circle cx={pos.x} cy={pos.y} r="20" fill="none" stroke="#EF4444" strokeWidth="1.5"
                  animate={{ scale: [1, 2.2, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ repeat: Infinity, duration: 1.4 }} />
              )}
            </g>
          );
        })}

        {/* Crowding hot zones (proportional to each gate's load) */}
        {gates.map(gate => {
          if (gate.capacity_pct < 65) return null;
          const pos = GATE_POSITIONS[gate.id];
          if (!pos) return null;
          const radFraction = (gate.capacity_pct - 65) / 35; // 0-1 from 65% to 100%
          const r = 20 + radFraction * 30;
          const color = STATUS_COLOR[gate.status];
          return (
            <motion.ellipse key={`hz-${gate.id}`}
              cx={pos.inward.x} cy={pos.inward.y} rx={r} ry={r * 0.6}
              fill={color} opacity={0.06 + radFraction * 0.08}
              animate={{ opacity: [0.06 + radFraction * 0.06, 0.08 + radFraction * 0.12, 0.06 + radFraction * 0.06] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
            />
          );
        })}

        {/* Center legend */}
        <text x={CX} y={CY - 98} textAnchor="middle" fill="#ffffff15" fontSize="8" fontFamily="monospace" letterSpacing="3">
          LIVE GATE FLOW MONITOR
        </text>
      </svg>

      {/* Overlay legend */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1.5">
        {[
          { color: "#00F0A0", label: "Normal entry flow" },
          { color: "#A78BFA", label: "Redirected fans" },
          { color: "#EF4444", label: "Critical gate zone" },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}` }} />
            <span className="text-[9px] font-mono text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Live redirect label */}
      <AnimatePresence>
        {redirectEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-4 right-4 bg-[#A78BFA]/20 border border-[#A78BFA]/50 rounded-xl px-3 py-2 flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-[#A78BFA] animate-pulse" />
            <span className="text-[#A78BFA] text-[10px] font-mono font-bold uppercase tracking-widest">
              Redirect in progress Gate {redirectEvents[0].from} → {redirectEvents[0].to}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avg fill readout */}
      <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md border border-white/8 rounded-xl px-3 py-2">
        <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Stadium Fill</p>
        <p className="text-white font-heading font-black text-xl tabular-nums">{avgCap}<span className="text-xs font-normal text-gray-500 ml-1">%</span></p>
      </div>
    </div>
  );
}
