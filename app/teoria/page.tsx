import type { Metadata } from "next";

import { SectionPlaceholder } from "@/components/section-placeholder";

export const metadata: Metadata = { title: "Teoría" };

export default function TheoryPage() {
  return (
    <SectionPlaceholder
      eyebrow="Fundamentos"
      title="Teoría"
      description="Teoría (en construcción)"
    />
  );
}
