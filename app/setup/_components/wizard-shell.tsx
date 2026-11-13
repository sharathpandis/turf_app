import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  step: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
  canFinishLater: boolean;
  footer: ReactNode;
  children: ReactNode;
};

// Header (back, step count, finish later), progress bar, content and sticky action bar.
export function WizardShell({ step, title, subtitle, canFinishLater, footer, children }: Props) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col lg:max-w-230">
      <div className="flex flex-col gap-3.5 px-6 pt-[calc(env(safe-area-inset-top)+1rem)] lg:pt-10">
        <div className="flex items-center justify-between">
          {step > 1 ? (
            <Link
              href={`/setup?step=${step - 1}`}
              aria-label="Back"
              className="flex size-11 items-center justify-center rounded-xl border-[1.5px] border-line bg-card"
            >
              <ChevronLeft className="size-5" />
            </Link>
          ) : (
            <span className="size-11" />
          )}
          <span className="text-sm font-semibold text-muted-ink">Step {step} of 4</span>
          {canFinishLater ? (
            <Link href="/calendar" className="flex h-11 items-center text-sm font-semibold text-brand">
              Finish later
            </Link>
          ) : (
            <span className="w-20" />
          )}
        </div>
        <div className="grid grid-cols-4 gap-1.5" aria-hidden>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className={cn("h-1.5 rounded-sm", n <= step ? "bg-brand" : "bg-line")} />
          ))}
        </div>
        <h1 className="mt-2 font-heading text-[28px] leading-tight font-bold">{title}</h1>
        <p className="text-[15px] leading-normal text-muted-ink">{subtitle}</p>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-6 py-6">{children}</div>
      <div className="sticky bottom-0 border-t border-line bg-card px-6 pt-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
        {footer}
      </div>
    </div>
  );
}

export const primaryButtonClass = "h-13 w-full rounded-xl bg-brand text-base font-semibold text-white hover:bg-brand/90";
