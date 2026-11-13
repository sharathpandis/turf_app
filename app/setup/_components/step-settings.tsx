"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveSettings } from "../actions";
import { Field, FormError, controlClass } from "./field";
import { WizardShell, primaryButtonClass } from "./wizard-shell";

export type SettingsRow = {
  name: string;
  advance_type: string;
  advance_value: number;
  hold_minutes: number;
  cancellation_policy: string | null;
  booking_code: string | null;
};

const suggestCode = (name: string) => {
  const code = name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
  return code.length >= 4 ? code : "";
};

export function StepSettings({ turf }: { turf: SettingsRow }) {
  const [advanceType, setAdvanceType] = useState(turf.advance_type);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function submit(formData: FormData) {
    setError("");
    start(async () => {
      // On success the action redirects to the calendar; we only get here on failure.
      const res = await saveSettings({
        advance_type: formData.get("advance_type"),
        advance_value: formData.get("advance_value") || 0,
        hold_minutes: formData.get("hold_minutes"),
        cancellation_policy: formData.get("cancellation_policy"),
        booking_code: formData.get("booking_code"),
      });
      if (res && !res.ok) setError(res.error);
    });
  }

  return (
    <form action={submit}>
      <WizardShell
        step={4}
        title="Booking settings"
        subtitle="How players pay and book on your link. You can change these later."
        canFinishLater
        footer={
          <Button type="submit" disabled={pending} className={primaryButtonClass}>
            {pending ? "Saving…" : "Finish setup"}
          </Button>
        }
      >
        <Field label="Advance payment" htmlFor="advance_type" hint="Paid online by players to confirm a slot.">
          <select id="advance_type" name="advance_type" value={advanceType} onChange={(e) => setAdvanceType(e.target.value)} className={controlClass}>
            <option value="none">No advance: confirm at once</option>
            <option value="fixed">Fixed amount (₹)</option>
            <option value="percent">Percent of price (%)</option>
          </select>
        </Field>
        {advanceType !== "none" && (
          <Field label={advanceType === "fixed" ? "Advance amount (₹)" : "Advance (%)"} htmlFor="advance_value">
            <Input id="advance_value" name="advance_value" type="number" inputMode="numeric" min={0} max={advanceType === "percent" ? 100 : undefined} required defaultValue={turf.advance_value || ""} className={controlClass} />
          </Field>
        )}
        <Field label="Slot hold time (minutes)" htmlFor="hold_minutes" hint="How long a slot stays locked while the player pays.">
          <Input id="hold_minutes" name="hold_minutes" type="number" inputMode="numeric" min={5} max={60} required defaultValue={turf.hold_minutes} className={controlClass} />
        </Field>
        <Field label="Cancellation policy (optional)" htmlFor="cancellation_policy">
          <Textarea id="cancellation_policy" name="cancellation_policy" maxLength={500} rows={3} defaultValue={turf.cancellation_policy ?? ""} placeholder="e.g. Cancel 24 hours before for a refund." className="min-h-24 rounded-xl border-[1.5px] border-line bg-card px-3 py-2 text-base" />
        </Field>
        <Field label="Booking code" htmlFor="booking_code" hint="Part of your booking link and WhatsApp link. Letters and numbers only.">
          <Input id="booking_code" name="booking_code" required minLength={4} maxLength={20} autoCapitalize="characters" defaultValue={turf.booking_code ?? suggestCode(turf.name)} className={`${controlClass} uppercase`} />
        </Field>
        <FormError message={error} />
      </WizardShell>
    </form>
  );
}
