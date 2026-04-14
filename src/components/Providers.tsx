"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface DemoContextType {
  isDemoMode: boolean;
  setDemoMode: (val: boolean) => void;
}

const DemoContext = createContext<DemoContextType>({
  isDemoMode: false,
  setDemoMode: () => {},
});

export function useDemo() {
  return useContext(DemoContext);
}

export function Providers({ children }: { children: ReactNode }) {
  const [isDemoMode, setDemoMode] = useState(false);
  return (
    <DemoContext.Provider value={{ isDemoMode, setDemoMode }}>
      {children}
    </DemoContext.Provider>
  );
}
