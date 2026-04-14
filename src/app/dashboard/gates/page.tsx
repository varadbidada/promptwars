"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { useVenueStore } from "@/store/venueStore";
import { VenueProvider } from "@/components/VenueProvider";
import { GateCard } from "@/components/gates/GateCard";
import { StatusChip } from "@/components/gates/StatusChip";
import { LiveDot } from "@/components/gates/LiveDot";
import { Zap, BarChart2, Clock, AlertTriangle, Users } from "lucide-react";
import { StadiumGateViz } from "@/components/gates/StadiumGateViz";

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(value, { stiffness: 80, damping: 20 });
  const display = useTransform(spring, v => Math.round(v).toLocaleString());
  useEffect(() => { spring.set(value); }, [value, spring]);
  return <motion.span>{display}</motion.span>;
}

function GatesDashboard() {
  const gates = useVenueStore(s => s.gates);
  const activityFeed = useVenueStore(s => s.activityFeed);
  const simulateCongestion = useVenueStore(s => s.simulateCongestion);
  const isSimulating = useVenueStore(s => s.isSimulating);
  const addActivity = useVenueStore(s => s.addActivity);

  const [simulatingGate, setSimulatingGate] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState("");
  const [redistributionApplied, setRedistributionApplied] = useState(false);
  const [redistributionLoading, setRedistributionLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setLastUpdated(new Date().toLocaleTimeString("en-US", { hour12: false }));
    update();
    const t = setInterval(update, 4000);
    return () => clearInterval(t);
  }, []);

  const totalEntered = gates.reduce((s, g) => s + (g.assigned_users ?? 0), 0);
  const avgWait = Math.round(gates.reduce((s, g) => s + g.wait_min, 0) / gates.length);
  const mostCongested = [...gates].sort((a, b) => b.capacity_pct - a.capacity_pct)[0];
  const atRisk = gates.filter(g => g.capacity_pct >= 65).length;

  // AI suggestion: move from most congested to least congested
  const sorted = [...gates].sort((a, b) => b.capacity_pct - a.capacity_pct);
  const aiFrom = sorted[0];
  const aiTo = sorted[sorted.length - 1];
  const aiSave = aiFrom.wait_min - aiTo.wait_min;

  const handleSimGate = (id: string) => {
    setSimulatingGate(id);
    simulateCongestion(id);
    setTimeout(() => setSimulatingGate(null), 3500);
  };

  const handleRedistribute = () => {
    setRedistributionLoading(true);
    setTimeout(() => {
      setRedistributionLoading(false);
      setRedistributionApplied(true);
      addActivity({ message: `Smart redistribution: 340 users moved from Gate ${aiFrom.id} → Gate ${aiTo.id}`, type: "reassign" });
      setToast(`340 users redistributed from Gate ${aiFrom.id} to Gate ${aiTo.id}`);
      setTimeout(() => setToast(null), 4000);
    }, 1200);
  };

  const kpis = [
    { label: "Total assigned", value: totalEntered, icon: Users, color: "text-[#00E5FF]" },
    { label: "Avg wait time", value: avgWait, suffix: " min", icon: Clock, color: "text-[#FFB830]" },
    { label: "Most congested", value: mostCongested.capacity_pct, suffix: "% – " + mostCongested.name, icon: BarChart2, color: "text-red-400", noAnim: true },
    { label: "Gates at risk", value: atRisk, icon: AlertTriangle, color: atRisk > 0 ? "text-red-400" : "text-[#00F0A0]" },
  ];

  return (
    <div className="min-h-screen bg-[#04060C] text-white">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#00F0A0] text-[#080C1A] px-6 py-3 rounded-2xl shadow-2xl font-bold font-mono text-sm">
            ✓ {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-heading font-black text-white tracking-tight">Gate Control Center</h1>
            <p className="text-gray-500 text-xs font-mono mt-1 uppercase tracking-widest">Last updated: {lastUpdated}</p>
          </div>
          <LiveDot label="LIVE · All systems nominal" />
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <div key={i} className="bg-[#0D1220] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-xs font-mono uppercase tracking-widest">{kpi.label}</span>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <p className={`text-3xl font-heading font-black ${kpi.color} tabular-nums`}>
                {kpi.noAnim ? (
                  <>{kpi.value}{kpi.suffix}</>
                ) : (
                  <><AnimatedNumber value={kpi.value} />{kpi.suffix}</>
                )}
              </p>
            </div>
          ))}
        </div>

        {/* Stadium live visualization */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-heading font-bold">Live Stadium Entry Flow</h2>
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest border border-white/8 rounded-full px-3 py-1">Particle simulation · gates A B C D</span>
          </div>
          <StadiumGateViz />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Gate cards 2x2 */}
          <div className="xl:col-span-2 space-y-6">
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...gates]
                .sort((a, b) => b.capacity_pct - a.capacity_pct)
                .map(gate => (
                  <GateCard
                    key={gate.id}
                    gate={gate}
                    onSimulate={() => handleSimGate(gate.id)}
                    isSimulating={simulatingGate === gate.id || isSimulating}
                  />
                ))}
            </motion.div>

            {/* Smart redistribution panel */}
            <div className="bg-[#0D1220] border border-[#00E5FF]/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-[#00E5FF]" />
                <h3 className="text-white font-heading font-bold">Smart Redistribution</h3>
                <span className="text-[9px] font-mono uppercase tracking-widest bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 px-2 py-0.5 rounded-full">AI Suggestion</span>
              </div>

              <div className="flex items-center gap-3 mb-5 p-4 bg-white/3 rounded-xl border border-white/5">
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">
                    Move <span className="text-[#00E5FF] font-bold">340 users</span> from <span className="text-red-400">{aiFrom.name}</span> to <span className="text-[#00F0A0]">{aiTo.name}</span>
                  </p>
                  <p className="text-gray-500 text-xs font-mono mt-1">Estimated saving: ~{Math.max(1, aiSave)} min per user · reduces peak load by 18%</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusChip status={aiFrom.status} />
                  <span className="text-[9px] text-gray-600 font-mono">→</span>
                  <StatusChip status={aiTo.status} />
                </div>
              </div>

              <button
                onClick={handleRedistribute}
                disabled={redistributionLoading || redistributionApplied}
                className={`w-full py-3.5 rounded-xl font-mono font-bold text-sm uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2
                  ${redistributionApplied ? 'bg-[#00F0A0]/20 text-[#00F0A0] border border-[#00F0A0]/30' : 'bg-[#00E5FF] text-[#080C1A]'}
                  disabled:opacity-60`}
              >
                {redistributionLoading ? (
                  <><div className="w-4 h-4 border-2 border-[#080C1A] border-t-transparent rounded-full animate-spin" />Applying...</>
                ) : redistributionApplied ? (
                  <>✓ Redistribution Applied</>
                ) : (
                  <>Apply suggestion</>
                )}
              </button>
            </div>
          </div>

          {/* Live activity feed */}
          <div className="bg-[#0D1220] border border-white/5 rounded-2xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4">
              <h3 className="text-white font-heading font-bold">Live Activity</h3>
              <LiveDot />
            </div>
            <div className="flex-1 overflow-hidden space-y-2">
              <AnimatePresence mode="popLayout">
                {activityFeed.map(event => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    layout
                    className={`p-3 rounded-xl border text-xs font-mono ${
                      event.type === 'reassign' ? 'border-[#A78BFA]/20 bg-[#A78BFA]/5 text-[#A78BFA]' :
                      event.type === 'surge' ? 'border-red-500/20 bg-red-500/5 text-red-400' :
                      'border-white/5 bg-white/2 text-gray-500'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="leading-snug">{event.message}</span>
                      <span className="text-gray-600 shrink-0 text-[9px]">
                        {event.time.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GatesDashboardPage() {
  return (
    <VenueProvider>
      <GatesDashboard />
    </VenueProvider>
  );
}
