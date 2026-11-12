"use client";

import { useTransition } from "react";
import { Menu } from "@base-ui/react/menu";
import { Check, ChevronDown } from "lucide-react";
import { selectTurf } from "./turf-actions";
import type { TurfOption } from "@/lib/turf";

export function TurfSwitcher({ turfs, current }: { turfs: TurfOption[]; current: TurfOption | null }) {
  const [pending, start] = useTransition();
  const label = current?.name ?? "No turf yet";

  if (turfs.length <= 1) {
    return (
      <div className="flex h-11 items-center rounded-xl border-[1.5px] border-line bg-card px-3 text-sm font-semibold">
        <span className="truncate">{label}</span>
      </div>
    );
  }

  return (
    <Menu.Root>
      <Menu.Trigger
        disabled={pending}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-xl border-[1.5px] border-line bg-card px-3 text-sm font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span className="truncate">{label}</span>
        <ChevronDown className="size-4 shrink-0" aria-hidden />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={4} className="z-50">
          <Menu.Popup className="min-w-52 rounded-xl border border-line bg-popover p-1 shadow-md outline-none">
            {turfs.map((t) => (
              <Menu.Item
                key={t.id}
                onClick={() => start(() => selectTurf(t.id))}
                className="flex min-h-11 cursor-pointer items-center justify-between gap-2 rounded-lg px-3 text-sm font-medium outline-none data-[highlighted]:bg-brand-soft"
              >
                <span className="truncate">{t.name}</span>
                {t.id === current?.id && <Check className="size-4 text-brand" aria-hidden />}
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
