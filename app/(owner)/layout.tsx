import { Suspense } from "react";
import { BottomNav } from "@/components/shell/bottom-nav";
import { TurfHeader, TurfHeaderSkeleton } from "@/components/shell/turf-header";

export default function OwnerLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col pb-[calc(3.5rem+env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-10 flex h-14 items-center border-b bg-background px-4 pt-[env(safe-area-inset-top)]">
        <Suspense fallback={<TurfHeaderSkeleton />}>
          <TurfHeader />
        </Suspense>
      </header>
      <main className="flex flex-1 flex-col px-4 py-4">{children}</main>
      <BottomNav />
    </div>
  );
}
