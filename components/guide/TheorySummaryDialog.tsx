"use client";

import { Dialog } from "@base-ui/react/dialog";
import { BookOpenText, X } from "lucide-react";

import type { GuideTheory } from "@/lib/problems/guia04";

export function TheorySummaryDialog({ theory }: { theory: GuideTheory }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="app-button-secondary inline-flex min-h-11 items-center gap-2 px-4 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">
        <BookOpenText className="size-4" />
        Resumen teórico del ejercicio
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[70] min-h-dvh bg-slate-950/75 backdrop-blur-sm transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Viewport className="fixed inset-0 z-[71] flex min-h-dvh items-center justify-center overflow-y-auto p-4 sm:p-6">
          <Dialog.Popup className="my-auto w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl shadow-black/60 outline-none transition-[opacity,transform] duration-150 data-ending-style:translate-y-1 data-ending-style:opacity-0 data-starting-style:translate-y-1 data-starting-style:opacity-0">
            <header className="flex items-start justify-between gap-4 border-b border-slate-800 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="app-icon size-11">
                  <BookOpenText className="size-5" />
                </span>
                <div>
                  <p className="app-kicker">Resumen teórico</p>
                  <Dialog.Title className="mt-1 text-xl font-semibold text-white sm:text-2xl">
                    {theory.title}
                  </Dialog.Title>
                </div>
              </div>
              <Dialog.Close
                aria-label="Cerrar resumen teórico"
                className="grid size-11 shrink-0 place-items-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300 transition hover:border-cyan-400/45 hover:text-cyan-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
              >
                <X className="size-5" />
              </Dialog.Close>
            </header>

            <div className="max-h-[min(68dvh,42rem)] space-y-6 overflow-y-auto p-5 sm:p-6">
              {theory.sections.map((section) => (
                <section key={section.heading}>
                  <h3 className="font-semibold text-cyan-100">
                    {section.heading}
                  </h3>
                  {section.content ? (
                    <p className="mt-2 text-sm leading-6 text-slate-300 sm:text-base">
                      {section.content}
                    </p>
                  ) : null}
                  {section.formulas?.length ? (
                    <ul className="mt-3 space-y-2">
                      {section.formulas.map((formula) => (
                        <li
                          key={formula}
                          className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 font-mono text-sm text-amber-200"
                        >
                          {formula}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
