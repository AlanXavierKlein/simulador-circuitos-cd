import type { Metadata } from "next";
import { BookOpenCheck, Sparkles } from "lucide-react";

import { GuideAccordionList } from "@/components/guide/GuideAccordionList";
import { guideItems } from "@/lib/problems/guia04";

export const metadata: Metadata = { title: "Modo guía" };

export default function GuidePage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-300">
          <Sparkles className="size-3.5" />
          Guía 04 · Electrodinámica
        </div>
        <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 shadow-lg shadow-cyan-950/30">
          <BookOpenCheck className="size-7" />
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Elegí un problema
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400">
          Abrí cada enunciado, revisá la figura original y resolvelo con el
          procedimiento de la cátedra y la validación automática.
        </p>
      </div>

      <GuideAccordionList items={guideItems} />
    </section>
  );
}
