"use client";
import type { GateStatus } from "@/store/venueStore";

const CONFIG: Record<GateStatus, { label: string; classes: string }> = {
  clear:    { label: "CLEAR",    classes: "bg-[#00F0A0]/15 text-[#00F0A0] border border-[#00F0A0]/40" },
  moderate: { label: "MODERATE", classes: "bg-[#FFB830]/15 text-[#FFB830] border border-[#FFB830]/40" },
  busy:     { label: "BUSY",     classes: "bg-[#F97316]/15 text-[#F97316] border border-[#F97316]/40" },
  critical: { label: "CRITICAL", classes: "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40 animate-pulse" },
};

export function StatusChip({ status }: { status: GateStatus }) {
  const { label, classes } = CONFIG[status];
  return (
    <span className={`text-[9px] font-black font-mono tracking-widest uppercase px-2 py-0.5 rounded-full ${classes}`}>
      {label}
    </span>
  );
}
