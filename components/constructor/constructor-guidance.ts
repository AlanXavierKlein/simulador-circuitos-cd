import type { Connection } from "@xyflow/react";

import type {
  ConstructorFlowEdge,
  ConstructorFlowNode,
} from "./constructor-types";

type NormalizedConnectionParts = {
  connection: Connection;
  componentId: string;
  componentHandle: "from" | "to";
  junctionId: string;
};

export type ConstructorProgress = {
  basicsAdded: boolean;
  terminalsConnected: boolean;
  networkClosed: boolean;
  solved: boolean;
};

export function normalizeConstructorConnection(
  connection: Connection | ConstructorFlowEdge,
  nodes: ConstructorFlowNode[],
): Connection | null {
  const sourceNode = nodes.find((node) => node.id === connection.source);
  const targetNode = nodes.find((node) => node.id === connection.target);
  if (!sourceNode || !targetNode) return null;

  const sourceIsJunction = sourceNode.data.builderKind === "junction";
  const targetIsJunction = targetNode.data.builderKind === "junction";
  if (sourceIsJunction === targetIsJunction) return null;

  const componentNode = sourceIsJunction ? targetNode : sourceNode;
  const junctionNode = sourceIsJunction ? sourceNode : targetNode;
  const componentHandle = sourceIsJunction
    ? connection.targetHandle
    : connection.sourceHandle;
  const junctionHandle = sourceIsJunction
    ? connection.sourceHandle
    : connection.targetHandle;

  if (componentHandle === "from") {
    return {
      source: junctionNode.id,
      sourceHandle: junctionHandle ?? null,
      target: componentNode.id,
      targetHandle: "from",
    };
  }
  if (componentHandle === "to") {
    return {
      source: componentNode.id,
      sourceHandle: "to",
      target: junctionNode.id,
      targetHandle: junctionHandle ?? null,
    };
  }
  return null;
}

function connectionParts(
  connection: Connection | ConstructorFlowEdge,
  nodes: ConstructorFlowNode[],
): NormalizedConnectionParts | null {
  const normalized = normalizeConstructorConnection(connection, nodes);
  if (!normalized) return null;

  if (normalized.targetHandle === "from") {
    return {
      connection: normalized,
      componentId: normalized.target,
      componentHandle: "from",
      junctionId: normalized.source,
    };
  }
  if (normalized.sourceHandle === "to") {
    return {
      connection: normalized,
      componentId: normalized.source,
      componentHandle: "to",
      junctionId: normalized.target,
    };
  }
  return null;
}

export function isConstructorConnectionAllowed(
  connection: Connection | ConstructorFlowEdge,
  nodes: ConstructorFlowNode[],
  edges: ConstructorFlowEdge[],
): boolean {
  const candidate = connectionParts(connection, nodes);
  if (!candidate) return false;

  const existingConnections = edges
    .map((edge) => connectionParts(edge, nodes))
    .filter((parts): parts is NormalizedConnectionParts => parts !== null);

  if (
    existingConnections.some(
      (parts) =>
        parts.componentId === candidate.componentId &&
        parts.componentHandle === candidate.componentHandle,
    )
  ) {
    return false;
  }

  const oppositeHandle =
    candidate.componentHandle === "from" ? "to" : "from";
  return !existingConnections.some(
    (parts) =>
      parts.componentId === candidate.componentId &&
      parts.componentHandle === oppositeHandle &&
      parts.junctionId === candidate.junctionId,
  );
}

export function getConstructorProgress(
  nodes: ConstructorFlowNode[],
  edges: ConstructorFlowEdge[],
  networkClosed: boolean,
  solved: boolean,
): ConstructorProgress {
  const components = nodes.filter(
    (node) => node.data.builderKind !== "junction",
  );
  const junctionCount = nodes.filter(
    (node) => node.data.builderKind === "junction",
  ).length;
  const basicsAdded = components.length > 0 && junctionCount >= 2;

  const terminalCounts = new Map<string, number>();
  for (const edge of edges) {
    const parts = connectionParts(edge, nodes);
    if (!parts) continue;
    const key = `${parts.componentId}:${parts.componentHandle}`;
    terminalCounts.set(key, (terminalCounts.get(key) ?? 0) + 1);
  }
  const terminalsConnected =
    basicsAdded &&
    components.every(
      (component) =>
        terminalCounts.get(`${component.id}:from`) === 1 &&
        terminalCounts.get(`${component.id}:to`) === 1,
    );

  return {
    basicsAdded,
    terminalsConnected,
    networkClosed: terminalsConnected && networkClosed,
    solved: terminalsConnected && networkClosed && solved,
  };
}

