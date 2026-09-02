import type { Metadata } from "next";

import { SectionPlaceholder } from "@/components/section-placeholder";

export const metadata: Metadata = { title: "Modo guía" };

export default function GuidePage() {
  return (
    <SectionPlaceholder
      eyebrow="Fase 0"
      title="Modo guía"
      description="Modo guía (en construcción)"
    />
  );
}
