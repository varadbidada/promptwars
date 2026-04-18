import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VenueProvider } from '../VenueProvider';

const mockDriftGates = jest.fn();
const mockSimulateCongestion = jest.fn();

jest.mock('@/store/venueStore', () => ({
  useVenueStore: (selector: any) => {
    const mockStore = {
      driftGates: mockDriftGates,
      simulateCongestion: mockSimulateCongestion,
      gates: [
        { id: 'North', status: 'optimal' },
        { id: 'South', status: 'warning' },
        { id: 'East', status: 'optimal' }
      ],
      currentUser: { assignedGate: 'North' },
    };
    return selector(mockStore);
  },
}));

describe('VenueProvider Integration', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders its children without crashing', () => {
    const { getByText } = render(
      <VenueProvider>
        <div>Test Child Application</div>
      </VenueProvider>
    );

    expect(getByText('Test Child Application')).toBeInTheDocument();
  });

  it('calls driftGates periodically every 4 seconds', () => {
    render(
      <VenueProvider>
        <div>App</div>
      </VenueProvider>
    );

    expect(mockDriftGates).not.toHaveBeenCalled();

    jest.advanceTimersByTime(4000);
    expect(mockDriftGates).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(4000);
    expect(mockDriftGates).toHaveBeenCalledTimes(2);
  });

  it('calls simulateCongestion periodically on non-user gates every 30 seconds', () => {
    render(
      <VenueProvider>
        <div>App</div>
      </VenueProvider>
    );

    expect(mockSimulateCongestion).not.toHaveBeenCalled();

    // Advance 30s
    jest.advanceTimersByTime(30000);

    // It should simulate congestion on a gate other than 'North'
    expect(mockSimulateCongestion).toHaveBeenCalledTimes(1);
    expect(mockSimulateCongestion).not.toHaveBeenCalledWith('North');
  });
});
