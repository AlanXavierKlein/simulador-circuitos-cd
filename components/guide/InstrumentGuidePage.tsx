import { ArrowLeft, Gauge, Network } from "lucide-react";
import Link from "next/link";

import { InstrumentDesigner } from "./InstrumentDesigner";

export function InstrumentGuidePage({
  kind,
}: {
  kind: "ammeter" | "voltmeter";
}) {
  const isAmmeter = kind === "ammeter";

  return (
    <section className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-8 sm:py-10">
      <Link
        href="/guia"
        className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-cyan-200"
      >
        <ArrowLeft className="size-4" /> Volver a la guía
      </Link>

      <header className="mt-6 mb-9 flex max-w-5xl items-start gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
          {isAmmeter ? (
            <Gauge className="size-7" />
          ) : (
            <Network className="size-7" />
          )}
        </span>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan-300">
            Problema {isAmmeter ? "12" : "13"} · Diseño de instrumento
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            {isAmmeter
              ? "Amperímetro con shunt Ayrton"
              : "Voltímetro de tres escalas"}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400">
            {isAmmeter
              ? "Calculá las tres resistencias de derivación que protegen al galvanómetro y producen el fondo de escala para 0,1 A, 1 A y 10 A."
              : "Calculá las resistencias multiplicadoras acumuladas que permiten medir 3 V, 15 V y 150 V con el mismo galvanómetro."}
          </p>
        </div>
      </header>

      <InstrumentDesigner kind={kind} />
    </section>
  );
}
