"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { saveCourt } from "../actions";
import { SLOT_MINUTES, SPORTS } from "../schema";
import { Field, FormError, controlClass } from "./field";

export type CourtRow = {
  id: string;
  name: string;
  sport: string | null;
  open_time: string;
  close_time: string;
  slot_minutes: number;
  base_price: number;
};

// Bottom sheet on phone, centred dialog from lg.
const SHEET =
  "top-auto! bottom-0 left-0 max-w-full! translate-x-0! translate-y-0! rounded-b-none! p-5 sm:max-w-full! lg:top-1/2! lg:bottom-auto lg:left-1/2 lg:max-w-md! lg:-translate-x-1/2! lg:-translate-y-1/2! lg:rounded-xl! max-h-[90dvh] overflow-y-auto";

export function CourtForm({ court, open, onOpenChange, defaultName }: {
  court: CourtRow | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  defaultName: string;
}) {
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function submit(formData: FormData) {
    setError("");
    start(async () => {
      const res = await saveCourt({
        id: court?.id,
        name: formData.get("name"),
        sport: formData.get("sport"),
        open_time: formData.get("open_time"),
        close_time: formData.get("close_time"),
        slot_minutes: formData.get("slot_minutes"),
        base_price: formData.get("base_price"),
      });
      if (!res.ok) return setError(res.error);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={SHEET}>
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold">{court ? "Edit court" : "Add a court"}</DialogTitle>
        </DialogHeader>
        <form action={submit} className="flex flex-col gap-4">
          <Field label="Court name" htmlFor="c-name">
            <Input id="c-name" name="name" required maxLength={60} defaultValue={court?.name ?? defaultName} className={controlClass} />
          </Field>
          <Field label="Sport" htmlFor="c-sport">
            <select id="c-sport" name="sport" defaultValue={court?.sport ?? "Football"} className={controlClass}>
              {SPORTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Opens" htmlFor="c-open">
              <Input id="c-open" name="open_time" type="time" required defaultValue={court?.open_time.slice(0, 5) ?? "06:00"} className={controlClass} />
            </Field>
            <Field label="Closes" htmlFor="c-close">
              <Input id="c-close" name="close_time" type="time" required defaultValue={court?.close_time.slice(0, 5) ?? "23:00"} className={controlClass} />
            </Field>
          </div>
          <p className="-mt-2 text-[13px] text-muted-ink">A closing time before the opening time means open past midnight.</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Slot length" htmlFor="c-slot">
              <select id="c-slot" name="slot_minutes" defaultValue={court?.slot_minutes ?? 60} className={controlClass}>
                {SLOT_MINUTES.map((m) => <option key={m} value={m}>{m} min</option>)}
              </select>
            </Field>
            <Field label="Base price (₹)" htmlFor="c-price">
              <Input id="c-price" name="base_price" type="number" inputMode="numeric" min={0} step={1} required defaultValue={court?.base_price ?? ""} className={controlClass} />
            </Field>
          </div>
          <FormError message={error} />
          <Button type="submit" disabled={pending} className="h-13 w-full rounded-xl bg-brand text-base font-semibold text-white hover:bg-brand/90">
            {pending ? "Saving…" : "Save court"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
