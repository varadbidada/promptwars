import { create } from 'zustand';

export type GateStatus = 'clear' | 'moderate' | 'busy' | 'critical';

export interface Gate {
  id: string;
  name: string;
  direction: string;
  capacity_pct: number;
  wait_min: number;
  status: GateStatus;
  assigned_users?: number;
}

export interface CurrentUser {
  name: string;
  ticket: string;
  section: string;
  row: number;
  seat: number;
  assignedGate: string;
}

export interface Notification {
  type: 'reassignment';
  fromGate: string;
  toGate: string;
  reason: string;
  savedMinutes: number;
}

export interface ActivityEvent {
  id: number;
  message: string;
  time: Date;
  type: 'reassign' | 'surge' | 'info';
}

interface VenueStore {
  gates: Gate[];
  currentUser: CurrentUser;
  notification: Notification | null;
  activityFeed: ActivityEvent[];
  isSimulating: boolean;

  updateGate: (id: string, patch: Partial<Gate>) => void;
  reassignUser: (newGateId: string, notification: Notification) => void;
  clearNotification: () => void;
  simulateCongestion: (gateId: string) => void;
  addActivity: (event: Omit<ActivityEvent, 'id' | 'time'>) => void;
  driftGates: () => void;
}

const calcStatus = (pct: number): GateStatus => {
  if (pct < 40) return 'clear';
  if (pct < 60) return 'moderate';
  if (pct < 80) return 'busy';
  return 'critical';
};

const INITIAL_GATES: Gate[] = [
  { id: 'A', name: 'Gate A', direction: 'South', capacity_pct: 72, wait_min: 9,  status: 'busy',     assigned_users: 1240 },
  { id: 'B', name: 'Gate B', direction: 'North', capacity_pct: 38, wait_min: 4,  status: 'clear',    assigned_users: 860  },
  { id: 'C', name: 'Gate C', direction: 'West',  capacity_pct: 55, wait_min: 7,  status: 'moderate', assigned_users: 1020 },
  { id: 'D', name: 'Gate D', direction: 'East',  capacity_pct: 22, wait_min: 2,  status: 'clear',    assigned_users: 440  },
];

let activityCounter = 0;

export const useVenueStore = create<VenueStore>((set, get) => ({
  gates: INITIAL_GATES,
  currentUser: {
    name: 'Arjun Mehta',
    ticket: 'TKT-8842',
    section: 'C',
    row: 14,
    seat: 7,
    assignedGate: 'B',
  },
  notification: null,
  activityFeed: [
    { id: ++activityCounter, message: 'Gate B capacity at 38% — clear', time: new Date(), type: 'info' },
    { id: ++activityCounter, message: 'Gate A reached 72%', time: new Date(), type: 'surge' },
  ],
  isSimulating: false,

  addActivity: (event) => {
    set(state => ({
      activityFeed: [
        { ...event, id: ++activityCounter, time: new Date() },
        ...state.activityFeed.slice(0, 7),
      ],
    }));
  },

  updateGate: (id, patch) => {
    set(state => ({
      gates: state.gates.map(g =>
        g.id === id ? { ...g, ...patch, status: patch.capacity_pct !== undefined ? calcStatus(patch.capacity_pct) : g.status } : g
      ),
    }));
  },

  reassignUser: (newGateId, notification) => {
    set(state => ({
      currentUser: { ...state.currentUser, assignedGate: newGateId },
      notification,
    }));
    get().addActivity({
      message: `User reassigned Gate ${notification.fromGate} → Gate ${notification.toGate}`,
      type: 'reassign',
    });
  },

  clearNotification: () => set({ notification: null }),

  simulateCongestion: (gateId) => {
    const { gates, currentUser } = get();
    const spikedPct = 85 + Math.floor(((gateId.charCodeAt(0) * 7) % 8));

    // Spike gate over ~2s in steps
    set({ isSimulating: true });
    
    const step = (pct: number, remaining: number) => {
      get().updateGate(gateId, { capacity_pct: Math.min(pct, 95), wait_min: Math.round(pct / 9) });
      get().addActivity({ message: `Gate ${gateId} surging — ${Math.min(pct, 95)}%`, type: 'surge' });

      if (remaining > 0) {
        setTimeout(() => step(pct + 4, remaining - 1), 400);
      } else {
        // Auto reassign if this is user's gate
        if (currentUser.assignedGate === gateId) {
          const best = [...gates]
            .filter(g => g.id !== gateId)
            .sort((a, b) => a.capacity_pct - b.capacity_pct)[0];

          get().reassignUser(best.id, {
            type: 'reassignment',
            fromGate: gateId,
            toGate: best.id,
            reason: `Gate ${gateId} reached critical congestion`,
            savedMinutes: Math.max(2, get().gates.find(g => g.id === gateId)!.wait_min - best.wait_min),
          });
        }
        set({ isSimulating: false });
      }
    };

    const current = gates.find(g => g.id === gateId)?.capacity_pct ?? 50;
    step(current + 6, Math.ceil((spikedPct - current) / 6));
  },

  driftGates: () => {
    set(state => ({
      gates: state.gates.map(g => {
        const drift = ((g.id.charCodeAt(0) + Date.now()) % 5) - 2; // deterministic-ish per gate
        const newPct = Math.min(95, Math.max(10, g.capacity_pct + drift));
        return {
          ...g,
          capacity_pct: newPct,
          wait_min: Math.max(1, Math.round(newPct / 9)),
          status: calcStatus(newPct),
        };
      }),
    }));

    // Auto-reassign if user's gate goes critical during drift
    const { gates, currentUser, notification } = get();
    const userGate = gates.find(g => g.id === currentUser.assignedGate);
    if (userGate && userGate.capacity_pct > 80 && !notification) {
      const best = [...gates]
        .filter(g => g.id !== currentUser.assignedGate)
        .sort((a, b) => a.capacity_pct - b.capacity_pct)[0];

      get().reassignUser(best.id, {
        type: 'reassignment',
        fromGate: currentUser.assignedGate,
        toGate: best.id,
        reason: 'Auto-detected high congestion at your gate',
        savedMinutes: Math.max(1, userGate.wait_min - best.wait_min),
      });
    }
  },
}));
