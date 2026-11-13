"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { TURF_COOKIE, getTurfs } from "@/lib/turf";
import {
  bandsSchema,
  courtSchema,
  settingsSchema,
  turfSchema,
  type ActionResult,
} from "./schema";
import { z } from "zod";

const firstError = (e: z.ZodError) => e.issues[0]?.message ?? "Check the form and try again";
const failed = (error: string): ActionResult => ({ ok: false, error });
const SAVE_FAILED = "Could not save. Try again.";

// The turf being set up: the owner's current turf (RLS limits this to their own).
async function currentTurf() {
  const { current } = await getTurfs();
  return current;
}

export async function saveTurf(input: unknown): Promise<ActionResult> {
  const parsed = turfSchema.safeParse(input);
  if (!parsed.success) return failed(firstError(parsed.error));
  const v = {
    name: parsed.data.name,
    address: parsed.data.address || null,
    maps_link: parsed.data.maps_link || null,
  };
  const supabase = await createClient();
  const turf = await currentTurf();

  if (turf) {
    const { error } = await supabase.from("turfs").update(v).eq("id", turf.id);
    if (error) return failed(SAVE_FAILED);
  } else {
    const { data: member } = await supabase.from("members").select("owner_id").limit(1).maybeSingle();
    if (!member) return failed("Your account is not linked to an owner. Sign in again.");
    const { data, error } = await supabase
      .from("turfs")
      .insert({ ...v, owner_id: member.owner_id })
      .select("id")
      .single();
    if (error || !data) return failed(SAVE_FAILED);
    (await cookies()).set(TURF_COOKIE, data.id, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function saveCourt(input: unknown): Promise<ActionResult> {
  const parsed = courtSchema.safeParse(input);
  if (!parsed.success) return failed(firstError(parsed.error));
  const turf = await currentTurf();
  if (!turf) return failed("Add the turf details first.");
  const { id, ...v } = parsed.data;
  const supabase = await createClient();

  if (id) {
    const { error } = await supabase.from("courts").update(v).eq("id", id).eq("turf_id", turf.id);
    if (error) return failed(SAVE_FAILED);
  } else {
    const { data: t } = await supabase.from("turfs").select("owner_id").eq("id", turf.id).single();
    if (!t) return failed(SAVE_FAILED);
    const { error } = await supabase.from("courts").insert({ ...v, turf_id: turf.id, owner_id: t.owner_id });
    if (error) return failed(SAVE_FAILED);
  }
  revalidatePath("/setup");
  revalidatePath("/courts");
  return { ok: true };
}

export async function deleteCourt(id: string): Promise<ActionResult> {
  if (!z.uuid().safeParse(id).success) return failed(SAVE_FAILED);
  const turf = await currentTurf();
  if (!turf) return failed(SAVE_FAILED);
  const supabase = await createClient();
  const { error } = await supabase.from("courts").delete().eq("id", id).eq("turf_id", turf.id);
  if (error) return failed("This court has bookings, so it cannot be deleted.");
  revalidatePath("/setup");
  revalidatePath("/courts");
  return { ok: true };
}

// Replaces all price bands of this turf's courts with the submitted list.
export async function saveBands(input: unknown): Promise<ActionResult> {
  const parsed = bandsSchema.safeParse(input);
  if (!parsed.success) return failed(firstError(parsed.error));
  const turf = await currentTurf();
  if (!turf) return failed(SAVE_FAILED);
  const supabase = await createClient();

  const { data: courts } = await supabase.from("courts").select("id, owner_id").eq("turf_id", turf.id);
  const owned = new Map((courts ?? []).map((c) => [c.id, c.owner_id]));
  if (parsed.data.bands.some((b) => !owned.has(b.court_id))) return failed(SAVE_FAILED);

  const { error: delError } = await supabase.from("price_bands").delete().in("court_id", [...owned.keys()]);
  if (delError) return failed(SAVE_FAILED);
  if (parsed.data.bands.length > 0) {
    const { error } = await supabase
      .from("price_bands")
      .insert(parsed.data.bands.map((b) => ({ ...b, owner_id: owned.get(b.court_id)! })));
    if (error) return failed(SAVE_FAILED);
  }
  revalidatePath("/setup");
  revalidatePath("/courts");
  return { ok: true };
}

export async function saveSettings(input: unknown): Promise<ActionResult> {
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return failed(firstError(parsed.error));
  const turf = await currentTurf();
  if (!turf) return failed(SAVE_FAILED);
  const v = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("turfs")
    .update({
      advance_type: v.advance_type,
      advance_value: v.advance_type === "none" ? 0 : v.advance_value,
      hold_minutes: v.hold_minutes,
      cancellation_policy: v.cancellation_policy || null,
      booking_code: v.booking_code,
    })
    .eq("id", turf.id);
  if (error) {
    return failed(error.code === "23505" ? "That booking code is taken. Try another." : SAVE_FAILED);
  }
  revalidatePath("/", "layout");
  redirect("/calendar");
}
