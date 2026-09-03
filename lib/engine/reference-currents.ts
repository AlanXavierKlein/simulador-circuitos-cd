import { buildCircuitGraph } from "./graph";
import type { BranchOrientation } from "./graph";
import type { Circuit, NodeId } from "./model";

export type ReferenceCurrentSegment = {
  componentLabel: string;
  direction: BranchOrientation;
};

export type ReferenceCurrentGroup = {
  label: string;
  path: NodeId[];
  segments: ReferenceCurrentSegment[];
  current: number;
  isOppositeToReference: boolean;
};

export type ComponentCurrentReference = {
  label: string;
  direction: BranchOrientation;
  current: number;
  isOppositeToReference: boolean;
  isLabelHost: boolean;
};

export type ReferenceCurrentLayout = {
  groups: ReferenceCurrentGroup[];
  byComponent: Record<string, ComponentCurrentReference>;
};

/**
 * Agrupa componentes unidos por nodos de grado dos en ramas físicas. La
 * orientación elegida es determinista y se usa tanto en el dibujo como en la
 * explicación de Kirchhoff.
 */
export function buildReferenceCurrentLayout(
  circuit: Circuit,
  branchCurrents: Record<string, number>,
): ReferenceCurrentLayout {
  const graph = buildCircuitGraph(circuit);
  const visitedBranches = new Set<number>();
  const groups: ReferenceCurrentGroup[] = [];
  let unknownReferenceIndex = 0;

  for (const seed of graph.branches) {
    if (visitedBranches.has(seed.index)) continue;

    const fromDegree = graph.adjacency.get(seed.nFrom)?.length ?? 0;
    const toDegree = graph.adjacency.get(seed.nTo)?.length ?? 0;
    const startNode =
      fromDegree !== 2 ? seed.nFrom : toDegree !== 2 ? seed.nTo : seed.nFrom;
    const path: NodeId[] = [startNode];
    const segments: ReferenceCurrentSegment[] = [];
    let currentNode = startNode;
    let nextBranchIndex = seed.index;

    while (!visitedBranches.has(nextBranchIndex)) {
      const branch = graph.branches[nextBranchIndex];
      const direction: BranchOrientation =
        branch.nFrom === currentNode ? 1 : -1;
      const nextNode = direction === 1 ? branch.nTo : branch.nFrom;

      visitedBranches.add(nextBranchIndex);
      segments.push({ componentLabel: branch.label, direction });
      path.push(nextNode);

      const nextDegree = graph.adjacency.get(nextNode)?.length ?? 0;
      if (nextNode === startNode || nextDegree !== 2) break;

      const nextAdjacent = (graph.adjacency.get(nextNode) ?? []).find(
        (adjacent) => !visitedBranches.has(adjacent.branchIndex),
      );
      if (!nextAdjacent) break;

      currentNode = nextNode;
      nextBranchIndex = nextAdjacent.branchIndex;
    }

    const alignedCurrents = segments.map(
      (segment) =>
        (branchCurrents[segment.componentLabel] ?? 0) * segment.direction,
    );
    const current =
      alignedCurrents.reduce((sum, value) => sum + value, 0) /
      alignedCurrents.length;

    const knownCurrentSource = segments
      .map((segment) =>
        circuit.components.find(
          (component) => component.label === segment.componentLabel,
        ),
      )
      .find((component) => component?.type === "currentSource");
    const label = knownCurrentSource?.label ?? `I${unknownReferenceIndex++}`;

    groups.push({
      label,
      path,
      segments,
      current,
      isOppositeToReference: current < -1e-9,
    });
  }

  const byComponent: Record<string, ComponentCurrentReference> = {};
  for (const group of groups) {
    group.segments.forEach((segment, index) => {
      byComponent[segment.componentLabel] = {
        label: group.label,
        direction: segment.direction,
        current: group.current,
        isOppositeToReference: group.isOppositeToReference,
        isLabelHost: index === 0,
      };
    });
  }

  return { groups, byComponent };
}
