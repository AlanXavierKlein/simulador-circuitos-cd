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

export type EditableCircuitNode =
  | {
      id: string;
      kind: "junction";
      label: string;
      isGround: boolean;
    }
  | {
      id: string;
      kind: "resistor" | "voltageSource" | "currentSource";
      label: string;
      value: number;
    };

export type EditableCircuitConnection = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
};

export type EditableCircuitValidation = {
  circuit: Circuit | null;
  issues: string[];
};

function addUniqueIssue(issues: string[], issue: string): void {
  if (!issues.includes(issue)) issues.push(issue);
}

function componentTerminalConnection(
  component: Extract<
    EditableCircuitNode,
    { kind: Exclude<EditableCircuitNode["kind"], "junction"> }
  >,
  connection: EditableCircuitConnection,
): { handle: string | null | undefined; otherNodeId: string } | null {
  if (connection.source === component.id) {
    return {
      handle: connection.sourceHandle,
      otherNodeId: connection.target,
    };
  }
  if (connection.target === component.id) {
    return {
      handle: connection.targetHandle,
      otherNodeId: connection.source,
    };
  }
  return null;
}

/**
 * Valida el grafo editable del constructor y, cuando está completo, lo
 * convierte a la netlist que consume el motor de Kirchhoff.
 */
