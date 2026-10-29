import { Maximize2, Move3d } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Marco común para los circuitos y los esquemas de instrumentos. */
export function CircuitCanvasFrame({
  title,
  subtitle,
  compact = false,
  children,
}: {
  title: string;
  subtitle: string;
  compact?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "circuit-flow relative flex w-full flex-col overflow-hidden rounded-3xl border border-slate-800 bg-[#080d18] shadow-2xl shadow-black/30",
        compact
          ? "h-[360px] sm:h-[460px]"
          : "h-[58svh] min-h-[360px] sm:h-[min(720px,calc(100vh-13.5rem))] sm:min-h-[500px]",
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-800 px-3 py-3 sm:px-4">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-200">
            {title}
          </p>
          <p className="mt-0.5 font-mono text-[10px] text-slate-400">
            {subtitle}
          </p>
        </div>
        <div className="hidden shrink-0 items-center gap-3 text-[11px] text-slate-400 lg:flex">
          <span className="flex items-center gap-1.5">
            <Move3d className="size-3.5" /> desplazar
          </span>
          <span className="flex items-center gap-1.5">
            <Maximize2 className="size-3.5" /> zoom
          </span>
        </div>
      </div>
      <div className="min-h-0 flex-1 touch-none">{children}</div>
    </div>
  );
}
