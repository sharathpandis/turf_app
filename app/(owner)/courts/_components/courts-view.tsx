"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteCourt } from "@/app/setup/actions";
import { CourtForm, type CourtRow } from "@/app/setup/_components/court-form";
import { FormError, formatTime } from "@/app/setup/_components/field";
import { cn } from "@/lib/utils";
import { BandsEditor, type BandRow } from "./bands-editor";
import { Closures } from "./closures";

export type Closure = { id: string; court_id: string; note: string; start: string; end: string };

export function CourtsView({ courts, bands, closures }: { courts: CourtRow[]; bands: BandRow[]; closures: Closure[] }) {
  const [selectedId, setSelectedId] = useState(courts[0]?.id ?? "");
  const [editing, setEditing] = useState<CourtRow | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const selected = courts.find((c) => c.id === selectedId) ?? courts[0] ?? null;
  const openForm = (c: CourtRow | null) => {
    setEditing(c);
    setOpen(true);
  };

  function remove(c: CourtRow) {
    if (!window.confirm(`Delete ${c.name}? Its price bands are removed too.`)) return;
    setError("");
    start(async () => {
      const res = await deleteCourt(c.id);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold lg:text-[28px]">Courts &amp; prices</h1>
        <Button type="button" onClick={() => openForm(null)} className="h-11 rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand/90">
          <Plus className="size-4" /> Add court
        </Button>
      </div>

      {courts.length === 0 && (
        <p className="rounded-2xl border border-line bg-card p-5 text-sm text-muted-ink">No courts yet. Add your first court.</p>
      )}

      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
        {courts.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={c.id === selected?.id}
            onClick={() => setSelectedId(c.id)}
            className={cn(
              "flex min-h-11 w-60 shrink-0 flex-col gap-1.5 rounded-2xl bg-card p-4 text-left lg:w-auto",
              c.id === selected?.id ? "border-2 border-brand" : "border-[1.5px] border-line",
            )}
          >
            <span className="truncate text-base font-semibold">{c.name}</span>
            <span className="text-[13px] text-muted-ink">
              {c.sport ?? "Court"} · {c.slot_minutes} min · {formatTime(c.open_time)}–{formatTime(c.close_time)}
            </span>
            <span className="font-heading text-[15px] font-semibold">Base ₹{c.base_price.toLocaleString("en-IN")}</span>
          </button>
        ))}
      </div>
      <FormError message={error} />

      {selected && (
        <>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => openForm(selected)} className="h-11 flex-1 rounded-xl border-[1.5px] border-line bg-card font-semibold lg:flex-none">
              <Pencil className="size-4" /> Edit court
            </Button>
            <Button type="button" variant="outline" disabled={pending} onClick={() => remove(selected)} className="h-11 rounded-xl border-[1.5px] border-line bg-card font-semibold text-danger">
              <Trash2 className="size-4" /> Delete
            </Button>
          </div>
          <BandsEditor
            key={selected.id}
            court={selected}
            initial={bands.filter((b) => b.court_id === selected.id)}
          />
          <Closures court={selected} closures={closures.filter((c) => c.court_id === selected.id)} />
        </>
      )}

      <p className="text-[13px] leading-normal text-muted-ink">
        &ldquo;Bookable online&rdquo; controls what players can book through WhatsApp and the booking link. Turn it off for hours you sell on other apps.
      </p>

      <CourtForm
        key={editing?.id ?? `new-${courts.length}`}
        court={editing}
        open={open}
        onOpenChange={setOpen}
        defaultName={`Turf ${courts.length + 1}`}
      />
    </div>
  );
}
