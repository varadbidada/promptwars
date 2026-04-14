"use client";
export function LiveDot({ label = "LIVE" }: { label?: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
      </span>
      <span className="text-[10px] font-mono font-bold text-red-400 tracking-widest uppercase">{label}</span>
    </span>
  );
}
