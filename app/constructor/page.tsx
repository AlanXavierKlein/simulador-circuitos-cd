import type { Metadata } from "next";
import { Cable, CircuitBoard, Sparkles } from "lucide-react";

import { CircuitConstructor } from "@/components/constructor/CircuitConstructor";

export const metadata: Metadata = { title: "Constructor" };

export default function ConstructorPage() {
  return (
    <section className="mx-auto w-full max-w-[1800px] px-4 py-8 sm:px-8 sm:py-10">
      <header className="mb-8 flex max-w-5xl items-start gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
          <CircuitBoard className="size-7" />
        </span>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan-300">
            Laboratorio libre · Fase 5
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Construí tu propio circuito
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400">
            Arrastrá componentes, conectá cada terminal a un nodo y elegí una
            referencia a tierra. Cuando la red cierre una malla, el motor la
            resuelve y anima automáticamente.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950/70 px-3 py-1.5">
              <Cable className="size-3.5 text-cyan-300" /> Conexión por
              terminales
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950/70 px-3 py-1.5">
              <Sparkles className="size-3.5 text-lime-300" /> Resolución en vivo
            </span>
          </div>
        </div>
      </header>

      <CircuitConstructor />
    </section>
  );
}
