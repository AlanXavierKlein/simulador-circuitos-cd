import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InstrumentGuidePage } from "@/components/guide/InstrumentGuidePage";
import { NetworkGuidePage } from "@/components/guide/NetworkGuidePage";
import { guideNetworkProblems, guideItems } from "@/lib/problems/guia04";
import type { GuideProblemId } from "@/lib/problems/guia04";

const problemIds: GuideProblemId[] = ["p8", "p9", "p11", "p12", "p13"];

function isGuideProblemId(value: string): value is GuideProblemId {
  return problemIds.includes(value as GuideProblemId);
}

export function generateStaticParams() {
  return problemIds.map((problema) => ({ problema }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ problema: string }>;
}): Promise<Metadata> {
  const { problema } = await params;
  const item = guideItems.find((candidate) => candidate.id === problema);
  return { title: item ? `P${item.number} · ${item.title}` : "Problema" };
}

export default async function GuideProblemPage({
  params,
}: {
  params: Promise<{ problema: string }>;
}) {
  const { problema } = await params;
  if (!isGuideProblemId(problema)) notFound();

  if (problema === "p12") return <InstrumentGuidePage kind="ammeter" />;
  if (problema === "p13") return <InstrumentGuidePage kind="voltmeter" />;

  return <NetworkGuidePage problem={guideNetworkProblems[problema]} />;
}
