import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTurfs } from "@/lib/turf";
import { CourtsView, type Closure } from "./_components/courts-view";

// blocks.time_range arrives as text like ["2026-11-20 00:00:00+00","2026-11-22 00:00:00+00")
function parseRange(r: unknown): { start: Date; end: Date } | null {
  const m = String(r).match(/"([^"]+)","([^"]+)"/);
  if (!m) return null;
  const start = new Date(m[1].replace(" ", "T").replace(/([+-]\d\d)$/, "$1:00"));
  const end = new Date(m[2].replace(" ", "T").replace(/([+-]\d\d)$/, "$1:00"));
  return Number.isNaN(+start) || Number.isNaN(+end) ? null : { start, end };
}

const nowMs = () => Date.now();

export default async function Page() {
  const { current } = await getTurfs();
  if (!current) redirect("/setup");
  const supabase = await createClient();

  const { data: courts } = await supabase
    .from("courts")
    .select("id, name, sport, open_time, close_time, slot_minutes, base_price")
    .eq("turf_id", current.id)
    .order("name");
  const list = courts ?? [];
  const ids = list.map((c) => c.id);

  const [{ data: bands }, { data: blocks }] = await Promise.all([
    supabase
      .from("price_bands")
      .select("court_id, days_of_week, start_time, end_time, price, tag, whatsapp_bookable")
      .in("court_id", ids)
      .order("start_time"),
    supabase.from("blocks").select("id, court_id, reason, time_range").in("court_id", ids).like("reason", "Closed%"),
  ]);

  const closures: Closure[] = (blocks ?? []).flatMap((b) => {
    const r = parseRange(b.time_range);
    if (!r || +r.end <= nowMs()) return [];
    return [{ id: b.id, court_id: b.court_id, note: (b.reason ?? "").replace(/^Closed:?\s*/, ""), start: r.start.toISOString(), end: r.end.toISOString() }];
  });
  closures.sort((a, b) => a.start.localeCompare(b.start));

  return <CourtsView courts={list} bands={bands ?? []} closures={closures} />;
}
