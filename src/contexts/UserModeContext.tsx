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
import { supabase } from '@/lib/supabase';

export function UserModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<UserMode>("pro");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadMode() {
      // Coba ambil dari localStorage dulu agar UI cepat (optimistic UI)
      const storedMode = localStorage.getItem("agri_user_mode") as UserMode;
      if (storedMode) setModeState(storedMode);

      // Sinkronisasi dari Supabase
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('user_mode')
            .eq('id', user.id)
            .single();
          
          if (!error && data && data.user_mode) {
            const serverMode = data.user_mode as UserMode;
            if (serverMode !== storedMode) {
              setModeState(serverMode);
              localStorage.setItem("agri_user_mode", serverMode);
            }
          }
        }
      } catch (e) {
        console.error("Failed to load user mode from Supabase", e);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadMode();
  }, []);

  const setMode = async (newMode: UserMode) => {
    // Optimistic UI update
    setModeState(newMode);
    localStorage.setItem("agri_user_mode", newMode);
    
    // Update ke database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ user_mode: newMode })
          .eq('id', user.id);
      }
    } catch (e) {
      console.error("Failed to update user mode to Supabase", e);
    }
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
