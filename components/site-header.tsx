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

        <nav aria-label="Navegación principal">
          <ul className="flex items-center gap-1 overflow-x-auto text-sm text-slate-400">
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
