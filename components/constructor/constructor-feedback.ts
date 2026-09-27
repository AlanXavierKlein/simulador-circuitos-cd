import type {
  ConstructorFlowEdge,
  ConstructorFlowNode,
} from "./constructor-types";

export type ConstructorFeedback = {
  kind: "incomplete" | "unsolvable";
  title: string;
  message: string;
  nodeIds: string[];
};

function componentTerminalDestinations(
  componentId: string,
  nodes: ConstructorFlowNode[],
  edges: ConstructorFlowEdge[],
): Record<"from" | "to", string[]> {
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const destinations: Record<"from" | "to", string[]> = {
    from: [],
    to: [],
  };

  for (const edge of edges) {
    const isSource = edge.source === componentId;
    const isTarget = edge.target === componentId;
    if (!isSource && !isTarget) continue;

    const handle = isSource ? edge.sourceHandle : edge.targetHandle;
    const otherId = isSource ? edge.target : edge.source;
    const otherNode = nodeById.get(otherId);
    if (
      (handle === "from" || handle === "to") &&
      otherNode?.data.builderKind === "junction"
    ) {
      destinations[handle].push(otherId);
    }
  }

  return destinations;
}

function nodesMentionedInIssue(
  nodes: ConstructorFlowNode[],
  issue: string,
): string[] {
  return nodes
    .filter((node) => {
      const label = node.data.label.trim();
      return label.length > 0 && issue.includes(label);
    })
    .map((node) => node.id);
}

export function getConstructorFeedback(
  nodes: ConstructorFlowNode[],
  edges: ConstructorFlowEdge[],
  validationIssues: string[],
  hasCompleteCircuit: boolean,
  calculationError: string | null,
): ConstructorFeedback | null {
  if (nodes.length === 0) return null;

  if (hasCompleteCircuit) {
    if (!calculationError) return null;
    const isGenericSystemError =
      /sistema de Kirchhoff|sistema no cuadrado|singular|no se pudo resolver/i.test(
        calculationError,
      );
    let nodeIds = nodesMentionedInIssue(nodes, calculationError);
    if (/cortocircuit|0\s*Ω/i.test(calculationError)) {
      const zeroResistanceIds = nodes
        .filter(
          (node) =>
            node.data.builderKind === "resistor" &&
            node.data.numericValue === 0,
        )
        .map((node) => node.id);
      nodeIds = [
        ...new Set([
          ...nodeIds.filter(
            (nodeId) =>
              nodes.find((node) => node.id === nodeId)?.data.builderKind !==
              "junction",
          ),
          ...zeroResistanceIds,
        ]),
      ];
    }
    if (nodeIds.length === 0 && isGenericSystemError) {
      nodeIds = nodes
        .filter(
          (node) =>
            node.data.builderKind === "voltageSource" ||
            node.data.builderKind === "currentSource",
        )
        .map((node) => node.id);
    }
    return {
      kind: "unsolvable",
      title: "Red completa, pero no resoluble",
      message: isGenericSystemError
        ? "Las fuentes ideales imponen condiciones incompatibles o alguna corriente queda indeterminada. Revisá fuentes en paralelo, cortocircuitos y caminos ideales sin resistencia."
        : calculationError,
      nodeIds,
    };
  }

  const components = nodes.filter(
    (node) => node.data.builderKind !== "junction",
  );
  const junctions = nodes.filter(
    (node) => node.data.builderKind === "junction",
  );

  if (components.length === 0) {
    return {
      kind: "incomplete",
      title: "Falta agregar un componente",
      message: "Agregá una resistencia o una fuente para comenzar el circuito.",
      nodeIds: [],
    };
  }
  if (junctions.length < 2) {
    return {
      kind: "incomplete",
      title: "Faltan nodos de conexión",
      message: "Agregá al menos dos nodos y conectá allí los terminales.",
      nodeIds: junctions.map((node) => node.id),
    };
  }
  if (!junctions.some((node) => node.data.isGround)) {
    return {
      kind: "incomplete",
      title: "Falta elegir el nodo tierra",
      message: "Seleccioná un nodo y usá “Usar como tierra” en Propiedades.",
      nodeIds: junctions.map((node) => node.id),
    };
  }

  for (const component of components) {
    const terminals = componentTerminalDestinations(
      component.id,
      nodes,
      edges,
    );
    for (const handle of ["from", "to"] as const) {
      if (terminals[handle].length === 0) {
        return {
          kind: "incomplete",
          title: `Falta conectar ${component.data.label}`,
          message: `Conectá su terminal ${handle === "from" ? "de entrada" : "de salida"} a un nodo resaltado.`,
          nodeIds: [component.id],
        };
      }
      if (terminals[handle].length > 1) {
        return {
          kind: "incomplete",
          title: `${component.data.label} tiene cables de más`,
          message: "Cada terminal admite un solo cable. Borrá la conexión extra.",
          nodeIds: [component.id],
        };
      }
    }
    const fromNodeId = terminals.from[0];
    const toNodeId = terminals.to[0];
    if (fromNodeId && fromNodeId === toNodeId) {
      return {
        kind: "incomplete",
        title: `${component.data.label} vuelve al mismo nodo`,
        message: "Conectá sus dos terminales a nodos distintos.",
        nodeIds: [component.id, fromNodeId],
      };
    }
  }

  if (
    !components.some(
      (node) =>
        node.data.builderKind === "voltageSource" ||
        node.data.builderKind === "currentSource",
    )
  ) {
    return {
      kind: "incomplete",
      title: "Falta una fuente",
      message: "Agregá una fuente de tensión o de corriente para energizar la red.",
      nodeIds: components.map((node) => node.id),
    };
  }

  const primaryIssue = validationIssues[0];
  if (!primaryIssue) return null;
  if (primaryIssue.toLowerCase().includes("malla")) {
    return {
      kind: "incomplete",
      title: "Falta cerrar la malla",
      message:
        "Los terminales están conectados, pero todavía no existe un recorrido cerrado para la corriente.",
      nodeIds: components.map((node) => node.id),
    };
  }

  return {
    kind: "incomplete",
    title: "El circuito todavía está incompleto",
    message: primaryIssue,
    nodeIds: nodesMentionedInIssue(nodes, primaryIssue),
  };
}
