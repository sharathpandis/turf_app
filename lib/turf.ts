import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export const TURF_COOKIE = "turf_id";

export type TurfOption = { id: string; name: string };

// Turfs the owner can see (RLS) and the selected one (cookie, else the oldest).
export async function getTurfs(): Promise<{ turfs: TurfOption[]; current: TurfOption | null }> {
  const supabase = await createClient();
  const { data } = await supabase.from("turfs").select("id, name").order("created_at");
  const turfs = data ?? [];
  const wanted = (await cookies()).get(TURF_COOKIE)?.value;
  const current = turfs.find((t) => t.id === wanted) ?? turfs[0] ?? null;
  return { turfs, current };
}
