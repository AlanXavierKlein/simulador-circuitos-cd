import { ArrowLeft, BookOpenText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { guideCircuitLayouts } from "@/components/circuit/example-layouts";
import { SimulatorWorkspace } from "@/components/simulator/SimulatorWorkspace";
import type { GuideNetworkProblem } from "@/lib/problems/guia04";

export function NetworkGuidePage({
  problem,
}: {
  problem: GuideNetworkProblem;
}) {
  return (
    <section className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-8 sm:py-10">
      <Link
        href="/guia"
        className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-cyan-200"
      >
        <ArrowLeft className="size-4" /> Volver a la guía
      </Link>

      <header className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_28rem] lg:items-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan-300">
            {problem.eyebrow}
          </p>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            {problem.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400">
            {problem.description}
          </p>
        </div>
        <div className="relative min-h-56 overflow-hidden rounded-3xl border border-slate-700 bg-white shadow-2xl shadow-black/20">
          <Image
            src={problem.image}
            alt={`Enunciado oficial del ${problem.eyebrow}`}
            fill
            priority
            sizes="(min-width: 1024px) 28rem, 90vw"
            className="object-contain p-4"
          />
        </div>
      </header>

      <div className="mt-10 space-y-12">
        {problem.cases.map((problemCase, index) => {
          const layout = guideCircuitLayouts[problemCase.id];
          if (!layout) return null;

          return (
            <article key={problemCase.id}>
              <div className="mb-5 flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-lime-400/20 bg-lime-400/10 font-mono text-sm font-bold text-lime-300">
                  {index + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2 text-lime-300">
                    <BookOpenText className="size-4" />
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em]">
                      Caso de estudio
                    </p>
                  </div>
                  <h2 className="mt-1 text-2xl font-semibold text-white">
                    {problemCase.title}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                    {problemCase.description}
                  </p>
                </div>
              </div>

              <SimulatorWorkspace
                initialCircuit={problemCase.circuit}
                nodePositions={layout.nodePositions}
                componentPositions={layout.componentPositions}
                currentLabelPlacements={layout.currentLabelPlacements}
                title={`${problem.eyebrow} · ${problemCase.title}`}
                guide={{
                  stepExplanations: problemCase.stepExplanations,
                  stepContentOverrides: problemCase.stepContentOverrides,
                  resolution: problemCase.resolution,
                }}
              />
            </article>
          );
        })}
      </div>
    </section>
  );
}
