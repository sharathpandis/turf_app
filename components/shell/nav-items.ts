import { CalendarDays, LayoutGrid, Settings, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

// Customers is added with S6.1.
export const NAV_ITEMS: NavItem[] = [
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/courts", label: "Courts & prices", icon: LayoutGrid },
  { href: "/settings", label: "Turf settings", icon: Settings },
];
