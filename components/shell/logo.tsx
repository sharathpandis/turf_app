import { cn } from "@/lib/utils";

export function Logo({ size = "md", className }: { size?: "md" | "lg"; className?: string }) {
  const box = size === "lg" ? "size-10 rounded-xl" : "size-9 rounded-[10px]";
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className={cn("flex items-center justify-center bg-brand", box)}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <line x1="12" y1="5" x2="12" y2="19" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </div>
      <span className={cn("font-heading font-bold", size === "lg" ? "text-xl" : "text-lg")}>Turf App</span>
    </div>
  );
}
