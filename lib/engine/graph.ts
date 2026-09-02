import type { Circuit, Component, NodeId } from "./model";

export type BranchOrientation = 1 | -1;

export type GraphBranch = {
  index: number;
  component: Component;
  label: string;
  nFrom: NodeId;
  nTo: NodeId;
};

export type AdjacentBranch = {
  branchIndex: number;
  nodeId: NodeId;
  /** Orientación al recorrer desde el nodo dueño de la lista hacia nodeId. */
  orientation: BranchOrientation;
};

export type CircuitGraph = {
  nodeIds: NodeId[];
  branches: GraphBranch[];
  adjacency: Map<NodeId, AdjacentBranch[]>;
};

export type SpanningTree = {
  treeBranchIndices: number[];
  linkBranchIndices: number[];
};

export type OrientedBranch = {
  branchIndex: number;
  label: string;
  orientation: BranchOrientation;
  from: NodeId;
  to: NodeId;
};

export type FundamentalLoop = {
  id: string;
  linkBranchIndex: number;
  branches: OrientedBranch[];
};

/** Construye el multigrafo no dirigido de nodos y ramas del circuito. */
export function buildCircuitGraph(circuit: Circuit): CircuitGraph {
  const nodeIds = circuit.nodes.map((node) => node.id);
  const nodeSet = new Set(nodeIds);
  const adjacency = new Map<NodeId, AdjacentBranch[]>(
    nodeIds.map((nodeId) => [nodeId, []]),
  );

  const branches = circuit.components.map((component, index) => {
    if (!nodeSet.has(component.nFrom) || !nodeSet.has(component.nTo)) {
      throw new Error(
        `La rama ${component.label} referencia un nodo inexistente.`,
      );
    }
    if (component.nFrom === component.nTo) {
      throw new Error(
        `La rama ${component.label} no puede conectar un nodo consigo mismo.`,
      );
    }

    adjacency.get(component.nFrom)?.push({
      branchIndex: index,
      nodeId: component.nTo,
      orientation: 1,
    });
    adjacency.get(component.nTo)?.push({
      branchIndex: index,
      nodeId: component.nFrom,
      orientation: -1,
    });

    return {
      index,
      component,
      label: component.label,
      nFrom: component.nFrom,
      nTo: component.nTo,
    };
  });

  return { nodeIds, branches, adjacency };
}

/** Elige un árbol de expansión determinista mediante Kruskal/union-find. */
export function chooseSpanningTree(graph: CircuitGraph): SpanningTree {
  const parent = new Map(graph.nodeIds.map((nodeId) => [nodeId, nodeId]));

  function find(nodeId: NodeId): NodeId {
    const currentParent = parent.get(nodeId);
    if (currentParent === undefined) {
      throw new Error(`Nodo desconocido: ${nodeId}.`);
    }
    if (currentParent === nodeId) return nodeId;
    const root = find(currentParent);
    parent.set(nodeId, root);
    return root;
  }

  const treeBranchIndices: number[] = [];
  const linkBranchIndices: number[] = [];

  for (const branch of graph.branches) {
    const fromRoot = find(branch.nFrom);
    const toRoot = find(branch.nTo);

    if (fromRoot === toRoot) {
      linkBranchIndices.push(branch.index);
    } else {
      parent.set(fromRoot, toRoot);
      treeBranchIndices.push(branch.index);
    }
  }

  if (
    graph.nodeIds.length > 0 &&
    treeBranchIndices.length !== graph.nodeIds.length - 1
  ) {
    throw new Error("El circuito debe formar un grafo conectado.");
  }

  return { treeBranchIndices, linkBranchIndices };
}

function findPath(
  graph: CircuitGraph,
  allowedBranches: Set<number>,
  start: NodeId,
  target: NodeId,
): OrientedBranch[] {
  if (start === target) return [];

  const queue: Array<{ nodeId: NodeId; path: OrientedBranch[] }> = [
    { nodeId: start, path: [] },
  ];
  const visited = new Set<NodeId>([start]);

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;

    for (const adjacent of graph.adjacency.get(current.nodeId) ?? []) {
      if (
        !allowedBranches.has(adjacent.branchIndex) ||
        visited.has(adjacent.nodeId)
      ) {
        continue;
      }

      const branch = graph.branches[adjacent.branchIndex];
      const step: OrientedBranch = {
        branchIndex: branch.index,
        label: branch.label,
        orientation: adjacent.orientation,
        from: current.nodeId,
        to: adjacent.nodeId,
      };
      const path = [...current.path, step];
      if (adjacent.nodeId === target) return path;

      visited.add(adjacent.nodeId);
      queue.push({ nodeId: adjacent.nodeId, path });
    }
  }

  throw new Error(`No existe un camino entre ${start} y ${target}.`);
}

/**
 * Deriva las mallas fundamentales. Cada enlace se recorre nFrom -> nTo y se
 * cierra con el camino único del árbol entre nTo y nFrom.
 */
export function findFundamentalLoops(circuit: Circuit): FundamentalLoop[] {
  const graph = buildCircuitGraph(circuit);
  const tree = chooseSpanningTree(graph);
  const treeBranches = new Set(tree.treeBranchIndices);

  return tree.linkBranchIndices.map((linkBranchIndex, index) => {
    const link = graph.branches[linkBranchIndex];
    const closingPath = findPath(graph, treeBranches, link.nTo, link.nFrom);

    return {
      id: `M${index + 1}`,
      linkBranchIndex,
      branches: [
        {
          branchIndex: link.index,
          label: link.label,
          orientation: 1,
          from: link.nFrom,
          to: link.nTo,
        },
        ...closingPath,
      ],
    };
  });
}

/** Devuelve un camino simple y orientado entre dos nodos. */
export function findPathBetweenNodes(
  circuit: Circuit,
  start: NodeId,
  target: NodeId,
): OrientedBranch[] {
  const graph = buildCircuitGraph(circuit);
  return findPath(
    graph,
    new Set(graph.branches.map((branch) => branch.index)),
    start,
    target,
  );
}
