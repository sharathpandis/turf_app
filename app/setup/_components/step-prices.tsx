"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { saveBands } from "../actions";
import { DAYS, TAGS, type BandInput } from "../schema";
import type { CourtRow } from "./court-form";
import { FormError, controlClass, formatTime } from "./field";
import { WizardShell, primaryButtonClass } from "./wizard-shell";

type Band = {
  key: string;
  court_id: string;
  days_of_week: number[];
  start_time: string;
  end_time: string;
  price: string;
  tag: string;
  whatsapp_bookable: boolean;
};

export type BandRow = {
  court_id: string;
  days_of_week: number[];
  start_time: string;
  end_time: string;
  price: number;
  tag: string | null;
  whatsapp_bookable: boolean;
};

export function StepPrices({ courts, bands: initial }: { courts: CourtRow[]; bands: BandRow[] }) {
  const router = useRouter();
  const [bands, setBands] = useState<Band[]>(() =>
    initial.map((b, i) => ({
      key: `b${i}`,
      court_id: b.court_id,
      days_of_week: b.days_of_week,
      start_time: b.start_time.slice(0, 5),
      end_time: b.end_time.slice(0, 5),
      price: String(b.price),
      tag: b.tag ?? "",
      whatsapp_bookable: b.whatsapp_bookable,
    })),
  );
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const update = (key: string, patch: Partial<Band>) =>
    setBands((all) => all.map((b) => (b.key === key ? { ...b, ...patch } : b)));
  const add = (court_id: string) =>
    setBands((all) => [
      ...all,
      { key: `n${Date.now()}`, court_id, days_of_week: [1, 2, 3, 4, 5], start_time: "18:00", end_time: "22:00", price: "", tag: "", whatsapp_bookable: true },
    ]);

  function next() {
    setError("");
    start(async () => {
      const res = await saveBands({
        bands: bands.map(
          (b): BandInput => ({
            court_id: b.court_id,
            days_of_week: b.days_of_week,
            start_time: b.start_time,
            end_time: b.end_time,
            price: b.price,
            tag: (b.tag || null) as BandInput["tag"],
            whatsapp_bookable: b.whatsapp_bookable,
          }),
        ),
      });
      if (!res.ok) return setError(res.error);
      router.push("/setup?step=4");
    });
  }

  return (
    <WizardShell
      step={3}
      title="Peak and off-peak prices"
      subtitle="Optional. A band overrides the base price for the days and hours you choose."
      canFinishLater
      footer={
        <Button type="button" disabled={pending} onClick={next} className={primaryButtonClass}>
          {pending ? "Saving…" : bands.length === 0 ? "Skip: base price only" : "Next: booking settings"}
        </Button>
      }
    >
      {courts.map((c) => (
        <section key={c.id} className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-line bg-card p-4">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="truncate text-base font-semibold">{c.name}</h2>
            <span className="shrink-0 text-[13px] text-muted-ink">
              Base ₹{c.base_price.toLocaleString("en-IN")} · {formatTime(c.open_time)}–{formatTime(c.close_time)}
            </span>
          </div>
          {bands.filter((b) => b.court_id === c.id).map((b) => (
            <div key={b.key} className="flex flex-col gap-3 rounded-xl bg-ground p-3">
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Days">
                {DAYS.map((d) => {
                  const on = b.days_of_week.includes(d.n);
                  return (
                    <button
                      key={d.n}
                      type="button"
                      aria-pressed={on}
                      onClick={() => update(b.key, { days_of_week: on ? b.days_of_week.filter((x) => x !== d.n) : [...b.days_of_week, d.n].sort() })}
                      className={cn("h-11 min-w-11 rounded-xl border-[1.5px] px-2 text-sm font-semibold", on ? "border-brand bg-brand-soft text-brand" : "border-line bg-card text-muted-ink")}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Input aria-label="From" type="time" value={b.start_time} onChange={(e) => update(b.key, { start_time: e.target.value })} className={controlClass} />
                <Input aria-label="To" type="time" value={b.end_time} onChange={(e) => update(b.key, { end_time: e.target.value })} className={controlClass} />
                <Input aria-label="Price in rupees" type="number" inputMode="numeric" min={0} placeholder="₹" value={b.price} onChange={(e) => update(b.key, { price: e.target.value })} className={controlClass} />
              </div>
              <div className="flex items-center gap-3">
                <select aria-label="Slot tag" value={b.tag} onChange={(e) => update(b.key, { tag: e.target.value })} className={cn(controlClass, "flex-1")}>
                  <option value="">No tag</option>
                  {TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <label className="flex h-12 items-center gap-2 text-sm font-medium">
                  <Switch checked={b.whatsapp_bookable} onCheckedChange={(v) => update(b.key, { whatsapp_bookable: v })} />
                  Bookable online
                </label>
                <button type="button" aria-label="Remove band" onClick={() => setBands((all) => all.filter((x) => x.key !== b.key))} className="flex size-11 items-center justify-center rounded-xl text-danger">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => add(c.id)} className="flex h-12 items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-brand text-sm font-semibold text-brand">
            <Plus className="size-4" />
            Add a price band
          </button>
        </section>
      ))}
      <FormError message={error} />
    </WizardShell>
  );
}
