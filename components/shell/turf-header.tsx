import { createClient } from "@/lib/supabase/server";

// Shows the owner's turf name. The turf switcher comes once a owner can have several turfs (Sprint 2).
export async function TurfHeader() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("turfs")
    .select("name")
    .order("created_at")
    .limit(1)
    .maybeSingle();

  return <span className="truncate text-lg font-semibold">{data?.name ?? "No turf yet"}</span>;
}

export function TurfHeaderSkeleton() {
  return <span className="block h-6 w-40 animate-pulse rounded bg-muted" />;
}
