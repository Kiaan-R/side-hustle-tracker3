"use client";

// ─────────────────────────────────────────────────────────────────────────────
// components/LogSessionModal.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useStore } from "@/lib/store";

interface Props {
  defaultHustleId?: string;
  onClose: () => void;
}

export default function LogSessionModal({ defaultHustleId, onClose }: Props) {
  const { hustles, addSession } = useStore();
  const overlayRef = useRef<HTMLDivElement>(null);

  const [hustleId, setHustleId] = useState(
    defaultHustleId ?? (hustles[0]?.id ?? "")
  );
  const [date,   setDate]   = useState(new Date().toISOString().split("T")[0]);
  const [hours,  setHours]  = useState("");
  const [income, setIncome] = useState("");
  const [notes,  setNotes]  = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const parsedHours  = parseFloat(hours);
  const parsedIncome = parseFloat(income);
  const dph =
    parsedHours > 0 && parsedIncome > 0
      ? parsedIncome / parsedHours
      : null;
  const canSubmit =
    hustleId !== "" && date !== "" && parsedHours > 0 && parsedIncome > 0;

  const selectedHustle = hustles.find((h) => h.id === hustleId);

  function handleSubmit() {
    if (!canSubmit || !selectedHustle) return;
    addSession({
      hustleId,
      date,
      hours:  parsedHours,
      income: parsedIncome,
      notes:  notes.trim() || undefined,
    });
    onClose();
  }

  if (hustles.length === 0) {
    return (
      <div
        ref={overlayRef}
        onClick={(e) => e.target === overlayRef.current && onClose()}
        className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/40 p-4 backdrop-blur-sm"
      >
        <div className="animate-slide-up w-full max-w-sm rounded-3xl bg-white p-8 shadow-modal text-center">
          <p className="mb-3 text-5xl">💼</p>
          <p className="font-display text-lg font-bold text-brand-900 mb-2">No hustles yet</p>
          <p className="text-sm text-slate-500 mb-5">
            Add at least one hustle before logging a session.
          </p>
          <button onClick={onClose} className="hiq-btn w-full">Got it</button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/40 p-4 backdrop-blur-sm"
    >
      <div className="animate-slide-up w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-modal">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-bold text-brand-900">Log a Session</h2>
            <p className="text-xs text-slate-400">Record hours worked and income earned</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={17} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {/* Live DPH preview */}
          <div className="flex items-center justify-between rounded-2xl bg-brand-50 px-5 py-3.5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-brand-400">
              $/hr this session
            </p>
            <p
              className="font-display text-2xl font-extrabold text-brand-900 transition-all"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {dph ? `$${dph.toFixed(2)}` : "—"}
            </p>
          </div>

          {/* Hustle selector */}
          <div>
            <label className="hiq-label">Which hustle?</label>
            <div className="grid grid-cols-2 gap-2">
              {hustles.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setHustleId(h.id)}
                  className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
                    hustleId === h.id
                      ? "border-brand-500 bg-brand-50"
                      : "border-slate-200 bg-white hover:border-brand-200"
                  }`}
                >
                  <span className="text-xl">{h.emoji}</span>
                  <div>
                    <p className="text-xs font-semibold leading-tight text-brand-900">
                      {h.name}
                    </p>
                    <p className="text-[10px] text-slate-400">{h.category}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="hiq-label">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="hiq-input"
            />
          </div>

          {/* Hours + Income */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="hiq-label">Hours Worked</label>
              <input
                type="number"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="e.g. 3.5"
                className="hiq-input"
                min="0.25"
                step="0.25"
              />
            </div>
            <div>
              <label className="hiq-label">Income Earned ($)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm text-slate-400">$</span>
                <input
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  placeholder="e.g. 75"
                  className="hiq-input pl-7"
                  min="0"
                  step="1"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="hiq-label">
              Notes{" "}
              <span className="normal-case font-normal text-slate-400">
                (optional)
              </span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any context about this session…"
              rows={2}
              className="hiq-input resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="hiq-btn w-full py-3"
          >
            Log Session{dph ? ` · $${dph.toFixed(2)}/hr` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
