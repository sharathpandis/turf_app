"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteCourt } from "../actions";
import { CourtForm, type CourtRow } from "./court-form";
import { FormError, formatTime } from "./field";
import { WizardShell, primaryButtonClass } from "./wizard-shell";

export function StepCourts({ courts }: { courts: CourtRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<CourtRow | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const openForm = (c: CourtRow | null) => {
    setEditing(c);
    setOpen(true);
  };

  function remove(id: string) {
    setError("");
    start(async () => {
      const res = await deleteCourt(id);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <>
      <WizardShell
        step={2}
        title="Add your courts"
        subtitle="Each court is a ground players book separately. You can add more later."
        canFinishLater
        footer={
          <Button
            type="button"
            disabled={courts.length === 0}
            onClick={() => router.push("/setup?step=3")}
            className={primaryButtonClass}
          >
            Next: prices
          </Button>
        }
      >
        {courts.map((c) => (
          <div key={c.id} className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-line bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 truncate text-base font-semibold">{c.name}</div>
              <div className="flex shrink-0 items-center gap-1">
                {c.sport && (
                  <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">{c.sport}</span>
                )}
                <button type="button" aria-label={`Edit ${c.name}`} onClick={() => openForm(c)} className="flex size-11 items-center justify-center rounded-xl text-muted-ink">
                  <Pencil className="size-4" />
                </button>
                <button type="button" aria-label={`Delete ${c.name}`} disabled={pending} onClick={() => remove(c.id)} className="flex size-11 items-center justify-center rounded-xl text-danger">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[13px] text-muted-ink">
              <div className="flex flex-col gap-0.5">Hours<strong className="text-sm text-ink">{formatTime(c.open_time)}–{formatTime(c.close_time)}</strong></div>
              <div className="flex flex-col gap-0.5">Slot<strong className="text-sm text-ink">{c.slot_minutes} min</strong></div>
              <div className="flex flex-col gap-0.5">Base price<strong className="font-heading text-sm text-ink">₹{c.base_price.toLocaleString("en-IN")}</strong></div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => openForm(null)}
          className="flex h-14 items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-brand text-[15px] font-semibold text-brand"
        >
          <Plus className="size-[18px]" />
          Add a court
        </button>
        <FormError message={error} />
        <p className="mt-1 text-[13px] leading-normal text-muted-ink">Peak and off-peak prices come in the next step.</p>
      </WizardShell>
      <CourtForm
        key={editing?.id ?? `new-${courts.length}`}
        court={editing}
        open={open}
        onOpenChange={setOpen}
        defaultName={`Turf ${courts.length + 1}`}
      />
    </>
  );
}
