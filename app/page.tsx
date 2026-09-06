import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function HomePage() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60 [background-image:linear-gradient(rgba(34,211,238,.055)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,.055)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl place-items-center px-5 py-20 sm:px-8">
        <div className="max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-sm text-cyan-200">
            <span className="size-2 rounded-full bg-lime-400 shadow-[0_0_14px_#a3e635]" />
            Física II · Electrodinámica
          </div>

          <h1 className="text-balance text-5xl font-semibold tracking-[-0.05em] text-white sm:text-7xl lg:text-8xl">
            Circuitos claros.
            <span className="block bg-gradient-to-r from-cyan-300 to-lime-300 bg-clip-text text-transparent">
              Física en movimiento.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-pretty text-lg leading-8 text-slate-400 sm:text-xl">
            Explorá circuitos resistivos de corriente directa, entendé sus
            magnitudes y recorré cada resolución paso a paso.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/simulador"
              className={buttonVariants({
                size: "lg",
                className:
                  "min-w-36 bg-cyan-300 text-slate-950 hover:bg-cyan-200",
              })}
            >
              Explorar
            </Link>
            <Link
              href="/guia"
              className={buttonVariants({
                size: "lg",
                variant: "outline",
                className:
                  "min-w-36 border-slate-700 bg-slate-950/40 hover:bg-slate-800",
              })}
            >
              Modo guía
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
