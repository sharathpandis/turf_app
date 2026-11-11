import { Button } from "@/components/ui/button";
import { logout } from "./actions";

export default function MorePage() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">More</h1>
      <form action={logout}>
        <Button type="submit" variant="outline" className="h-12 w-full">
          Log out
        </Button>
      </form>
    </section>
  );
}
