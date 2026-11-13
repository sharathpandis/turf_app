"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getTurfs } from "@/lib/turf";
import { bandSchema, type ActionResult } from "@/app/setup/schema";

const failed = (error: string): ActionResult => ({ ok: false, error });
const SAVE_FAILED = "Could not save. Try again.";
const CLOSED_PREFIX = "Closed";

async function ownedCourt(courtId: string) {
  const { current } = await getTurfs();
  if (!current) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("courts")
    .select("id, owner_id")
    .eq("id", courtId)
    .eq("turf_id", current.id)
    .maybeSingle();
  return data;
}

const courtBandsSchema = z.object({
  court_id: z.uuid(),
  bands: z.array(bandSchema).max(30),
});

// Replaces the price bands of ONE court.
export async function saveCourtBands(input: unknown): Promise<ActionResult> {
  const parsed = courtBandsSchema.safeParse(input);
  if (!parsed.success) return failed(parsed.error.issues[0]?.message ?? SAVE_FAILED);
  const { court_id, bands } = parsed.data;
  if (bands.some((b) => b.court_id !== court_id)) return failed(SAVE_FAILED);
  const court = await ownedCourt(court_id);
  if (!court) return failed(SAVE_FAILED);

  const supabase = await createClient();
  const { error: delError } = await supabase.from("price_bands").delete().eq("court_id", court_id);
  if (delError) return failed(SAVE_FAILED);
  if (bands.length > 0) {
    const { error } = await supabase
      .from("price_bands")
      .insert(bands.map((b) => ({ ...b, owner_id: court.owner_id })));
    if (error) return failed(SAVE_FAILED);
  }
  revalidatePath("/courts");
  return { ok: true };
}

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date");
const closureSchema = z
  .object({
    court_id: z.uuid(),
    from: date,
    to: date,
    note: z.string().trim().max(80).optional().default(""),
  })
  .refine((c) => c.to >= c.from, { path: ["to"], message: "Last day must be on or after the first day" });

const nextDay = (d: string) => {
  const t = new Date(`${d}T00:00:00Z`);
  t.setUTCDate(t.getUTCDate() + 1);
  return t.toISOString().slice(0, 10);
};

// Closing a court = one block covering whole days (IST). Clashes with bookings are refused by the database.
export async function closeCourt(input: unknown): Promise<ActionResult> {
  const parsed = closureSchema.safeParse(input);
  if (!parsed.success) return failed(parsed.error.issues[0]?.message ?? SAVE_FAILED);
  const { court_id, from, to, note } = parsed.data;
  const court = await ownedCourt(court_id);
  if (!court) return failed(SAVE_FAILED);

  const supabase = await createClient();
  const { error } = await supabase.from("blocks").insert({
    court_id,
    owner_id: court.owner_id,
    reason: note ? `${CLOSED_PREFIX}: ${note}` : CLOSED_PREFIX,
    time_range: `[${from}T00:00:00+05:30,${nextDay(to)}T00:00:00+05:30)`,
  });
  if (error) {
    return failed(
      error.code === "23P01"
        ? "This court has bookings or blocks in these dates. Cancel them first."
        : SAVE_FAILED,
    );
  }
  revalidatePath("/courts");
  return { ok: true };
}

export async function reopenCourt(id: string): Promise<ActionResult> {
  if (!z.uuid().safeParse(id).success) return failed(SAVE_FAILED);
  const { current } = await getTurfs();
  if (!current) return failed(SAVE_FAILED);
  const supabase = await createClient();
  const { data: courts } = await supabase.from("courts").select("id").eq("turf_id", current.id);
  const { error } = await supabase
    .from("blocks")
    .delete()
    .eq("id", id)
    .like("reason", `${CLOSED_PREFIX}%`)
    .in("court_id", (courts ?? []).map((c) => c.id));
  if (error) return failed(SAVE_FAILED);
  revalidatePath("/courts");
  return { ok: true };
}
