"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BookOpenCheck,
  ChevronDown,
  CircuitBoard,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { GuideListItem } from "@/lib/problems/guia04";

function ItemIcon({ id }: { id: GuideListItem["id"] }) {
  if (id === "constructor") return <Wrench className="size-5" />;
  if (id === "p12" || id === "p13") return <CircuitBoard className="size-5" />;
  return <BookOpenCheck className="size-5" />;
}

export function GuideAccordionList({ items }: { items: GuideListItem[] }) {
  const [openId, setOpenId] = useState<GuideListItem["id"] | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = openId === item.id;
        const panelId = `guide-panel-${item.id}`;

        return (
          <motion.article
            layout="position"
            key={item.id}
            className={`overflow-hidden rounded-3xl border transition-colors duration-300 ${
              isOpen
                ? "border-cyan-400/35 bg-slate-900/85 shadow-2xl shadow-cyan-950/20"
                : "border-slate-800 bg-slate-950/65 hover:border-slate-700"
            }`}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="flex w-full items-center gap-4 px-5 py-5 text-left sm:px-6"
            >
              <span
                className={`grid size-12 shrink-0 place-items-center rounded-2xl border font-mono text-sm font-bold ${
                  isOpen
                    ? "border-cyan-400/35 bg-cyan-400/10 text-cyan-200"
                    : "border-slate-700 bg-slate-900 text-slate-400"
                }`}
              >
                {item.number}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  {item.type}
                </span>
                <span className="mt-1 block text-lg font-semibold text-slate-100 sm:text-xl">
                  {item.title}
                </span>
              </span>
              <ChevronDown
                className={`size-5 shrink-0 text-slate-500 transition-transform duration-300 ${
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
                  transition={{ duration: 0.28, ease: "easeInOut" }}
                >
                  <div className="border-t border-slate-800 px-5 pb-6 pt-5 sm:px-6">
                    <div
                      className={`grid gap-6 ${
                        item.image
                          ? "lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.85fr)] lg:items-center"
                          : ""
                      }`}
                    >
                      <div>
                        <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                          {item.description}
                        </p>
                        <Link
                          href={item.href}
                          className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-cyan-300 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
                        >
                          <ItemIcon id={item.id} />
                          Resolver
                          <ArrowRight className="size-4" />
                        </Link>
                      </div>

                      {item.image ? (
                        <div className="relative min-h-64 overflow-hidden rounded-2xl border border-slate-700 bg-white p-3 shadow-inner sm:min-h-80">
                          <Image
                            src={item.image}
                            alt={`Enunciado oficial del problema ${item.number}`}
                            fill
                            sizes="(min-width: 1024px) 38vw, 90vw"
                            className="object-contain p-3"
                          />
                        </div>
                      ) : (
                        <div className="hidden rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 p-6 text-slate-500 lg:block">
                          <CircuitBoard className="size-12 text-cyan-400/40" />
                          <p className="mt-4 text-sm leading-6">
                            El constructor se habilitará por completo en la
                            próxima fase.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.article>
        );
      })}
    </div>
  );
}
