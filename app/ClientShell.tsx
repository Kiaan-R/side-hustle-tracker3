"use client";

// ─────────────────────────────────────────────────────────────────────────────
// app/ClientShell.tsx
// Wraps the entire app in the StoreProvider and mounts the Navbar + modals.
// This keeps layout.tsx a pure Server Component.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { StoreProvider } from "@/lib/store";
import Navbar           from "@/components/Navbar";
import AddHustleModal   from "@/components/AddHustleModal";
import LogSessionModal  from "@/components/LogSessionModal";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [showAdd, setShowAdd] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [logHustleId, setLogHustleId] = useState<string | undefined>(undefined);

  function openLog(id?: string) {
    setLogHustleId(id);
    setShowLog(true);
  }

  // Expose openLog globally so child pages can trigger it
  if (typeof window !== "undefined") {
    // @ts-ignore
    window.__hustleiq_openLog = openLog;
    // @ts-ignore
    window.__hustleiq_openAdd = () => setShowAdd(true);
  }

  return (
    <StoreProvider>
      <Navbar
        onAddHustle={() => setShowAdd(true)}
        onLogSession={() => openLog(undefined)}
      />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>

      {showAdd && <AddHustleModal onClose={() => setShowAdd(false)} />}
      {showLog && (
        <LogSessionModal
          defaultHustleId={logHustleId}
          onClose={() => { setShowLog(false); setLogHustleId(undefined); }}
        />
      )}
    </StoreProvider>
  );
}
