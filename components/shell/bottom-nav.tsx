"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutGrid, Menu, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/courts", label: "Courts", icon: LayoutGrid },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/more", label: "More", icon: Menu },
];

// Phone only (below lg); the sidebar replaces it on desktop.
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card pb-[env(safe-area-inset-bottom)] lg:hidden"
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
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs",
                  active ? "font-semibold text-brand" : "font-medium text-muted-ink",
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
