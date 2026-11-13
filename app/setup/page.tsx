import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTurfs } from "@/lib/turf";
import { StepCourts } from "./_components/step-courts";
import { StepPrices } from "./_components/step-prices";
import { StepSettings } from "./_components/step-settings";
import { StepTurf } from "./_components/step-turf";

export default async function SetupPage({ searchParams }: PageProps<"/setup">) {
  const { current } = await getTurfs();
  const supabase = await createClient();

  const { step: raw } = await searchParams;
  const wanted = Number(Array.isArray(raw) ? raw[0] : raw) || 1;

  if (!current) return <StepTurf turf={null} />;

  const [{ data: turf }, { data: courts }] = await Promise.all([
    supabase.from("turfs").select("name, address, maps_link, advance_type, advance_value, hold_minutes, cancellation_policy, booking_code").eq("id", current.id).single(),
    supabase.from("courts").select("id, name, sport, open_time, close_time, slot_minutes, base_price").eq("turf_id", current.id).order("name"),
  ]);
  if (!turf) redirect("/login");

  const courtList = courts ?? [];
  // Steps 3 and 4 need at least one court.
  const step = courtList.length === 0 ? Math.min(Math.max(wanted, 1), 2) : Math.min(Math.max(wanted, 1), 4);

  if (step === 1) return <StepTurf turf={turf} />;
  if (step === 2) return <StepCourts courts={courtList} />;
  if (step === 3) {
    const { data: bands } = await supabase
      .from("price_bands")
      .select("court_id, days_of_week, start_time, end_time, price, tag, whatsapp_bookable")
      .in("court_id", courtList.map((c) => c.id))
      .order("start_time");
    return <StepPrices courts={courtList} bands={bands ?? []} />;
  }
  return <StepSettings turf={turf} />;
}
