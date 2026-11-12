import { Suspense } from "react";
import { BottomNav } from "@/components/shell/bottom-nav";
import { Sidebar } from "@/components/shell/sidebar";
import { Logo } from "@/components/shell/logo";
import { TurfHeader, TurfHeaderSkeleton } from "@/components/shell/turf-header";
import { createClient } from "@/lib/supabase/server";

async function SidebarWithEmail() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return (
    <Sidebar
      email={data.user?.email ?? ""}
      switcher={
        <Suspense fallback={<TurfHeaderSkeleton />}>
          <TurfHeader />
        </Suspense>
      }
    />
  );
}

export default function OwnerLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh">
      <Suspense fallback={<aside className="hidden w-58 shrink-0 border-r border-line bg-card lg:block" />}>
        <SidebarWithEmail />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col pb-[calc(3.5rem+env(safe-area-inset-bottom))] lg:pb-0">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-line bg-card px-4 pt-[env(safe-area-inset-top)] lg:hidden">
          <Logo className="shrink-0 [&>span]:hidden" />
          <div className="min-w-0 flex-1">
            <Suspense fallback={<TurfHeaderSkeleton />}>
              <TurfHeader />
            </Suspense>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-4 lg:max-w-230 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
