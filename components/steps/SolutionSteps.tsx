import { BookOpenCheck, ChevronDown } from "lucide-react";

import type { SolutionStep } from "@/lib/engine/steps";

export function SolutionSteps({
  steps,
  explanations,
  defaultOpen = false,
}: {
  steps: SolutionStep[];
  explanations?: Record<string, string>;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="group mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/70 shadow-xl shadow-black/20"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 marker:hidden sm:p-6">
        <span className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-lime-400/20 bg-lime-400/10 text-lime-300">
            <BookOpenCheck className="size-5" />
          </span>
          <span>
            <span className="block font-mono text-xs uppercase tracking-[0.18em] text-lime-300">
              Resolución de cátedra
            </span>
            <span className="mt-1 block text-xl font-semibold text-white">
              Paso a paso de Kirchhoff
            </span>
          </span>
        </span>
        <span className="flex items-center gap-2 text-sm text-slate-400">
          Ver desarrollo
          <ChevronDown className="size-5 transition-transform duration-200 group-open:rotate-180" />
        </span>
      </summary>

      <div className="border-t border-slate-800 px-5 py-6 sm:px-6">
        <p className="mb-5 max-w-3xl text-sm leading-6 text-slate-400">
          Se muestran las ecuaciones que usa el motor, sin aritmética intermedia
          ni desarrollo matricial.
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          {steps.map((step) => (
            <section
              key={step.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/55 p-4"
            >
              <h3 className="font-medium text-cyan-100">{step.title}</h3>
              {explanations?.[step.id] ? (
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {explanations[step.id]}
                </p>
              ) : null}
              <div className="mt-3 space-y-2">
                {step.content.split("\n").map((line, index) => (
                  <code
                    key={`${step.id}-${index}`}
                    className="block overflow-x-auto rounded-lg bg-slate-950/80 px-3 py-2 font-mono text-xs leading-5 text-slate-300"
                  >
                    {line}
                  </code>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </details>
  );
}
