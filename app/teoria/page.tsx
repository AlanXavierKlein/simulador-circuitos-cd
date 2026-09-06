import type { Metadata } from "next";

import { TheoryAccordionList } from "@/components/theory/TheoryAccordionList";
import { theoryTopics } from "@/lib/teoria";

export const metadata: Metadata = { title: "Teoría" };

export default function TheoryPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-10">
      <header className="max-w-3xl">
        <p className="app-kicker">Unidad 4 · Circuitos de CC</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
          Teoría
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-400">
          Clases y desarrollo teórico de los temas de circuitos de corriente
          continua.
        </p>
      </header>

      <div className="mt-8">
        <TheoryAccordionList topics={theoryTopics} />
      </div>
    </section>
  );
}
