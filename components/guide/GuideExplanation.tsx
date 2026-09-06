import { BookOpenCheck } from "lucide-react";

import type { GuideExplanation as GuideExplanationContent } from "@/lib/problems/guide-explanations";

export function GuideExplanation({
  explanation,
}: {
  explanation: GuideExplanationContent;
}) {
  return (
    <section className="app-surface overflow-hidden">
      <header className="flex items-start gap-3 p-5 sm:p-6">
        <span className="app-icon size-11 border-lime-400/20 bg-lime-400/10 text-lime-300">
          <BookOpenCheck className="size-5" />
        </span>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime-300">
            Resolución de cátedra
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">
            {explanation.heading}
          </h2>
        </div>
      </header>

      <div className="border-t border-slate-800 px-5 py-6 sm:px-6">
        {explanation.analysis ? (
          <section className="max-w-4xl">
            <h3 className="font-medium text-cyan-100">Análisis</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {explanation.analysis}
            </p>
          </section>
        ) : null}

        {explanation.sections?.length ? (
          <div className="mt-6 space-y-6">
            {explanation.sections.map((section) => (
              <section key={section.title}>
                <h3 className="text-lg font-semibold text-white">
                  {section.title}
                </h3>
                {section.content ? (
                  <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">
                    {section.content}
                  </p>
                ) : null}
                {section.steps?.length ? (
                  <ol className="mt-4 grid gap-4 lg:grid-cols-2">
                    {section.steps.map((step) => (
                      <li key={step.title} className="app-surface-inset p-4">
                        <h4 className="font-medium text-cyan-100">
                          {step.title}
                        </h4>
                        {step.content ? (
                          <p className="mt-2 text-sm leading-6 text-slate-400">
                            {step.content}
                          </p>
                        ) : null}
                        {step.equations?.length ? (
                          <div className="mt-3 space-y-2">
                            {step.equations.map((equation) => (
                              <code
                                key={equation}
                                className="block overflow-x-auto rounded-lg bg-slate-950/80 px-3 py-2 font-mono text-xs leading-5 text-slate-300"
                              >
                                {equation}
                              </code>
                            ))}
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                ) : null}
                {section.equations?.length ? (
                  <div className="mt-3 space-y-2">
                    {section.equations.map((equation) => (
                      <code
                        key={equation}
                        className="block max-w-4xl overflow-x-auto rounded-lg bg-slate-900 px-3 py-2 font-mono text-xs leading-5 text-slate-300"
                      >
                        {equation}
                      </code>
                    ))}
                  </div>
                ) : null}
              </section>
            ))}
          </div>
        ) : null}

        {explanation.result ? (
          <section className="mt-6 rounded-2xl border border-lime-400/20 bg-lime-400/5 p-4">
            <h3 className="font-medium text-lime-200">Resultado</h3>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              {explanation.result}
            </p>
          </section>
        ) : null}
      </div>
    </section>
  );
}