export function editableGraphToCircuit(
  editableNodes: EditableCircuitNode[],
  connections: EditableCircuitConnection[],
): EditableCircuitValidation {
  const issues: string[] = [];
  const nodeMap = new Map(editableNodes.map((node) => [node.id, node]));
  const junctions = editableNodes.filter(
    (node): node is Extract<EditableCircuitNode, { kind: "junction" }> =>
      node.kind === "junction",
  );
  const components = editableNodes.filter(
    (
      node,
    ): node is Extract<
      EditableCircuitNode,
      { kind: "resistor" | "voltageSource" | "currentSource" }
    > => node.kind !== "junction",
  );

  if (nodeMap.size !== editableNodes.length) {
    addUniqueIssue(issues, "Hay elementos repetidos en el canvas.");
  }
  if (junctions.length === 0) {
    addUniqueIssue(
      issues,
      "Agregá nodos de unión para conectar los terminales de los componentes.",
    );
  }
  if (components.length === 0) {
    addUniqueIssue(issues, "Agregá al menos un componente al circuito.");
  }

  const groundNodes = junctions.filter((node) => node.isGround);
  if (groundNodes.length === 0) {
    addUniqueIssue(
      issues,
      "Elegí un nodo de referencia a tierra desde el panel de propiedades.",
    );
  } else if (groundNodes.length > 1) {
    addUniqueIssue(
      issues,
      "El circuito debe tener una sola referencia a tierra.",
    );
  }

  const junctionLabels = junctions.map((node) =>
    node.isGround ? "0" : node.label.trim(),
  );
  if (junctionLabels.some((label) => label.length === 0)) {
    addUniqueIssue(issues, "Todos los nodos deben tener una etiqueta.");
  }
  if (new Set(junctionLabels).size !== junctionLabels.length) {
    addUniqueIssue(issues, "Las etiquetas de los nodos deben ser únicas.");
  }

  const componentLabels = components.map((component) => component.label.trim());
  if (componentLabels.some((label) => label.length === 0)) {
    addUniqueIssue(issues, "Todos los componentes deben tener una etiqueta.");
  }
  if (new Set(componentLabels).size !== componentLabels.length) {
    addUniqueIssue(
      issues,
      "Las etiquetas de los componentes deben ser únicas.",
    );
  }

  if (
    !components.some(
      (component) =>
        component.kind === "voltageSource" ||
        component.kind === "currentSource",
    )
  ) {
    addUniqueIssue(
      issues,
      "Agregá al menos una fuente para energizar el circuito.",
    );
  }

  const junctionConnectionCount = new Map(
    junctions.map((junction) => [junction.id, 0]),
  );
  for (const connection of connections) {
    const source = nodeMap.get(connection.source);
    const target = nodeMap.get(connection.target);
    if (!source || !target) {
      addUniqueIssue(
        issues,
        "Hay un cable conectado a un elemento que ya no existe.",
      );
      continue;
    }
    const sourceIsJunction = source.kind === "junction";
    const targetIsJunction = target.kind === "junction";
    if (sourceIsJunction === targetIsJunction) {
      addUniqueIssue(
        issues,
        "Cada cable debe unir el terminal de un componente con un nodo de unión.",
      );
      continue;
    }
    const junction = sourceIsJunction ? source : target;
    junctionConnectionCount.set(
      junction.id,
      (junctionConnectionCount.get(junction.id) ?? 0) + 1,
    );
  }

  for (const junction of junctions) {
    if ((junctionConnectionCount.get(junction.id) ?? 0) === 0) {
      addUniqueIssue(
        issues,
        `El nodo ${junction.isGround ? "0" : junction.label} está aislado. Conectalo o borralo.`,
      );
    }
  }

  const componentEndpoints = new Map<string, { from?: string; to?: string }>();
  for (const component of components) {
    if (!Number.isFinite(component.value)) {
      addUniqueIssue(
        issues,
        `El valor de ${component.label || "un componente"} debe ser numérico.`,
      );
    } else if (component.kind === "resistor" && component.value <= 0) {
      addUniqueIssue(
        issues,
        `La resistencia ${component.label || "sin etiqueta"} debe ser mayor que cero.`,
      );
    }

    const terminals: Record<"from" | "to", string[]> = {
      from: [],
      to: [],
    };
    for (const connection of connections) {
      const terminal = componentTerminalConnection(component, connection);
      if (!terminal) continue;
      const otherNode = nodeMap.get(terminal.otherNodeId);
      if (!otherNode || otherNode.kind !== "junction") continue;
      if (terminal.handle !== "from" && terminal.handle !== "to") {
        addUniqueIssue(
          issues,
          `Uno de los cables de ${component.label} no parte de un terminal válido.`,
        );
        continue;
      }
      terminals[terminal.handle].push(otherNode.id);
    }

    for (const handle of ["from", "to"] as const) {
      if (terminals[handle].length === 0) {
        addUniqueIssue(
          issues,
          `${component.label || "Un componente"} tiene el terminal ${handle === "from" ? "de entrada" : "de salida"} sin conectar.`,
        );
      } else if (terminals[handle].length > 1) {
        addUniqueIssue(
          issues,
          `${component.label || "Un componente"} tiene más de un cable en el mismo terminal.`,
        );
      }
    }

    if (
      terminals.from.length === 1 &&
      terminals.to.length === 1 &&
      terminals.from[0] === terminals.to[0]
    ) {
      addUniqueIssue(
        issues,
        `${component.label || "Un componente"} no puede conectar sus dos terminales al mismo nodo.`,
      );
    }
    componentEndpoints.set(component.id, {
      from: terminals.from[0],
      to: terminals.to[0],
    });
  }

  if (issues.length > 0) return { circuit: null, issues };

  const circuitNodeId = new Map(
    junctions.map((junction) => [
      junction.id,
      junction.isGround ? "0" : junction.label.trim(),
    ]),
  );
  const circuit: Circuit = {
    nodes: junctions.map((junction) => ({
      id: circuitNodeId.get(junction.id) ?? junction.id,
      label: junction.isGround ? "Tierra" : junction.label.trim(),
    })),
    components: components.map((component) => {
      const endpoints = componentEndpoints.get(component.id);
      const base = {
        label: component.label.trim(),
        nFrom: circuitNodeId.get(endpoints?.from ?? "") ?? "",
        nTo: circuitNodeId.get(endpoints?.to ?? "") ?? "",
      };
      if (component.kind === "resistor") {
        return { ...base, type: "resistor" as const, ohms: component.value };
      }
      if (component.kind === "voltageSource") {
        return {
          ...base,
          type: "voltageSource" as const,
          volts: component.value,
        };
      }
      return {
        ...base,
        type: "currentSource" as const,
        amps: component.value,
      };
    }),
  };

  try {
    const graph = buildCircuitGraph(circuit);
    const tree = chooseSpanningTree(graph);
    if (tree.linkBranchIndices.length === 0) {
      addUniqueIssue(
        issues,
        "El circuito todavía no forma una malla cerrada. Completá el recorrido de la corriente.",
      );
    }
  } catch (error) {
    addUniqueIssue(
      issues,
      error instanceof Error
        ? error.message
        : "Los nodos y las ramas no forman una red consistente.",
    );
  }

  return issues.length > 0 ? { circuit: null, issues } : { circuit, issues };
}
