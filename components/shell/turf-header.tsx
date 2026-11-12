import { getTurfs } from "@/lib/turf";
import { TurfSwitcher } from "./turf-switcher";

// Server component: reads the owner's turfs through RLS.
export async function TurfHeader() {
  const { turfs, current } = await getTurfs();
  return <TurfSwitcher turfs={turfs} current={current} />;
}

export function TurfHeaderSkeleton() {
  return <div className="h-11 w-full animate-pulse rounded-xl bg-muted" />;
}
