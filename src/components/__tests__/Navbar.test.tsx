import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from '../Navbar';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// Mock the Zustand store
jest.mock('@/store/venueStore', () => ({
  useVenueStore: (selector: any) => {
    const mockStore = {
      simulateCongestion: jest.fn(),
      driftGates: jest.fn(),
      addActivity: jest.fn(),
      gates: [{ id: 'North', capacity_pct: 50 }, { id: 'South', capacity_pct: 60 }],
    };
    return selector(mockStore);
  },
}));

describe('Navbar Component', () => {
  it('renders the branding logo correctly', () => {
    render(<Navbar />);
    expect(screen.getByText(/Flow/)).toBeInTheDocument();
  });

  it('toggles the simulator panel on button click', () => {
    render(<Navbar />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const toggleButton = screen.getByText('SCENARIO SIM');
    fireEvent.click(toggleButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Match Day Scenario Simulator')).toBeInTheDocument();
  });

  it('disables the start simulation button when no scenarios are selected', () => {
    render(<Navbar />);
    fireEvent.click(screen.getByText('SCENARIO SIM'));
    
    // Default disabled button
    const startButton = screen.getByRole('button', { name: /Start Simulation/i });
    expect(startButton).toBeDisabled();
  });

  it('enables the start simulation button when a scenario is selected', () => {
    render(<Navbar />);
    fireEvent.click(screen.getByText('SCENARIO SIM'));
    
    // Select first scenario
    const firstScenario = screen.getByText('Gate Congestion Surge');
    fireEvent.click(firstScenario);

    const startButton = screen.getByRole('button', { name: /Start Simulation/i });
    expect(startButton).toBeEnabled();
  });
});
