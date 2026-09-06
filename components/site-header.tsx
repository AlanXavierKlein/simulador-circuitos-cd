import { Menu, X } from "lucide-react";
import Link from "next/link";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/simulador", label: "Simulador" },
  { href: "/guia", label: "Modo guía" },
  { href: "/constructor", label: "Constructor" },
  { href: "/teoria", label: "Teoría" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 font-semibold tracking-tight text-slate-50"
        >
          <span className="grid size-8 place-items-center rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
            Ω
          </span>
          <span className="hidden sm:inline">Circuitos CC</span>
        </Link>

        <details className="group relative md:hidden">
          <summary className="grid size-11 cursor-pointer list-none place-items-center rounded-xl border border-slate-700 bg-slate-900/80 text-slate-200 transition marker:hidden hover:border-cyan-400/50 hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300">
            <span className="sr-only">Abrir o cerrar menú</span>
            <Menu className="size-5 group-open:hidden" />
            <X className="hidden size-5 group-open:block" />
          </summary>
          <nav
            aria-label="Navegación principal móvil"
            className="absolute right-0 top-[calc(100%+0.5rem)] w-[min(18rem,calc(100vw-2.5rem))] rounded-2xl border border-slate-700 bg-slate-950/95 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl"
          >
            <ul className="flex flex-col gap-1 text-sm text-slate-300">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block min-h-11 whitespace-nowrap rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-800/70 hover:text-slate-50"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </details>

        <nav aria-label="Navegación principal" className="hidden md:block">
          <ul className="flex items-center gap-1 text-sm text-slate-400">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block whitespace-nowrap rounded-lg px-3 py-2 transition-colors hover:bg-slate-800/70 hover:text-slate-50"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
