"use client";

// ─────────────────────────────────────────────────────────────────────────────
// lib/store.tsx  –  App-wide state backed by localStorage
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { uid, computeAllStats } from "./calculations";
import type { Hustle, Session, HustleStats } from "./calculations";

interface StoreState {
  hustles:  Hustle[];
  sessions: Session[];
  stats:    HustleStats[];
}

interface StoreActions {
  addHustle:    (h: Omit<Hustle, "id" | "createdAt">) => void;
  removeHustle: (id: string) => void;
  addSession:   (s: Omit<Session, "id">) => void;
}

type StoreCtx = StoreState & StoreActions;

const Ctx = createContext<StoreCtx | null>(null);

const STORAGE_KEY = "hustleiq_v1";

function load(): { hustles: Hustle[]; sessions: Session[] } {
  if (typeof window === "undefined") return { hustles: [], sessions: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { hustles: [], sessions: [] };
    return JSON.parse(raw);
  } catch {
    return { hustles: [], sessions: [] };
  }
}

function save(hustles: Hustle[], sessions: Session[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ hustles, sessions }));
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [hustles,  setHustles]  = useState<Hustle[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount (client only)
  useEffect(() => {
    const { hustles: h, sessions: s } = load();
    setHustles(h);
    setSessions(s);
    setHydrated(true);
  }, []);

  // Persist whenever data changes (after hydration)
  useEffect(() => {
    if (hydrated) save(hustles, sessions);
  }, [hustles, sessions, hydrated]);

  const stats = computeAllStats(hustles, sessions);

  const addHustle = useCallback((h: Omit<Hustle, "id" | "createdAt">) => {
    setHustles((prev) => [
      ...prev,
      { ...h, id: uid(), createdAt: new Date().toISOString() },
    ]);
  }, []);

  const removeHustle = useCallback((id: string) => {
    setHustles((prev) => prev.filter((h) => h.id !== id));
    setSessions((prev) => prev.filter((s) => s.hustleId !== id));
  }, []);

  const addSession = useCallback((s: Omit<Session, "id">) => {
    setSessions((prev) => [...prev, { ...s, id: uid() }]);
  }, []);

  return (
    <Ctx.Provider
      value={{ hustles, sessions, stats, addHustle, removeHustle, addSession }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
