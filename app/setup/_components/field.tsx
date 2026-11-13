import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

export const controlClass =
  "h-12 w-full min-w-0 rounded-xl border-[1.5px] border-line bg-card px-3 text-base outline-none focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/20";

export function Field({ label, hint, htmlFor, children }: { label: string; hint?: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-semibold">
        {label}
      </Label>
      {children}
      {hint && <p className="text-[13px] leading-snug text-muted-ink">{hint}</p>}
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl bg-danger-bg px-3 py-2 text-sm font-medium text-danger">
      {message}
    </p>
  );
}

export const hhmm = (t: string) => t.slice(0, 5);

export function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h < 12 ? "AM" : "PM"}`;
}
