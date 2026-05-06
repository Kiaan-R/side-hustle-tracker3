"use client";

// ─────────────────────────────────────────────────────────────────────────────
// components/AddHustleModal.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { useStore } from "@/lib/store";
import {
  HUSTLE_PRESETS,
  CATEGORIES,
  CARD_COLORS,
} from "@/lib/calculations";
import type { Category, HustlePreset } from "@/lib/calculations";

interface Props {
  onClose: () => void;
}

type ActiveTab = "presets" | "custom";

export default function AddHustleModal({ onClose }: Props) {
  const { addHustle, hustles } = useStore();
  const [tab, setTab] = useState<ActiveTab>("presets");
  const overlayRef    = useRef<HTMLDivElement>(null);

  // lock scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // close on overlay click
  function handleOverlay(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  function handlePreset(p: HustlePreset) {
    addHustle({
      name:        p.name,
      category:    p.category,
      emoji:       p.emoji,
      color:       p.color,
      skillRating: p.skillRating,
    });
    onClose();
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlay}
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/40 p-4 backdrop-blur-sm"
    >
      <div className="animate-slide-up w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-modal">
        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-bold text-brand-900">Add a Hustle</h2>
            <p className="text-xs text-slate-400">Pick a template or build your own</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={17} />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1.5 bg-slate-50 px-6 pt-4 pb-0">
          {(["presets", "custom"] as ActiveTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-t-xl py-2.5 text-sm font-semibold transition-all ${
                tab === t
                  ? "bg-white text-brand-900 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {t === "presets" ? "⚡ Quick Templates" : "✏️ Custom"}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="max-h-[70vh] overflow-y-auto px-6 pb-6 pt-5">
          {tab === "presets" ? (
            <PresetsTab presets={HUSTLE_PRESETS} onSelect={handlePreset} />
          ) : (
            <CustomTab
              colorCount={hustles.length}
              onSubmit={(h) => { addHustle(h); onClose(); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Presets Tab ───────────────────────────────────────────────────────────────

function PresetsTab({
  presets,
  onSelect,
}: {
  presets: HustlePreset[];
  onSelect: (p: HustlePreset) => void;
}) {
  const teens  = presets.filter((p) => p.audience === "teen");
  const adults = presets.filter((p) => p.audience === "adult");

  return (
    <div className="space-y-5">
      <SectionHead emoji="🧑‍🎓" label="Popular for Teens" />
      {teens.map((p) => (
        <PresetRow key={p.name} preset={p} onSelect={onSelect} />
      ))}

      <SectionHead emoji="💼" label="Popular for Adults" />
      {adults.map((p) => (
        <PresetRow key={p.name} preset={p} onSelect={onSelect} />
      ))}

      <p className="text-center text-xs text-slate-400 pt-1">
        Want full control?{" "}
        <span className="font-semibold text-brand-600">Switch to Custom →</span>
      </p>
    </div>
  );
}

function SectionHead({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-base">{emoji}</span>
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
        {label}
      </span>
    </div>
  );
}

function PresetRow({
  preset,
  onSelect,
}: {
  preset: HustlePreset;
  onSelect: (p: HustlePreset) => void;
}) {
  return (
    <button
      onClick={() => onSelect(preset)}
      className="group w-full rounded-2xl border border-slate-100 bg-white p-4 text-left transition-all hover:border-brand-200 hover:shadow-card"
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xl"
          style={{ background: `${preset.color}18` }}
        >
          {preset.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-sm text-brand-900">{preset.name}</p>
            <span className="flex-shrink-0 rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold text-brand-600">
              {preset.avgEarnings}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
            {preset.description}
          </p>
        </div>
      </div>
      <p className="mt-2 text-right text-[10px] font-semibold text-brand-400 opacity-0 transition-opacity group-hover:opacity-100">
        Add this hustle →
      </p>
    </button>
  );
}

// ── Custom Tab ────────────────────────────────────────────────────────────────

interface CustomForm {
  name:        string;
  category:    Category;
  emoji:       string;
  rate:        string;
  skillRating: number;
}

function CustomTab({
  colorCount,
  onSubmit,
}: {
  colorCount: number;
  onSubmit: (h: { name: string; category: Category; emoji: string; color: string; skillRating: number }) => void;
}) {
  const [form, setForm] = useState<CustomForm>({
    name:        "",
    category:    "Freelance",
    emoji:       "💼",
    rate:        "",
    skillRating: 3,
  });

  function set<K extends keyof CustomForm>(k: K, v: CustomForm[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  const parsedRate = parseFloat(form.rate);
  const canSubmit  = form.name.trim() !== "" && parsedRate > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({
      name:        form.name.trim(),
      category:    form.category,
      emoji:       form.emoji || "💼",
      color:       CARD_COLORS[colorCount % CARD_COLORS.length],
      skillRating: form.skillRating,
    });
  }

  return (
    <div className="space-y-4">
      {/* Note: DPH is set via session logging, not at creation.
          We store skillRating here and sessions provide income data. */}
      <InfoBox>
        Enter your hustle details. $/hr is calculated automatically once you log
        work sessions. Skill Rating helps weight your Value Score.
      </InfoBox>

      {/* Name + emoji */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Label>Hustle Name</Label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Freelance Writing"
            className="hiq-input"
          />
        </div>
        <div className="w-[72px]">
          <Label>Emoji</Label>
          <input
            value={form.emoji}
            onChange={(e) => set("emoji", e.target.value)}
            className="hiq-input text-center text-xl"
            maxLength={2}
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <Label>Category</Label>
        <div className="relative">
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value as Category)}
            className="hiq-input appearance-none pr-8"
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-3 top-3 text-slate-400"
          />
        </div>
      </div>

      {/* Starting $/hr (optional baseline — sessions will override) */}
      <div>
        <Label>Starting $/hr estimate <span className="font-normal text-slate-400">(used until sessions are logged)</span></Label>
        <div className="relative">
          <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm">$</span>
          <input
            type="number"
            value={form.rate}
            onChange={(e) => set("rate", e.target.value)}
            placeholder="e.g. 25"
            className="hiq-input pl-7"
            min="0"
            step="0.5"
          />
        </div>
      </div>

      {/* Skill Rating */}
      <div>
        <Label>Skill Growth Rating <span className="font-normal text-slate-400">(how much does this build your skills?)</span></Label>
        <div className="flex gap-2 mt-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => set("skillRating", n)}
              className={`flex-1 rounded-xl border py-2 text-sm font-bold transition-all ${
                form.skillRating === n
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-slate-200 bg-white text-slate-400 hover:border-brand-300"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-slate-400 px-0.5">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="hiq-btn w-full py-3"
      >
        Add Hustle
      </button>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold text-brand-900">
      {children}
    </label>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-xs text-brand-700 leading-relaxed">
      {children}
    </div>
  );
}
