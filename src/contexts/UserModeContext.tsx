"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type UserMode = "pro" | "garden";

interface UserModeContextType {
  mode: UserMode;
  toggleMode: () => void;
  setMode: (mode: UserMode) => void;
}

const UserModeContext = createContext<UserModeContextType | undefined>(undefined);

import { useRouter } from 'next/navigation';

export function UserModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<UserMode>("pro");
  const router = useRouter();

  useEffect(() => {
    // In a real app, you would fetch this from Supabase `profiles` table.
    // For now, we will store it in localStorage for quick testing.
    const storedMode = localStorage.getItem("agri_user_mode") as UserMode;
    if (storedMode) {
      setModeState(storedMode);
    }
  }, []);

  const setMode = (newMode: UserMode) => {
    setModeState(newMode);
    localStorage.setItem("agri_user_mode", newMode);
    // TODO: Also update the `profiles` table via Supabase API
  };

  const toggleMode = () => {
    const newMode = mode === "pro" ? "garden" : "pro";
    setMode(newMode);
    if (newMode === 'garden') {
      router.push('/garden');
    } else {
      router.push('/');
    }
  };

  return (
    <UserModeContext.Provider value={{ mode, toggleMode, setMode }}>
      {children}
    </UserModeContext.Provider>
  );
}

export function useUserMode() {
  const context = useContext(UserModeContext);
  if (context === undefined) {
    throw new Error("useUserMode must be used within a UserModeProvider");
  }
  return context;
}
