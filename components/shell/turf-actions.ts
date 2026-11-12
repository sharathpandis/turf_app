"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { TURF_COOKIE } from "@/lib/turf";

export async function selectTurf(id: string) {
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return;
  (await cookies()).set(TURF_COOKIE, parsed.data, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/", "layout");
}
