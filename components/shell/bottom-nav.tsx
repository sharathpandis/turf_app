"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/more", label: "More", icon: Menu },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 border-t bg-background pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-md">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium",
                  active ? "text-green-600" : "text-muted-foreground",
                )}
              >
                <Icon className="size-6" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
