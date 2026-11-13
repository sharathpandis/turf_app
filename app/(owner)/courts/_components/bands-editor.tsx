"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { DAYS, TAGS, type BandInput } from "@/app/setup/schema";
import type { CourtRow } from "@/app/setup/_components/court-form";
import { FormError, controlClass } from "@/app/setup/_components/field";
import { saveCourtBands } from "../actions";

export type BandRow = {
  court_id: string;
  days_of_week: number[];
  start_time: string;
  end_time: string;
  price: number;
  tag: string | null;
  whatsapp_bookable: boolean;
};

type Band = {
  key: string;
  days_of_week: number[];
  start_time: string;
  end_time: string;
  price: string;
  tag: string;
  whatsapp_bookable: boolean;
};

const GRID = "lg:grid lg:grid-cols-[1.5fr_1.2fr_0.8fr_1fr_1.2fr_auto] lg:items-center lg:gap-3";

export function BandsEditor({ court, initial }: { court: CourtRow; initial: BandRow[] }) {
  const [bands, setBands] = useState<Band[]>(() =>
    initial.map((b, i) => ({
      key: `b${i}`,
      days_of_week: b.days_of_week,
      start_time: b.start_time.slice(0, 5),
      end_time: b.end_time.slice(0, 5),
      price: String(b.price),
      tag: b.tag ?? "",
      whatsapp_bookable: b.whatsapp_bookable,
    })),
  );
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  const change = (fn: (all: Band[]) => Band[]) => {
    setBands(fn);
    setDirty(true);
    setSaved(false);
  };
  const update = (key: string, patch: Partial<Band>) => change((all) => all.map((b) => (b.key === key ? { ...b, ...patch } : b)));
  const add = () =>
    change((all) => [
      ...all,
      { key: `n${Date.now()}`, days_of_week: [1, 2, 3, 4, 5], start_time: "18:00", end_time: "22:00", price: "", tag: "", whatsapp_bookable: true },
    ]);

  function save() {
    setError("");
    start(async () => {
      const res = await saveCourtBands({
        court_id: court.id,
        bands: bands.map(
          (b): BandInput => ({
            court_id: court.id,
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
      setDirty(false);
      setSaved(true);
    });
  }

  return (
    <section className="flex flex-col gap-3.5 rounded-2xl border border-line bg-card p-4 lg:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="truncate text-[17px] font-semibold">{court.name} · price bands</h2>
          <span className="text-[13px] text-muted-ink">Prices are per slot. Times outside a band use the base price.</span>
        </div>
        <Button type="button" variant="outline" onClick={add} className="hidden h-10 shrink-0 rounded-[10px] border-[1.5px] border-line bg-card text-[13px] font-semibold lg:inline-flex">
          + Add band
        </Button>
      </div>

      {bands.length > 0 && (
        <div className={cn("hidden border-b border-line pb-2 text-xs font-semibold text-muted-ink", GRID)}>
          <span>Days</span><span>Time</span><span>Price</span><span>Tag</span><span>Bookable online</span><span className="w-11" />
        </div>
      )}

      {bands.map((b) => (
        <div key={b.key} className={cn("flex flex-col gap-3 rounded-xl bg-ground p-3 lg:rounded-none lg:border-b lg:border-line lg:bg-transparent lg:p-0 lg:pb-3", GRID)}>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Days">
            {DAYS.map((d) => {
              const on = b.days_of_week.includes(d.n);
              return (
                <button
                  key={d.n}
                  type="button"
                  aria-pressed={on}
                  onClick={() => update(b.key, { days_of_week: on ? b.days_of_week.filter((x) => x !== d.n) : [...b.days_of_week, d.n].sort() })}
                  className={cn("h-11 min-w-11 rounded-xl border-[1.5px] px-2 text-sm font-semibold lg:h-8 lg:min-w-0 lg:rounded-lg lg:px-1.5 lg:text-xs", on ? "border-brand bg-brand-soft text-brand" : "border-line bg-card text-muted-ink")}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-2 lg:flex lg:gap-1.5">
            <Input aria-label="From" type="time" value={b.start_time} onChange={(e) => update(b.key, { start_time: e.target.value })} className={cn(controlClass, "lg:px-2")} />
            <Input aria-label="To" type="time" value={b.end_time} onChange={(e) => update(b.key, { end_time: e.target.value })} className={cn(controlClass, "lg:px-2")} />
          </div>
          <Input aria-label="Price in rupees" type="number" inputMode="numeric" min={0} placeholder="Price ₹" value={b.price} onChange={(e) => update(b.key, { price: e.target.value })} className={controlClass} />
          <select aria-label="Slot tag" value={b.tag} onChange={(e) => update(b.key, { tag: e.target.value })} className={controlClass}>
            <option value="">No tag</option>
            {TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="flex items-center justify-between gap-3 lg:contents">
            <label className="flex h-12 items-center gap-2 text-sm font-medium lg:h-auto">
              <Switch checked={b.whatsapp_bookable} onCheckedChange={(v) => update(b.key, { whatsapp_bookable: v })} />
              <span className="lg:hidden">Bookable online</span>
              <span className="hidden text-[13px] lg:inline">{b.whatsapp_bookable ? "Yes" : "No"}</span>
            </label>
            <button type="button" aria-label="Remove band" onClick={() => change((all) => all.filter((x) => x.key !== b.key))} className="flex size-11 items-center justify-center rounded-xl text-danger">
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      ))}

      {bands.length === 0 && <p className="text-sm text-muted-ink">No bands. Every slot uses the base price.</p>}

      <button type="button" onClick={add} className="flex h-12 items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-brand text-sm font-semibold text-brand lg:hidden">
        <Plus className="size-4" /> Add a price band
      </button>

      <FormError message={error} />
      <div className="flex items-center gap-3">
        <Button type="button" disabled={!dirty || pending} onClick={save} className="h-12 flex-1 rounded-xl bg-brand text-base font-semibold text-white hover:bg-brand/90 lg:flex-none lg:px-8">
          {pending ? "Saving…" : "Save prices"}
        </Button>
        {saved && <span role="status" className="text-sm font-medium text-brand">Saved</span>}
      </div>
    </section>
  );
}
