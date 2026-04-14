"use client";
import { motion } from "framer-motion";
import { GateBar } from "./GateBar";
import { StatusChip } from "./StatusChip";
import type { Gate } from "@/store/venueStore";

interface GateCardProps {
  gate: Gate;
  isMyGate?: boolean;
  onSimulate?: () => void;
  isSimulating?: boolean;
}

export function GateCard({ gate, isMyGate = false, onSimulate, isSimulating }: GateCardProps) {
  const isCritical = gate.status === "critical";

  return (
    <motion.div
      layout
      className={`relative rounded-2xl border p-5 transition-colors duration-500 ${
        isMyGate
          ? "border-[#00E5FF]/40 bg-[#00E5FF]/5 shadow-[0_0_20px_rgba(0,229,255,0.1)]"
          : isCritical
          ? "border-red-500/50 bg-red-500/5"
          : "border-white/8 bg-white/3"
      } overflow-hidden`}
    >
      {/* Pulsing border for critical */}
      {isCritical && (
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-red-500/60 pointer-events-none"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}

      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-white font-heading font-bold text-lg">{gate.name}</h3>
            {isMyGate && (
              <span className="text-[9px] font-black font-mono tracking-widest uppercase px-2 py-0.5 rounded-full bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40">
                YOUR GATE
              </span>
            )}
          </div>
          <p className="text-gray-500 text-xs font-mono">{gate.direction} entrance · {gate.assigned_users?.toLocaleString() ?? "—"} users</p>
        </div>
        <StatusChip status={gate.status} />
      </div>

      {/* Animated capacity number */}
      <div className="mb-2 flex items-end justify-between">
        <motion.span
          key={gate.capacity_pct}
          initial={{ opacity: 0.5, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-heading font-black text-white tabular-nums"
        >
          {gate.capacity_pct}
          <span className="text-sm font-normal text-gray-500 ml-1">%</span>
        </motion.span>
        <span className="text-gray-400 text-xs font-mono">{gate.wait_min} min wait</span>
      </div>

      <GateBar pct={gate.capacity_pct} height="h-3" />

      {onSimulate && (
        <button
          onClick={onSimulate}
          disabled={isSimulating}
          className="mt-4 w-full py-2.5 rounded-xl border border-white/10 text-xs font-mono font-bold uppercase tracking-widest 
            text-gray-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed
            flex items-center justify-center gap-2"
        >
          {isSimulating ? (
            <>
              <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Simulating...
            </>
          ) : (
            "⚡ Simulate Congestion"
          )}
        </button>
      )}
    </motion.div>
  );
}
