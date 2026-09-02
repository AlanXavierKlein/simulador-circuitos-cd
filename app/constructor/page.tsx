import type { Metadata } from "next";

import { SectionPlaceholder } from "@/components/section-placeholder";

export const metadata: Metadata = { title: "Constructor" };

export default function ConstructorPage() {
  return (
    <SectionPlaceholder
      eyebrow="Fase 0"
      title="Constructor"
      description="Constructor (en construcción)"
    />
  );
}
