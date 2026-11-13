import { z } from "zod";

export const SPORTS = ["Football", "Cricket", "Pickleball", "Badminton", "Tennis", "Other"] as const;
export const TAGS = ["night", "women-only", "kids", "coaching"] as const;
export const SLOT_MINUTES = [30, 60, 90] as const;
export const DAYS = [
  { n: 1, label: "Mon" },
  { n: 2, label: "Tue" },
  { n: 3, label: "Wed" },
  { n: 4, label: "Thu" },
  { n: 5, label: "Fri" },
  { n: 6, label: "Sat" },
  { n: 7, label: "Sun" },
] as const;

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Enter a time");
const rupees = z.coerce.number().int("Whole rupees only").min(0, "Cannot be negative").max(1_000_000);

export const turfSchema = z.object({
  name: z.string().trim().min(1, "Enter the turf name").max(80),
  address: z.string().trim().max(200).optional().default(""),
  maps_link: z
    .string()
    .trim()
    .max(500)
    .optional()
    .default("")
    .refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v), "Enter a full link starting with https://"),
});

export const courtSchema = z
  .object({
    id: z.uuid().optional(),
    name: z.string().trim().min(1, "Enter a court name").max(60),
    sport: z.enum(SPORTS),
    open_time: time,
    close_time: time,
    slot_minutes: z.coerce.number().pipe(z.union([z.literal(30), z.literal(60), z.literal(90)])),
    base_price: rupees,
  })
  .refine((c) => c.open_time !== c.close_time, { path: ["close_time"], message: "Closing time must differ from opening" });

export const bandSchema = z
  .object({
    court_id: z.uuid(),
    days_of_week: z.array(z.number().int().min(1).max(7)).min(1, "Pick at least one day"),
    start_time: time,
    end_time: time,
    price: rupees,
    tag: z.enum(TAGS).nullable(),
    whatsapp_bookable: z.boolean(),
  })
  .refine((b) => b.start_time !== b.end_time, { path: ["end_time"], message: "End must differ from start" });

export const bandsSchema = z.object({ bands: z.array(bandSchema).max(60) });

export const settingsSchema = z
  .object({
    advance_type: z.enum(["none", "fixed", "percent"]),
    advance_value: rupees,
    hold_minutes: z.coerce.number().int().min(5, "At least 5 minutes").max(60, "At most 60 minutes"),
    cancellation_policy: z.string().trim().max(500).optional().default(""),
    booking_code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9]{4,20}$/, "4–20 letters or numbers, no spaces"),
  })
  .refine((s) => s.advance_type !== "percent" || s.advance_value <= 100, {
    path: ["advance_value"],
    message: "Percent must be 100 or less",
  });

export type ActionResult = { ok: true } | { ok: false; error: string };
export type CourtInput = z.input<typeof courtSchema>;
export type BandInput = z.input<typeof bandSchema>;
export type SettingsInput = z.input<typeof settingsSchema>;
