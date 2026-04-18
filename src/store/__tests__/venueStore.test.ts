import { useVenueStore } from '../venueStore';

describe('venueStore', () => {
  const initialState = { ...useVenueStore.getState() };

  beforeEach(() => {
    // Reset state before each test
    useVenueStore.setState(initialState);
  });

  it('calculates correct initial gate status', () => {
    const { gates } = useVenueStore.getState();
    const gateA = gates.find((g) => g.id === 'A');
    expect(gateA?.status).toBe('busy'); // 72%
    
    const gateB = gates.find((g) => g.id === 'B');
    expect(gateB?.status).toBe('clear'); // 38%
  });

  it('should update gate capacity and re-calculate status correctly (edge cases)', () => {
    useVenueStore.getState().updateGate('A', { capacity_pct: 95 });
    let state = useVenueStore.getState();
    expect(state.gates.find(g => g.id === 'A')?.status).toBe('critical');

    useVenueStore.getState().updateGate('B', { capacity_pct: 45 });
    state = useVenueStore.getState();
    expect(state.gates.find(g => g.id === 'B')?.status).toBe('moderate');

    useVenueStore.getState().updateGate('D', { capacity_pct: 12 });
    state = useVenueStore.getState();
    expect(state.gates.find(g => g.id === 'D')?.status).toBe('clear');
  });

  it('drifts gate capacities correctly keeping boundaries intact', () => {
    // Manually force one gate to edge condition
    useVenueStore.getState().updateGate('A', { capacity_pct: 11 }); // Low boundary
    useVenueStore.getState().updateGate('B', { capacity_pct: 94 }); // High boundary
    
    // Trigger drift
    useVenueStore.getState().driftGates();
    const state = useVenueStore.getState();
    
    const gateA = state.gates.find(g => g.id === 'A');
    const gateB = state.gates.find(g => g.id === 'B');
    
    // Assert boundaries
    expect(gateA?.capacity_pct).toBeGreaterThanOrEqual(10);
    expect(gateB?.capacity_pct).toBeLessThanOrEqual(95);
  });

  it('auto-reassigns a user when their assigned gate hits critical mass during drift', () => {
    // Current user is assigned to Gate B. Let's make Gate B critical.
    useVenueStore.getState().updateGate('B', { capacity_pct: 85 });
    useVenueStore.getState().updateGate('A', { capacity_pct: 20 }); // make sure D/A are clear
    
    useVenueStore.getState().driftGates();
    
    const state = useVenueStore.getState();
    
    expect(state.notification).not.toBeNull();
    expect(state.notification?.type).toBe('reassignment');
    expect(state.notification?.fromGate).toBe('B');
    // They should be moved to the best gate, which is now gate D or A
    expect(state.currentUser.assignedGate).not.toBe('B');
  });

  it('clears notification state properly', () => {
    useVenueStore.getState().reassignUser('C', {
      type: 'reassignment',
      fromGate: 'B',
      toGate: 'C',
      reason: 'Testing clearance',
      savedMinutes: 5,
    });
    
    expect(useVenueStore.getState().notification).not.toBeNull();
    
    useVenueStore.getState().clearNotification();
    
    expect(useVenueStore.getState().notification).toBeNull();
  });
});
