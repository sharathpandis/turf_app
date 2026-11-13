"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CourtRow } from "@/app/setup/_components/court-form";
import { Field, FormError, controlClass } from "@/app/setup/_components/field";
import { closeCourt, reopenCourt } from "../actions";
import type { Closure } from "./courts-view";

const fmt = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }).format(new Date(iso));

export function Closures({ court, closures }: { court: CourtRow; closures: Closure[] }) {
  const [error, setError] = useState("");
  const [formKey, setFormKey] = useState(0);
  const [pending, start] = useTransition();

  function submit(fd: FormData) {
    setError("");
    start(async () => {
      const res = await closeCourt({ court_id: court.id, from: fd.get("from"), to: fd.get("to"), note: fd.get("note") });
      if (!res.ok) return setError(res.error);
      setFormKey((k) => k + 1);
    });
  }

  function reopen(id: string) {
    setError("");
    start(async () => {
      const res = await reopenCourt(id);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <section className="flex flex-col gap-3.5 rounded-2xl border border-line bg-card p-4 lg:p-5">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-[17px] font-semibold">Close {court.name} for dates</h2>
        <span className="text-[13px] text-muted-ink">For holidays or repairs. Players cannot book these days.</span>
      </div>

      {closures.map((c) => {
        const last = new Date(+new Date(c.end) - 1).toISOString();
        const same = fmt(c.start) === fmt(last);
        return (
          <div key={c.id} className="flex items-center justify-between gap-2 rounded-xl bg-ground py-1 pl-3">
            <div className="min-w-0 text-sm">
              <strong>{same ? fmt(c.start) : `${fmt(c.start)} – ${fmt(last)}`}</strong>
              {c.note && <span className="text-muted-ink"> · {c.note}</span>}
            </div>
            <button type="button" aria-label="Reopen court for these dates" disabled={pending} onClick={() => reopen(c.id)} className="flex size-11 shrink-0 items-center justify-center rounded-xl text-danger">
              <X className="size-4" />
            </button>
          </div>
        );
      })}

      <form key={formKey} action={submit} className="grid grid-cols-2 gap-3 lg:grid-cols-[1fr_1fr_1.5fr_auto] lg:items-end">
        <Field label="From" htmlFor="cl-from">
          <Input id="cl-from" name="from" type="date" required className={controlClass} />
        </Field>
        <Field label="To" htmlFor="cl-to">
          <Input id="cl-to" name="to" type="date" required className={controlClass} />
        </Field>
        <div className="col-span-2 lg:col-span-1">
          <Field label="Reason (optional)" htmlFor="cl-note">
            <Input id="cl-note" name="note" maxLength={80} placeholder="Repair, holiday…" className={controlClass} />
          </Field>
        </div>
        <Button type="submit" disabled={pending} variant="outline" className="col-span-2 h-12 rounded-xl border-[1.5px] border-line bg-card font-semibold lg:col-span-1">
          {pending ? "Closing…" : "Close court"}
        </Button>
      </form>
      <FormError message={error} />
    </section>
  );
}
