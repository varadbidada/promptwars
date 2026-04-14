"use client";

import { useMemo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ViewMode = "heatmap" | "egress" | "abstract";

interface DetailedStadiumMapProps {
  mode?: ViewMode;
  onBlockHover?: (data: { id: string; tier: string; occupancy: number; baseHeat: number; x: number; y: number } | null) => void;
  className?: string;
  zoom?: boolean;
  dispatchedActions?: number[]; // indexes of dispatched AI actions
}

// Gate positions around stadium perimeter (angle in radians, label)
const GATES = [
  { label: "GATE A", angle: -Math.PI / 2,      rx: 430, ry: 380, color: "#00E5FF", status: "OPEN" },
  { label: "GATE B", angle: -Math.PI / 4,      rx: 430, ry: 380, color: "#00F0A0", status: "OPEN" },
  { label: "GATE C", angle: 0,                 rx: 430, ry: 380, color: "#FFB830", status: "BUSY" },
  { label: "GATE D", angle: Math.PI / 4,       rx: 430, ry: 380, color: "#EF4444", status: "CRITICAL" },
  { label: "GATE E", angle: Math.PI / 2,       rx: 430, ry: 380, color: "#00E5FF", status: "OPEN" },
  { label: "GATE F", angle: (3 * Math.PI) / 4, rx: 430, ry: 380, color: "#00F0A0", status: "OPEN" },
  { label: "GATE G", angle: Math.PI,           rx: 430, ry: 380, color: "#FFB830", status: "BUSY" },
  { label: "GATE H", angle: -(3 * Math.PI) / 4, rx: 430, ry: 380, color: "#00F0A0", status: "OPEN" },
];

// Washroom block positions in concourse ring
const WASHROOMS = [
  { label: "WR-N1", angle: -Math.PI / 2 + 0.2,  rx: 380, ry: 330, status: "critical", occ: 87 },
  { label: "WR-N2", angle: -Math.PI / 2 - 0.2,  rx: 380, ry: 330, status: "ok",       occ: 42 },
  { label: "WR-E1", angle: 0.2,                  rx: 380, ry: 330, status: "warning",  occ: 64 },
  { label: "WR-S1", angle: Math.PI / 2 + 0.2,   rx: 380, ry: 330, status: "ok",       occ: 38 },
  { label: "WR-W1", angle: Math.PI - 0.2,        rx: 380, ry: 330, status: "warning",  occ: 71 },
  { label: "WR-W2", angle: Math.PI + 0.2,        rx: 380, ry: 330, status: "ok",       occ: 29 },
];

const WR_COLOR: Record<string, string> = {
  critical: "#EF4444",
  warning:  "#FFB830",
  ok:       "#00F0A0",
};

const CX = 500;
const CY = 400;

export function DetailedStadiumMap({ mode = "heatmap", onBlockHover, className = "", zoom = false, dispatchedActions = [] }: DetailedStadiumMapProps) {
  const [crowdDots, setCrowdDots] = useState<{ id: number; x: number; y: number; tx: number; ty: number }[]>([]);
  const [tick, setTick] = useState(0);

  // Simulate crowd movement animation tick
  useEffect(() => {
    if (mode !== "heatmap") return;
    const interval = setInterval(() => setTick(t => t + 1), 2500);
    return () => clearInterval(interval);
  }, [mode]);

  // Generate crowd movement dots when Gate D dispatch is resolved (action index 0)
  const gateEOpen = dispatchedActions.includes(0);
  const cleaningDispatched = dispatchedActions.includes(1);

  const { rings, pitch } = useMemo(() => {
    const generateRing = (rx: number, ry: number, numBlocks: number, thickness: number, ringId: string) => {
      const blocks = [];
      const angleStep = (Math.PI * 2) / numBlocks;
      const gap = 0.05;
      for (let i = 0; i < numBlocks; i++) {
        const startAngle = i * angleStep;
        const endAngle = (i + 1) * angleStep - gap;
        const innerRx = rx - thickness / 2;
        const innerRy = ry - thickness / 2;
        const outerRx = rx + thickness / 2;
        const outerRy = ry + thickness / 2;
        const x1i = CX + innerRx * Math.cos(startAngle), y1i = CY + innerRy * Math.sin(startAngle);
        const x2i = CX + innerRx * Math.cos(endAngle),   y2i = CY + innerRy * Math.sin(endAngle);
        const x1o = CX + outerRx * Math.cos(startAngle), y1o = CY + outerRy * Math.sin(startAngle);
        const x2o = CX + outerRx * Math.cos(endAngle),   y2o = CY + outerRy * Math.sin(endAngle);
        const largeArc = (endAngle - startAngle) > Math.PI ? 1 : 0;
        const path = `M ${x1i} ${y1i} L ${x1o} ${y1o} A ${outerRx} ${outerRy} 0 ${largeArc} 1 ${x2o} ${y2o} L ${x2i} ${y2i} A ${innerRx} ${innerRy} 0 ${largeArc} 0 ${x1i} ${y1i} Z`;
        const baseHeat = ((Math.sin(i * 0.7) * Math.cos(ringId === 'T2' ? i : i * 2)) + 1) / 2;
        blocks.push({ id: `${ringId}-S${i + 1}`, path, baseHeat, cx: CX + rx * Math.cos(startAngle + angleStep / 2), cy: CY + ry * Math.sin(startAngle + angleStep / 2), occupancy: Math.floor(baseHeat * 100) });
      }
      return blocks;
    };
    return {
      pitch: { x: 360, y: 280, width: 280, height: 240 },
      rings: [
        generateRing(200, 160, 24, 45, "LWR"),
        generateRing(265, 220, 36, 50, "CLB"),
        generateRing(340, 290, 48, 65, "UPR"),
      ]
    };
  }, []);

  const getFill = (block: { id: string; occupancy: number }) => {
    if (mode === "abstract") return "fill-navy stroke-glass hover:fill-blue-900/30";
    if (mode === "egress") {
      if (block.id.startsWith("UPR") && block.occupancy > 70) return "fill-electric/20 stroke-electric hover:fill-electric/40";
      return "fill-surface stroke-glass/20";
    }
    if (block.occupancy > 80) return "fill-red-500/40 stroke-red-500 hover:fill-red-500/60 cursor-crosshair";
    if (block.occupancy > 50) return "fill-amber/30 stroke-amber/80 hover:fill-amber/50 cursor-crosshair";
    return "fill-green/20 stroke-green/40 hover:fill-green/40 cursor-crosshair";
  };

  // Gate status color override after dispatch
  const getGateColor = (gate: typeof GATES[0]) => {
    if (gateEOpen && gate.label === "GATE E") return "#00F0A0";
    if (gateEOpen && gate.label === "GATE D") return "#FFB830";
    return gate.color;
  };

  const getGateStatus = (gate: typeof GATES[0]) => {
    if (gateEOpen && gate.label === "GATE E") return "OVERFLOW";
    if (gateEOpen && gate.label === "GATE D") return "REDIRECT";
    return gate.status;
  };

  return (
    <div className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}>
      <svg viewBox={zoom ? "100 0 500 500" : "0 0 1000 800"} className={`w-full h-full drop-shadow-2xl z-10 transition-transform duration-700 ${zoom ? 'scale-125' : 'hover:scale-[1.02]'}`}>
        <defs>
          <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="soft-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="crowd-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* CAD Grid */}
        {!zoom && (
          <g opacity="0.07">
            {Array.from({ length: 20 }).map((_, i) => <line key={`gv-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="800" stroke="#00E5FF" strokeWidth="1" />)}
            {Array.from({ length: 16 }).map((_, i) => <line key={`gh-${i}`} x1="0" y1={i * 50} x2="1000" y2={i * 50} stroke="#00E5FF" strokeWidth="1" />)}
          </g>
        )}

        {/* Pitch */}
        <g opacity={mode === 'egress' ? 0.2 : 0.9}>
          <rect x={pitch.x} y={pitch.y} width={pitch.width} height={pitch.height} rx="8" className="fill-surface stroke-glass stroke-[2px]" />
          <circle cx="500" cy="400" r="30" className="fill-none stroke-glass stroke-[2px]" />
          <line x1="500" y1="280" x2="500" y2="520" className="stroke-glass stroke-[2px]" />
          <rect x="360" y="330" width="45" height="140" className="fill-none stroke-glass stroke-[2px]" />
          <rect x="595" y="330" width="45" height="140" className="fill-none stroke-glass stroke-[2px]" />
          <text x="500" y="407" textAnchor="middle" fill="#ffffff20" fontSize="10" fontFamily="monospace">PITCH</text>
        </g>

        {/* Concourse Ring */}
        <ellipse cx="500" cy="400" rx="420" ry="370" fill="none" stroke="#ffffff08" strokeWidth="12" />

        {/* Seating Rings */}
        {rings.map((ring, ringIdx) => (
          <g key={`ring-${ringIdx}`}>
            {ring.map(block => (
              <path
                key={block.id}
                d={block.path}
                className={`${getFill(block)} stroke-[1.5px] transition-all duration-300`}
                onMouseEnter={(e) => { if (onBlockHover) onBlockHover({ ...block, x: e.clientX, y: e.clientY, tier: ringIdx === 0 ? 'LOWER' : ringIdx === 1 ? 'CLUB' : 'UPPER' }); }}
                onMouseLeave={() => { if (onBlockHover) onBlockHover(null); }}
              />
            ))}
          </g>
        ))}

        {/* ─── GATES ─── */}
        {GATES.map((gate, gi) => {
          const gx = CX + gate.rx * Math.cos(gate.angle);
          const gy = CY + gate.ry * Math.sin(gate.angle);
          const col = getGateColor(gate);
          const sta = getGateStatus(gate);
          const isActive = sta === "OVERFLOW" || sta === "REDIRECT";
          return (
            <g key={`gate-${gi}`} filter={isActive ? "url(#soft-glow)" : undefined}>
              {/* Pulsing ring for active gates */}
              {isActive && (
                <motion.circle cx={gx} cy={gy} r="22" fill="none" stroke={col} strokeWidth="2"
                  initial={{ scale: 1, opacity: 0.8 }} animate={{ scale: 2.2, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: "easeOut" }} />
              )}
              {/* Gate icon box */}
              <rect x={gx - 18} y={gy - 12} width="36" height="24" rx="6" fill={col + "22"} stroke={col} strokeWidth="2" />
              <text x={gx} y={gy + 4} textAnchor="middle" fill={col} fontSize="8" fontWeight="bold" fontFamily="monospace">{gate.label.split(" ")[1]}</text>
              {/* Status label */}
              <text x={gx} y={gy + 24} textAnchor="middle" fill={col} fontSize="7" fontFamily="monospace" opacity="0.8">{sta}</text>
            </g>
          );
        })}

        {/* ─── WASHROOMS ─── */}
        {WASHROOMS.map((wr, wi) => {
          const wx = CX + wr.rx * Math.cos(wr.angle);
          const wy = CY + wr.ry * Math.sin(wr.angle);
          const col = WR_COLOR[wr.status];
          const isCleaning = cleaningDispatched && wr.status === "critical";
          return (
            <g key={`wr-${wi}`} filter={wr.status === "critical" && !isCleaning ? "url(#neon-glow)" : undefined}>
              {/* Critical blinking */}
              {wr.status === "critical" && !isCleaning && (
                <motion.circle cx={wx} cy={wy} r="16" fill={col} opacity="0.15"
                  animate={{ opacity: [0.15, 0.4, 0.15] }} transition={{ repeat: Infinity, duration: 1.2 }} />
              )}
              {/* Diamond shape for washrooms */}
              <rect x={wx - 10} y={wy - 10} width="20" height="20" rx="3" fill={col + "33"} stroke={col} strokeWidth="1.5"
                transform={`rotate(45 ${wx} ${wy})`} />
              <text x={wx} y={wy + 3} textAnchor="middle" fill={col} fontSize="7" fontWeight="bold" fontFamily="monospace">WR</text>
              {/* Occupancy bubble */}
              <text x={wx} y={wy + 21} textAnchor="middle" fill={col} fontSize="7" fontFamily="monospace" opacity="0.85">{wr.occ}%</text>
              {/* Cleaning crew overlay */}
              {isCleaning && (
                <motion.text x={wx} y={wy - 16} textAnchor="middle" fill="#00F0A0" fontSize="7" fontFamily="monospace"
                  animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 2 }}>CLEANING</motion.text>
              )}
            </g>
          );
        })}

        {/* ─── CROWD FLOW ARROWS (Gate E redirect animation) ─── */}
        {gateEOpen && (() => {
          // Gate D position → Gate E position flow
          const gdAngle = Math.PI / 4;   // Gate D
          const geAngle = Math.PI / 2;   // Gate E
          const gdx = CX + 430 * Math.cos(gdAngle);
          const gdy = CY + 380 * Math.sin(gdAngle);
          const gex = CX + 430 * Math.cos(geAngle);
          const gey = CY + 380 * Math.sin(geAngle);
          return (
            <g filter="url(#neon-glow)">
              <motion.path
                d={`M ${gdx} ${gdy} Q ${CX + 460} ${CY + 440} ${gex} ${gey}`}
                fill="none" stroke="#00E5FF" strokeWidth="3" strokeDasharray="10 8"
                initial={{ strokeDashoffset: 200 }}
                animate={{ strokeDashoffset: -200 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />
              {/* Fan particle dots */}
              {[0, 0.3, 0.6].map((offset, pi) => (
                <motion.circle key={`particle-${pi}`} r="5" fill="#00E5FF" opacity="0.9"
                  animate={{
                    cx: [gdx, CX + 460, gex],
                    cy: [gdy, CY + 440, gey],
                    opacity: [0, 0.9, 0],
                  }}
                  transition={{ repeat: Infinity, duration: 2, delay: offset, ease: "easeInOut" }}
                />
              ))}
              <text x={(gdx + gex) / 2 + 20} y={(gdy + gey) / 2 - 15} fill="#00E5FF" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">1,200 FANS →</text>
            </g>
          );
        })()}

        {/* ─── EGRESS MODE ARROWS ─── */}
        {mode === "egress" && (
          <g className="pointer-events-none" filter="url(#neon-glow)">
            {[
              { d: "M 500 400 L 500 50", dashOffset: 100 },
              { d: "M 500 400 L 500 750", dashOffset: -100 },
              { d: "M 500 400 L 80 400", dashOffset: 100 },
              { d: "M 500 400 L 920 400", dashOffset: -100 },
            ].map((p, i) => (
              <motion.path key={i} d={p.d} stroke="#00E5FF" strokeWidth="4" fill="none" strokeDasharray="10 10"
                initial={{ strokeDashoffset: p.dashOffset }} animate={{ strokeDashoffset: 0 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }} />
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}
