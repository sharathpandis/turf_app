"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveTurf } from "../actions";
import { Field, FormError, controlClass } from "./field";
import { WizardShell, primaryButtonClass } from "./wizard-shell";

type Props = { turf: { name: string; address: string | null; maps_link: string | null } | null };

export function StepTurf({ turf }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function submit(formData: FormData) {
    setError("");
    start(async () => {
      const res = await saveTurf({
        name: formData.get("name"),
        address: formData.get("address"),
        maps_link: formData.get("maps_link"),
      });
      if (!res.ok) return setError(res.error);
      router.push("/setup?step=2");
    });
  }

  return (
    <form action={submit}>
      <WizardShell
        step={1}
        title="Your turf"
        subtitle="Players see this name and address on your booking link."
        canFinishLater={false}
        footer={
          <Button type="submit" disabled={pending} className={primaryButtonClass}>
            {pending ? "Saving…" : "Next: courts"}
          </Button>
        }
      >
        <Field label="Turf name" htmlFor="name">
          <Input id="name" name="name" required maxLength={80} defaultValue={turf?.name ?? ""} placeholder="Green Arena" className={controlClass} />
        </Field>
        <Field label="Address (optional)" htmlFor="address">
          <Input id="address" name="address" maxLength={200} defaultValue={turf?.address ?? ""} autoComplete="street-address" className={controlClass} />
        </Field>
        <Field label="Google Maps link (optional)" htmlFor="maps_link" hint="Open your turf in Google Maps, tap Share, and paste the link.">
          <Input id="maps_link" name="maps_link" type="url" inputMode="url" defaultValue={turf?.maps_link ?? ""} placeholder="https://maps.app.goo.gl/…" className={controlClass} />
        </Field>
        <FormError message={error} />
      </WizardShell>
    </form>
  );
}
