import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

type SectionPlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionPlaceholder({
  eyebrow,
  title,
  description,
}: SectionPlaceholderProps) {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-5 py-20 sm:px-8">
      <div className="app-surface w-full p-8 sm:p-14">
        <p className="app-kicker">{eyebrow}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">
          {description}
        </p>
        <div className="mt-9">
          <Link
            href="/"
            className={buttonVariants({
              variant: "outline",
              className:
                "app-button-secondary border-slate-700 bg-transparent hover:bg-slate-800",
            })}
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </section>
  );
}
