"use client";
import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

interface GateBarProps {
  pct: number;
  height?: string;
  showLabel?: boolean;
}

const getColor = (pct: number) => {
  if (pct < 40) return { bar: "#00F0A0", glow: "rgba(0,240,160,0.4)" };
  if (pct < 60) return { bar: "#FFB830", glow: "rgba(255,184,48,0.4)" };
  if (pct < 80) return { bar: "#F97316", glow: "rgba(249,115,22,0.3)" };
  return { bar: "#EF4444", glow: "rgba(239,68,68,0.5)" };
};

export function GateBar({ pct, height = "h-2", showLabel = false }: GateBarProps) {
  const spring = useSpring(0, { stiffness: 60, damping: 18 });
  const width = useTransform(spring, v => `${v}%`);
  const { bar, glow } = getColor(pct);

  useEffect(() => {
    spring.set(Math.min(100, Math.max(0, pct)));
  }, [pct, spring]);

  return (
    <div className={`w-full bg-white/5 rounded-full overflow-hidden ${height} relative`}>
      <motion.div
        style={{ width, backgroundColor: bar, boxShadow: `0 0 8px ${glow}` }}
        className="h-full rounded-full transition-colors duration-700"
      />
      {showLabel && (
        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-mono text-white/60">{pct}%</span>
      )}
    </div>
  );
}
