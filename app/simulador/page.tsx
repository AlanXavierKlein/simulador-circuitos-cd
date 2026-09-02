import type { Metadata } from "next";

import { SectionPlaceholder } from "@/components/section-placeholder";

export const metadata: Metadata = { title: "Simulador" };

export default function SimulatorPage() {
  return (
    <SectionPlaceholder
      eyebrow="Fase 0"
      title="Simulador"
      description="Simulador (en construcción)"
    />
  );
}
