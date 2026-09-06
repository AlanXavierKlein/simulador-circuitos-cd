"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BookOpenText, ChevronDown, ExternalLink, Info } from "lucide-react";
import { useState } from "react";

import type { TheoryTopic } from "@/lib/teoria";

type TheoryMode = "summary" | "detailed";

function EmphasizedText({ content }: { content: string }) {
  return content.split(/(\*\*.*?\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index} className="font-semibold text-slate-100">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

export function TheoryAccordionList({ topics }: { topics: TheoryTopic[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [mode, setMode] = useState<TheoryMode>("summary");

  return (
    <div>
      <div
        role="tablist"
        aria-label="Nivel de desarrollo teórico"
        className="mb-5 inline-flex rounded-xl border border-slate-700 bg-slate-950/80 p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "summary"}
          onClick={() => setMode("summary")}
          className={`min-h-10 rounded-lg px-4 text-sm font-semibold transition ${
            mode === "summary"
              ? "bg-cyan-400 text-slate-950"
              : "text-slate-400 hover:text-slate-100"
          }`}
        >
          Resumen
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "detailed"}
          onClick={() => setMode("detailed")}
          className={`min-h-10 rounded-lg px-4 text-sm font-semibold transition ${
            mode === "detailed"
              ? "bg-cyan-400 text-slate-950"
              : "text-slate-400 hover:text-slate-100"
          }`}
        >
          Desarrollada
        </button>
      </div>

      <div className="space-y-3">
        {topics.map((topic, index) => {
          const isOpen = openId === topic.id;
          const panelId = `theory-panel-${topic.id}`;
          const development =
            mode === "summary"
              ? topic.developmentSummary
              : topic.developmentDetailed;

          return (
            <motion.article
              layout="position"
              key={topic.id}
              className={`overflow-hidden rounded-3xl border transition-colors duration-200 ${
                isOpen
                  ? "border-cyan-400/35 bg-slate-900/85 shadow-2xl shadow-cyan-950/20"
                  : "border-slate-800 bg-slate-950/65 hover:border-slate-700"
              }`}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenId(isOpen ? null : topic.id)}
                className="flex w-full items-center gap-4 px-5 py-5 text-left sm:px-6"
              >
                <span
                  className={`grid size-12 shrink-0 place-items-center rounded-2xl border font-mono text-sm font-bold ${
                    isOpen
                      ? "border-cyan-400/35 bg-cyan-400/10 text-cyan-200"
                      : "border-slate-700 bg-slate-900 text-slate-400"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                    Unidad 4
                  </span>
                  <span className="mt-1 block text-lg font-semibold text-slate-100 sm:text-xl">
                    {topic.title}
                  </span>
                </span>
                <ChevronDown
                  className={`size-5 shrink-0 text-slate-500 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-cyan-300" : ""
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    id={panelId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <div className="border-t border-slate-800 px-5 pb-6 pt-5 sm:px-6">
                      <a
                        href={topic.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="app-button-primary inline-flex h-11 items-center gap-2 px-4 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
                      >
                        <ExternalLink className="size-4" />
                        Ver clase del profe
                      </a>

                      {topic.note ? (
                        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-4 text-sm leading-6 text-amber-100">
                          <Info className="mt-0.5 size-5 shrink-0 text-amber-300" />
                          <p>{topic.note}</p>
                        </div>
                      ) : null}

                      <section className="app-surface-inset mt-5 p-5">
                        <div className="flex items-start gap-3">
                          <span className="app-icon size-10">
                            <BookOpenText className="size-5" />
                          </span>
                          <div>
                            <h2 className="font-semibold text-slate-100">
                              Desarrollo teórico ·{" "}
                              {mode === "summary" ? "Resumen" : "Desarrollada"}
                            </h2>
                            <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300 sm:text-base">
                              <EmphasizedText content={development} />
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
