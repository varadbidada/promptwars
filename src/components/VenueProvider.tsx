"use client";
import { useEffect } from "react";
import { useVenueStore } from "@/store/venueStore";

export function VenueProvider({ children }: { children: React.ReactNode }) {
  const driftGates = useVenueStore(s => s.driftGates);
  const gates = useVenueStore(s => s.gates);
  const simulateCongestion = useVenueStore(s => s.simulateCongestion);
  const currentUser = useVenueStore(s => s.currentUser);

  // Drift every 4s
  useEffect(() => {
    const interval = setInterval(() => {
      driftGates();
    }, 4000);
    return () => clearInterval(interval);
  }, [driftGates]);

  // Random surge every 30s on non-user gate
  useEffect(() => {
    const interval = setInterval(() => {
      const nonUserGates = gates.filter(g => g.id !== currentUser.assignedGate && g.status !== 'critical');
      if (nonUserGates.length > 0) {
        const pick = nonUserGates[Math.floor((Date.now() / 1000) % nonUserGates.length)];
        simulateCongestion(pick.id);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [gates, currentUser.assignedGate, simulateCongestion]);

  return <>{children}</>;
}
