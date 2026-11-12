"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/(owner)/more/actions";
import { NAV_ITEMS } from "./nav-items";
import { Logo } from "./logo";

// Left sidebar, desktop only (lg+). `switcher` is the server-rendered turf switcher.
export function Sidebar({ switcher, email }: { switcher: React.ReactNode; email: string }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-58 shrink-0 flex-col gap-6 border-r border-line bg-card px-4 py-6 lg:flex">
      <Logo className="px-2" />
      {switcher}
      <nav aria-label="Main" className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-11 items-center gap-2.5 rounded-[10px] px-3 text-sm",
                active ? "bg-brand-soft font-semibold text-brand" : "font-medium text-ink hover:bg-muted",
              )}
            >
              <Icon className={cn("size-5", active ? "text-brand" : "text-muted-ink")} aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="flex-1" />
      <div className="flex flex-col gap-2 px-2">
        <span className="truncate text-[13px] text-muted-ink">{email}</span>
        <form action={logout}>
          <button type="submit" className="flex h-11 items-center gap-2 text-sm font-medium text-muted-ink hover:text-ink">
            <LogOut className="size-4" aria-hidden /> Log out
          </button>
        </form>
      </div>
    </aside>
  );
}
