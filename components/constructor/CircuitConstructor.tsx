"use client";

import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useUpdateNodeInternals,
} from "@xyflow/react";
import type {
  Connection,
  EdgeChange,
  EdgeTypes,
  IsValidConnection,
  NodeChange,
  NodeTypes,
  OnConnectEnd,
  OnConnectStart,
  OnSelectionChangeParams,
  XYPosition,
} from "@xyflow/react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  MousePointer2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AnimatedWire } from "@/components/circuit/AnimatedWire";
import { CircuitMiniMap } from "@/components/circuit/CircuitMiniMap";
import { JunctionNode } from "@/components/circuit/JunctionNode";
import { ResistorNode } from "@/components/circuit/ResistorNode";
import { SourceNode } from "@/components/circuit/SourceNode";
import { ResultsPanel } from "@/components/results/ResultsPanel";
import { SolutionSteps } from "@/components/steps/SolutionSteps";
import {
  editableGraphToCircuit,
  type EditableCircuitConnection,
  type EditableCircuitNode,
} from "@/lib/engine/graph";
import { solveCircuit } from "@/lib/engine/kirchhoff";
import { buildSolutionSteps } from "@/lib/engine/steps";

import { ConstructorSidebar } from "./ConstructorSidebar";
import { createSimpleConstructorExample } from "./constructor-example";
import { getConstructorFeedback } from "./constructor-feedback";
import type {
  ConstructorFlowEdge,
  ConstructorFlowNode,
  ConstructorNodeKind,
  SavedConstructorCircuit,
} from "./constructor-types";
import {
  componentOrientation,
  nextComponentRotation,
} from "./constructor-types";
import {
  getConstructorProgress,
  isConstructorConnectionAllowed,
  normalizeConstructorConnection,
} from "./constructor-guidance";

const STORAGE_KEY = "circuitos-cc:constructor:v1";

type ExampleLoadConfirmation = {
  hasCanvasCircuit: boolean;
  hasSavedCircuit: boolean;
};

const nodeTypes = {
  resistor: ResistorNode,
  source: SourceNode,
  junction: JunctionNode,
} satisfies NodeTypes;

const edgeTypes = {
  animatedWire: AnimatedWire,
} satisfies EdgeTypes;

function isConstructorNodeKind(value: string): value is ConstructorNodeKind {
  return ["resistor", "voltageSource", "currentSource", "junction"].includes(
    value,
  );
}

function nextLabel(
  nodes: ConstructorFlowNode[],
  prefix: "R" | "E" | "I" | "N",
): string {
  const labels = new Set(nodes.map((node) => node.data.label));
  let index = 1;
  while (labels.has(`${prefix}${index}`)) index += 1;
  return `${prefix}${index}`;
}

function formatValue(value: number, unit: "Ω" | "V" | "A"): string {
  return `${new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 3,
  }).format(value)} ${unit}`;
}

function createConstructorNode(
  kind: ConstructorNodeKind,
  position: XYPosition,
  nodes: ConstructorFlowNode[],
  id = `builder:${kind}:${crypto.randomUUID()}`,
): ConstructorFlowNode {
  if (kind === "junction") {
    const isGround = !nodes.some(
      (node) => node.data.builderKind === "junction" && node.data.isGround,
    );
    return {
      id,
      type: "junction",
      position,
      data: {
        builderKind: "junction",
        label: isGround ? "0" : nextLabel(nodes, "N"),
        isGround,
      },
      initialWidth: 44,
      initialHeight: 44,
      zIndex: 3,
    };
  }

  if (kind === "resistor") {
    return {
      id,
      type: "resistor",
      position,
      data: {
        builderKind: "resistor",
        label: nextLabel(nodes, "R"),
        numericValue: 10,
        value: formatValue(10, "Ω"),
        orientation: componentOrientation,
        reversed: false,
      },
      initialWidth: 180,
      initialHeight: 104,
      zIndex: 2,
    };
  }

  const isVoltage = kind === "voltageSource";
  const numericValue = isVoltage ? 9 : 1;
  return {
    id,
    type: "source",
    position,
    data: {
      builderKind: kind,
      label: nextLabel(nodes, isVoltage ? "E" : "I"),
      numericValue,
      value: formatValue(numericValue, isVoltage ? "V" : "A"),
      sourceType: isVoltage ? "voltage" : "current",
      orientation: componentOrientation,
      reversed: false,
      ...(isVoltage ? { voltagePolarity: "positive" as const } : {}),
    },
    initialWidth: 180,
    initialHeight: 104,
    zIndex: 2,
  };
}

function findNearbyPosition(
  kind: ConstructorNodeKind,
  center: XYPosition,
  nodes: ConstructorFlowNode[],
): XYPosition {
  const width = kind === "junction" ? 44 : 180;
  const height = kind === "junction" ? 44 : 104;
  const base = { x: center.x - width / 2, y: center.y - height / 2 };
  const offsets = [
    { x: 0, y: 0 },
    { x: 220, y: 0 },
    { x: -220, y: 0 },
    { x: 0, y: 150 },
    { x: 0, y: -150 },
    { x: 220, y: 150 },
    { x: -220, y: 150 },
    { x: 220, y: -150 },
    { x: -220, y: -150 },
  ];

  return (
    offsets
      .map((offset) => ({ x: base.x + offset.x, y: base.y + offset.y }))
      .find((candidate) =>
        nodes.every(
          (node) =>
            Math.abs(node.position.x - candidate.x) > 195 ||
            Math.abs(node.position.y - candidate.y) > 125,
        ),
      ) ?? {
      x: base.x + ((nodes.length % 4) - 1.5) * 205,
      y: base.y + (Math.floor(nodes.length / 4) + 1) * 145,
    }
  );
}

function asEditableNode(node: ConstructorFlowNode): EditableCircuitNode {
  if (node.data.builderKind === "junction") {
    return {
      id: node.id,
      kind: "junction",
      label: node.data.label,
      isGround: node.data.isGround,
    };
  }
  return {
    id: node.id,
    kind: node.data.builderKind,
    label: node.data.label,
    value: node.data.numericValue,
  };
}

function asEditableConnection(
  edge: ConstructorFlowEdge,
): EditableCircuitConnection {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
  };
}

function isSavedConstructorCircuit(
  value: unknown,
): value is SavedConstructorCircuit {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as {
    version?: unknown;
    nodes?: unknown;
    edges?: unknown;
  };
  if (
    candidate.version !== 1 ||
    !Array.isArray(candidate.nodes) ||
    !Array.isArray(candidate.edges)
  ) {
    return false;
  }
  const validNodes = candidate.nodes.every((node) => {
    if (typeof node !== "object" || node === null) return false;
    const record = node as {
      id?: unknown;
      type?: unknown;
      position?: { x?: unknown; y?: unknown };
      data?: {
        builderKind?: unknown;
        label?: unknown;
        isGround?: unknown;
        numericValue?: unknown;
        value?: unknown;
        orientation?: unknown;
        reversed?: unknown;
        sourceType?: unknown;
      };
    };
    if (
      typeof record.id === "string" &&
      typeof record.data?.builderKind === "string" &&
      isConstructorNodeKind(record.data.builderKind) &&
      typeof record.data.label === "string" &&
      Number.isFinite(record.position?.x) &&
      Number.isFinite(record.position?.y)
    ) {
      if (record.data.builderKind === "junction") {
        return (
          record.type === "junction" &&
          typeof record.data.isGround === "boolean"
        );
      }
      return (
        (record.type === "resistor" || record.type === "source") &&
        typeof record.data.numericValue === "number" &&
        Number.isFinite(record.data.numericValue) &&
        typeof record.data.value === "string" &&
        (record.data.orientation === "horizontal" ||
          record.data.orientation === "vertical") &&
        typeof record.data.reversed === "boolean" &&
        (record.data.builderKind === "resistor" ||
          record.data.sourceType === "voltage" ||
          record.data.sourceType === "current")
      );
    }
    return false;
  });
  if (!validNodes) return false;

  return candidate.edges.every((edge) => {
    if (typeof edge !== "object" || edge === null) return false;
    const record = edge as {
      id?: unknown;
      source?: unknown;
      target?: unknown;
      sourceHandle?: unknown;
      targetHandle?: unknown;
    };
    return (
      typeof record.id === "string" &&
      typeof record.source === "string" &&
      typeof record.target === "string" &&
      (record.sourceHandle === null ||
        record.sourceHandle === undefined ||
        typeof record.sourceHandle === "string") &&
      (record.targetHandle === null ||
        record.targetHandle === undefined ||
        typeof record.targetHandle === "string")
    );
  });
}

function ConstructorWorkspace() {
  const [nodes, setNodes] = useState<ConstructorFlowNode[]>([]);
  const [edges, setEdges] = useState<ConstructorFlowEdge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [storageMessage, setStorageMessage] = useState<string | null>(null);
  const [exampleLoadConfirmation, setExampleLoadConfirmation] =
    useState<ExampleLoadConfirmation | null>(null);
  const [activeConnection, setActiveConnection] = useState<{
    nodeId: string;
    handleId: string;
  } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { fitView, screenToFlowPosition } = useReactFlow<
    ConstructorFlowNode,
    ConstructorFlowEdge
  >();
  const updateNodeInternals = useUpdateNodeInternals();

  const validation = useMemo(
    () =>
      editableGraphToCircuit(
        nodes.map(asEditableNode),
        edges.map(asEditableConnection),
      ),
    [edges, nodes],
  );

  const calculation = useMemo(() => {
    if (!validation.circuit) {
      return { result: null, steps: [], error: null };
    }
    try {
      const result = solveCircuit(validation.circuit);
      return {
        result,
        steps: buildSolutionSteps(validation.circuit, result),
        error: null,
      };
    } catch (error) {
      return {
        result: null,
        steps: [],
        error:
          error instanceof Error
            ? error.message
            : "No se pudo resolver la red armada.",
      };
    }
  }, [validation.circuit]);

  const maximumCurrent = Math.max(
    0,
    ...Object.values(calculation.result?.branchCurrents ?? {}).map((current) =>
      Math.abs(current),
    ),
  );
  const displayedEdges = useMemo(
    () =>
      edges.map((edge) => {
        const componentNode = nodes.find(
          (node) =>
            (node.id === edge.source || node.id === edge.target) &&
            node.data.builderKind !== "junction",
        );
        const branchLabel = componentNode?.data.label ?? "Rama";
        const current = calculation.result?.branchCurrents[branchLabel] ?? 0;
        return {
          ...edge,
          type: "animatedWire" as const,
          data: {
            ...(edge.data ?? {}),
            branchLabel,
            current,
            normalizedMagnitude:
              maximumCurrent > 0 ? Math.abs(current) / maximumCurrent : 0,
          },
        };
      }),
    [calculation.result?.branchCurrents, edges, maximumCurrent, nodes],
  );

  const feedback = useMemo(
    () =>
      getConstructorFeedback(
        nodes,
        edges,
        validation.issues,
        validation.circuit !== null,
        calculation.error,
      ),
    [calculation.error, edges, nodes, validation.circuit, validation.issues],
  );

  const displayedNodes = useMemo(() => {
    const feedbackNodeIds = new Set(feedback?.nodeIds ?? []);
    const nodesWithFeedback = nodes.map((node) =>
      feedbackNodeIds.has(node.id)
        ? ({
            ...node,
            data: {
              ...node.data,
              validationHint: feedback?.kind,
            },
          } as ConstructorFlowNode)
        : node,
    );

    if (!activeConnection) return nodesWithFeedback;
    const originNode = nodesWithFeedback.find(
      (node) => node.id === activeConnection.nodeId,
    );
    if (!originNode) return nodesWithFeedback;

    const originIsJunction = originNode.data.builderKind === "junction";
    const junctionHandles = ["top", "right", "bottom", "left"];
    const componentHandles = ["from", "to"];

    return nodesWithFeedback.map((node) => {
      if (node.id === activeConnection.nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            connectionActive: true,
            connectionHint: "origin" as const,
            connectionOriginHandle: activeConnection.handleId,
            connectionHintMessage: originIsJunction
              ? "Conectá este nodo con un terminal libre resaltado."
              : "Cada terminal se conecta a un nodo resaltado.",
          },
        } as ConstructorFlowNode;
      }

      let validTargetHandles: string[] = [];
      if (originIsJunction && node.data.builderKind !== "junction") {
        validTargetHandles = componentHandles.filter((handleId) =>
          isConstructorConnectionAllowed(
            {
              source: originNode.id,
              sourceHandle: activeConnection.handleId,
              target: node.id,
              targetHandle: handleId,
            },
            nodes,
            edges,
          ),
        );
      } else if (
        !originIsJunction &&
        node.data.builderKind === "junction"
      ) {
        validTargetHandles = junctionHandles.filter((handleId) =>
          isConstructorConnectionAllowed(
            {
              source: originNode.id,
              sourceHandle: activeConnection.handleId,
              target: node.id,
              targetHandle: handleId,
            },
            nodes,
            edges,
          ),
        );
      }

      return {
        ...node,
        data: {
          ...node.data,
          connectionActive: true,
          connectionHint:
            validTargetHandles.length > 0
              ? ("valid" as const)
              : ("invalid" as const),
          validTargetHandles,
        },
      } as ConstructorFlowNode;
    });
  }, [activeConnection, edges, feedback, nodes]);

  const progress = useMemo(
    () =>
      getConstructorProgress(
        nodes,
        edges,
        validation.circuit !== null,
        calculation.result !== null,
      ),
    [calculation.result, edges, nodes, validation.circuit],
  );

  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null;
  const selectedEdge = edges.find((edge) => edge.id === selectedEdgeId) ?? null;

  const addNodeAt = useCallback(
    (kind: ConstructorNodeKind, position: XYPosition) => {
      const nodeId = `builder:${kind}:${crypto.randomUUID()}`;
      setNodes((current) => [
        ...current.map((node) => ({ ...node, selected: false })),
        {
          ...createConstructorNode(kind, position, current, nodeId),
          selected: true,
        },
      ]);
      setSelectedNodeId(nodeId);
      setSelectedEdgeId(null);
      setStorageMessage(null);
    },
    [],
  );

  const addFromPalette = useCallback(
    (kind: ConstructorNodeKind) => {
      const bounds = canvasRef.current?.getBoundingClientRect();
      const visibleCenter = bounds
        ? screenToFlowPosition({
            x: bounds.left + bounds.width / 2,
            y: bounds.top + bounds.height / 2,
          })
        : { x: 320, y: 240 };
      const nodeId = `builder:${kind}:${crypto.randomUUID()}`;
      setNodes((current) => {
        const position = findNearbyPosition(kind, visibleCenter, current);
        return [
          ...current.map((node) => ({ ...node, selected: false })),
          {
            ...createConstructorNode(kind, position, current, nodeId),
            selected: true,
          },
        ];
      });
      setSelectedNodeId(nodeId);
      setSelectedEdgeId(null);
      setStorageMessage(null);
    },
    [screenToFlowPosition],
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const kind = event.dataTransfer.getData("application/reactflow");
      if (!isConstructorNodeKind(kind)) return;
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      addNodeAt(kind, {
        x: position.x - (kind === "junction" ? 22 : 90),
        y: position.y - (kind === "junction" ? 22 : 52),
      });
    },
    [addNodeAt, screenToFlowPosition],
  );

  const onNodesChange = useCallback(
    (changes: NodeChange<ConstructorFlowNode>[]) => {
      const removedIds = new Set(
        changes
          .filter((change) => change.type === "remove")
          .map((change) => change.id),
      );
      setNodes((current) => applyNodeChanges(changes, current));
      if (removedIds.size > 0) {
        setEdges((current) =>
          current.filter(
            (edge) =>
              !removedIds.has(edge.source) && !removedIds.has(edge.target),
          ),
        );
        if (selectedNodeId && removedIds.has(selectedNodeId)) {
          setSelectedNodeId(null);
        }
      }
    },
    [selectedNodeId],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<ConstructorFlowEdge>[]) => {
      setEdges((current) => applyEdgeChanges(changes, current));
      if (
        selectedEdgeId &&
        changes.some(
          (change) => change.type === "remove" && change.id === selectedEdgeId,
        )
      ) {
        setSelectedEdgeId(null);
      }
    },
    [selectedEdgeId],
  );

  const isValidConnection = useCallback<IsValidConnection<ConstructorFlowEdge>>(
    (connection) =>
      isConstructorConnectionAllowed(connection, nodes, edges),
    [edges, nodes],
  );

  const onConnectStart = useCallback<OnConnectStart>((_event, params) => {
    if (!params.nodeId || !params.handleId) {
      setActiveConnection(null);
      return;
    }
    setActiveConnection({
      nodeId: params.nodeId,
      handleId: params.handleId,
    });
  }, []);

  const onConnectEnd = useCallback<OnConnectEnd>(() => {
    setActiveConnection(null);
  }, []);

  const onConnect = useCallback(
    (connection: Connection) => {
      const normalized = normalizeConstructorConnection(connection, nodes);
      if (!normalized || !isValidConnection(connection)) return;
      const componentNode = nodes.find(
        (node) =>
          (node.id === normalized.source || node.id === normalized.target) &&
          node.data.builderKind !== "junction",
      );
      const edge: ConstructorFlowEdge = {
        id: `wire:${crypto.randomUUID()}`,
        ...normalized,
        type: "animatedWire",
        data: {
          branchLabel: componentNode?.data.label ?? "Rama",
          current: 0,
          normalizedMagnitude: 0,
        },
      };
      setEdges((current) => addEdge(edge, current));
      setStorageMessage(null);
    },
    [isValidConnection, nodes],
  );

  const onSelectionChange = useCallback(
    ({
      nodes: selectedNodes,
      edges: selectedEdges,
    }: OnSelectionChangeParams<ConstructorFlowNode, ConstructorFlowEdge>) => {
      const nodeId = selectedNodes[0]?.id ?? null;
      setSelectedNodeId(nodeId);
      setSelectedEdgeId(nodeId ? null : (selectedEdges[0]?.id ?? null));
    },
    [],
  );

  const updateSelectedLabel = useCallback(
    (label: string) => {
      if (!selectedNodeId) return;
      setNodes(
        (current) =>
          current.map((node) =>
            node.id === selectedNodeId
              ? { ...node, data: { ...node.data, label } }
              : node,
          ) as ConstructorFlowNode[],
      );
    },
    [selectedNodeId],
  );

  const updateSelectedValue = useCallback(
    (value: number) => {
      if (!selectedNodeId) return;
      setNodes((current) =>
        current.map((node) => {
          if (
            node.id !== selectedNodeId ||
            node.data.builderKind === "junction"
          ) {
            return node;
          }
          const boundedValue =
            node.data.builderKind === "resistor"
              ? Math.min(1000, Math.max(0.1, value))
              : Math.min(1000, Math.max(-1000, value));
          const unit =
            node.data.builderKind === "resistor"
              ? "Ω"
              : node.data.builderKind === "voltageSource"
                ? "V"
                : "A";
          return {
            ...node,
            data: {
              ...node.data,
              numericValue: boundedValue,
              value: formatValue(boundedValue, unit),
              ...(node.data.builderKind === "voltageSource"
                ? {
                    voltagePolarity:
                      boundedValue > 0
                        ? ("positive" as const)
                        : boundedValue < 0
                          ? ("negative" as const)
                          : ("neutral" as const),
                  }
                : {}),
            },
          } as ConstructorFlowNode;
        }),
      );
    },
    [selectedNodeId],
  );

  const setSelectedAsGround = useCallback(() => {
    if (!selectedNodeId) return;
    setNodes((current) => {
      const replacementLabel = nextLabel(current, "N");
      return current.map((node) => {
        if (node.data.builderKind !== "junction") return node;
        if (node.id === selectedNodeId) {
          return {
            ...node,
            data: { ...node.data, label: "0", isGround: true },
          };
        }
        if (node.data.isGround) {
          return {
            ...node,
            data: {
              ...node.data,
              label: replacementLabel,
              isGround: false,
            },
          };
        }
        return node;
      }) as ConstructorFlowNode[];
    });
  }, [selectedNodeId]);

  const rotateSelected = useCallback(() => {
    if (!selectedNodeId) return;
    setNodes((current) =>
      current.map((node) => {
        if (
          node.id !== selectedNodeId ||
          node.data.builderKind === "junction"
        ) {
          return node;
        }
        const rotation = nextComponentRotation(
          node.data.orientation,
          node.data.reversed,
        );
        return {
          ...node,
          data: {
            ...node.data,
            ...rotation,
          },
        } as ConstructorFlowNode;
      }),
    );
    requestAnimationFrame(() => updateNodeInternals(selectedNodeId));
  }, [selectedNodeId, updateNodeInternals]);

  useEffect(() => {
    const rotateWithKeyboard = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== "r" ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey
      ) {
        return;
      }
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }
      const selected = nodes.find((node) => node.id === selectedNodeId);
      if (!selected || selected.data.builderKind === "junction") return;
      event.preventDefault();
      rotateSelected();
    };
    window.addEventListener("keydown", rotateWithKeyboard);
    return () => window.removeEventListener("keydown", rotateWithKeyboard);
  }, [nodes, rotateSelected, selectedNodeId]);

  const deleteSelection = useCallback(() => {
    if (selectedNodeId) {
      setNodes((current) =>
        current.filter((node) => node.id !== selectedNodeId),
      );
      setEdges((current) =>
        current.filter(
          (edge) =>
            edge.source !== selectedNodeId && edge.target !== selectedNodeId,
        ),
      );
      setSelectedNodeId(null);
    } else if (selectedEdgeId) {
      setEdges((current) =>
        current.filter((edge) => edge.id !== selectedEdgeId),
      );
      setSelectedEdgeId(null);
    }
  }, [selectedEdgeId, selectedNodeId]);

  const saveCircuit = useCallback(() => {
    try {
      const saved: SavedConstructorCircuit = {
        version: 1,
        nodes: nodes.map((node) => ({ ...node, selected: false })),
        edges: edges.map((edge) => ({ ...edge, selected: false })),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      setStorageMessage("Circuito guardado en este navegador.");
    } catch {
      setStorageMessage("No se pudo guardar el circuito en este navegador.");
    }
  }, [edges, nodes]);

  const loadCircuit = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setStorageMessage("Todavía no hay un circuito guardado.");
        return;
      }
      const saved: unknown = JSON.parse(raw);
      if (!isSavedConstructorCircuit(saved)) {
        setStorageMessage("El circuito guardado no tiene un formato válido.");
        return;
      }
      setNodes(saved.nodes.map((node) => ({ ...node, selected: false })));
      setEdges(saved.edges.map((edge) => ({ ...edge, selected: false })));
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setStorageMessage("Circuito cargado correctamente.");
      requestAnimationFrame(() =>
        fitView({ padding: 0.18, maxZoom: 1.15, duration: 300 }),
      );
    } catch {
      setStorageMessage("No se pudo cargar el circuito guardado.");
    }
  }, [fitView]);

  const applyExample = useCallback(() => {
    const example = createSimpleConstructorExample();
    setNodes(example.nodes);
    setEdges(example.edges);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setActiveConnection(null);
    setExampleLoadConfirmation(null);
    setStorageMessage(
      "Ejemplo cargado. El circuito guardado sigue disponible sin cambios.",
    );
    requestAnimationFrame(() =>
      fitView({ padding: 0.18, maxZoom: 1.15, duration: 300 }),
    );
  }, [fitView]);

  const requestExample = useCallback(() => {
    let hasSavedCircuit = false;
    try {
      hasSavedCircuit = localStorage.getItem(STORAGE_KEY) !== null;
    } catch {
      // Si el almacenamiento no está disponible, el ejemplo sigue siendo usable.
    }
    const hasCanvasCircuit = nodes.length > 0 || edges.length > 0;
    if (!hasCanvasCircuit && !hasSavedCircuit) {
      applyExample();
      return;
    }
    setExampleLoadConfirmation({ hasCanvasCircuit, hasSavedCircuit });
  }, [applyExample, edges.length, nodes.length]);

  useEffect(() => {
    if (!exampleLoadConfirmation) return;
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExampleLoadConfirmation(null);
    };
    window.addEventListener("keydown", closeWithEscape);
    return () => window.removeEventListener("keydown", closeWithEscape);
  }, [exampleLoadConfirmation]);

  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setStorageMessage("Canvas limpio. El circuito guardado sigue disponible.");
  }, []);

  const isEmptyCircuit = nodes.length === 0;
  const circuitKey = validation.circuit
    ? validation.circuit.nodes.map((node) => node.id).join("|")
    : "invalid";
  const progressItems = [
    {
      label: "Agregar componentes y dos nodos",
      complete: progress.basicsAdded,
    },
    {
      label: "Conectar cada terminal a un nodo",
      complete: progress.terminalsConnected,
    },
    {
      label: "Cerrar la red y definir tierra",
      complete: progress.networkClosed,
    },
    { label: "Resolver", complete: progress.solved },
  ];
  const nextProgressStep = progressItems.findIndex((item) => !item.complete);
  const sidebarProps = {
    selectedNode,
    selectedEdge,
    storageMessage,
    onAdd: addFromPalette,
    onUpdateLabel: updateSelectedLabel,
    onUpdateValue: updateSelectedValue,
    onSetGround: setSelectedAsGround,
    onRotate: rotateSelected,
    onDeleteSelection: deleteSelection,
    onLoadExample: requestExample,
    onSave: saveCircuit,
    onLoad: loadCircuit,
    onClear: clearCanvas,
  };

  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[18rem_minmax(0,1fr)_22rem] xl:items-start">
      <div className="order-2 min-w-0 xl:order-1">
        <ConstructorSidebar {...sidebarProps} section="palette" />
      </div>

      <div className="order-1 min-w-0 xl:order-2">
        <div
          ref={canvasRef}
          onDrop={onDrop}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
          }}
          className="circuit-flow relative h-[min(760px,calc(100vh-10rem))] min-h-[620px] w-full overflow-hidden rounded-3xl border border-slate-800 bg-[#080d18] shadow-2xl shadow-black/30"
        >
          <ReactFlow<ConstructorFlowNode, ConstructorFlowEdge>
            nodes={displayedNodes}
            edges={displayedEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            onSelectionChange={onSelectionChange}
            isValidConnection={isValidConnection}
            connectionMode={ConnectionMode.Loose}
            deleteKeyCode={["Backspace", "Delete"]}
            nodesDraggable
            nodesConnectable
            elementsSelectable
            panOnDrag
            zoomOnScroll
            zoomOnPinch
            minZoom={0.3}
            maxZoom={2}
            colorMode="dark"
            aria-label="Constructor de circuitos"
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={28}
              size={1.35}
              color="#263449"
            />
            <CircuitMiniMap />
            <Controls position="bottom-left" showInteractive={false} />
            <Panel position="top-left" className="m-4!">
              <div className="rounded-xl border border-slate-700/80 bg-slate-950/85 px-4 py-3 shadow-xl backdrop-blur-md">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                  Circuito propio
                </p>
                <p className="mt-1 font-mono text-[11px] text-slate-500">
                  {nodes.length} elementos · {edges.length} cables
                </p>
              </div>
            </Panel>
            <Panel
              position="top-right"
              className="m-4! hidden w-[min(17rem,calc(100%-2rem))] sm:block"
            >
              <div
                className="rounded-2xl border border-slate-700/80 bg-slate-950/92 p-3.5 shadow-xl backdrop-blur-md"
                aria-label="Progreso del armado"
              >
                <div className="flex items-start gap-2.5">
                  <MousePointer2 className="mt-0.5 size-4 shrink-0 text-cyan-300" />
                  <div>
                    <p className="text-xs font-semibold text-slate-100">
                      Armado del circuito
                    </p>
                    <p className="mt-0.5 text-[10px] leading-4 text-slate-500">
                      Cada terminal se conecta a un nodo.
                    </p>
                  </div>
                </div>
                <ol className="mt-3 space-y-2">
                  {progressItems.map((item, index) => {
                    const isCurrent = index === nextProgressStep;
                    return (
                      <li
                        key={item.label}
                        className={`flex items-start gap-2 rounded-lg px-2 py-1.5 text-[10px] leading-4 ${
                          item.complete
                            ? "bg-lime-400/[0.07] text-lime-200"
                            : isCurrent
                              ? "bg-cyan-400/[0.08] text-cyan-100"
                              : "text-slate-500"
                        }`}
                      >
                        {item.complete ? (
                          <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-lime-300" />
                        ) : (
                          <CircleDashed
                            className={`mt-0.5 size-3.5 shrink-0 ${
                              isCurrent ? "text-cyan-300" : "text-slate-600"
                            }`}
                          />
                        )}
                        <span>
                          <span className="mr-1 font-mono text-[9px] opacity-70">
                            {index + 1}.
                          </span>
                          {item.label}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </Panel>
            {feedback ? (
              <Panel
                position="bottom-left"
                className="z-10! m-4! w-[min(34rem,calc(100%-2rem))] sm:ml-16! sm:w-[min(34rem,calc(100%-19rem))]"
              >
                <div
                  role={feedback.kind === "unsolvable" ? "alert" : "status"}
                  aria-live="polite"
                  className={`flex items-start gap-3 rounded-2xl border p-3.5 shadow-2xl backdrop-blur-md ${
                    feedback.kind === "unsolvable"
                      ? "border-rose-400/35 bg-slate-950/95 text-rose-100 shadow-rose-950/30"
                      : "border-amber-400/30 bg-slate-950/95 text-amber-100 shadow-amber-950/25"
                  }`}
                >
                  <AlertTriangle
                    className={`mt-0.5 size-5 shrink-0 ${
                      feedback.kind === "unsolvable"
                        ? "text-rose-300"
                        : "text-amber-300"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{feedback.title}</p>
                    <p className="mt-1 text-xs leading-5 text-current/75">
                      {feedback.message}
                    </p>
                  </div>
                </div>
              </Panel>
            ) : null}
          </ReactFlow>
        </div>
      </div>

      <div className="order-3 min-w-0">
        <ConstructorSidebar {...sidebarProps} section="properties" />
      </div>

      <div className="order-4 min-w-0 xl:col-span-3">
        {calculation.result && validation.circuit ? (
          <div className="flex items-start gap-3 rounded-2xl border border-lime-400/25 bg-lime-400/[0.06] p-4 text-sm text-lime-100">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-lime-300" />
            <div>
              <p className="font-medium">Circuito válido y resuelto.</p>
              <p className="mt-1 text-lime-100/65">
                Los resultados y la animación se actualizan al editar valores.
              </p>
            </div>
          </div>
        ) : isEmptyCircuit ? (
          <div
            role="status"
            className="flex items-start gap-3 rounded-2xl border border-slate-700 bg-slate-900/65 p-4 text-sm text-slate-200"
          >
            <CircleDashed className="mt-0.5 size-5 shrink-0 text-cyan-300" />
            <div>
              <p className="font-medium">Todavía no hay un circuito.</p>
              <p className="mt-1 leading-6 text-slate-300">
                Agregá un nodo de unión y conectá los componentes. El primer
                nodo se usa como tierra.
              </p>
            </div>
          </div>
        ) : null}

        {calculation.result && validation.circuit ? (
          <>
            <ResultsPanel
              key={circuitKey}
              circuit={validation.circuit}
              result={calculation.result}
            />
            <SolutionSteps steps={calculation.steps} />
          </>
        ) : null}
      </div>

      {exampleLoadConfirmation ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setExampleLoadConfirmation(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="example-confirmation-title"
            aria-describedby="example-confirmation-description"
            className="app-surface w-full max-w-md border-amber-400/25 p-5 shadow-2xl shadow-black/50"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-amber-400/25 bg-amber-400/[0.08] text-amber-300">
                <AlertTriangle className="size-5" />
              </span>
              <div>
                <h2
                  id="example-confirmation-title"
                  className="font-semibold text-slate-100"
                >
                  ¿Cargar el circuito de ejemplo?
                </h2>
                <p
                  id="example-confirmation-description"
                  className="mt-1 text-sm leading-6 text-slate-400"
                >
                  {exampleLoadConfirmation.hasCanvasCircuit
                    ? "El ejemplo reemplazará el circuito que está en pantalla."
                    : "El ejemplo se cargará en el canvas."} {" "}
                  {exampleLoadConfirmation.hasSavedCircuit
                    ? "Tu circuito guardado seguirá disponible y no se modificará."
                    : "Esta acción no crea ni modifica un circuito guardado."}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                autoFocus
                onClick={() => setExampleLoadConfirmation(null)}
                className="app-button-secondary h-10 px-4 text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={applyExample}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-lime-400/25 bg-lime-400/[0.08] px-4 text-xs font-semibold text-lime-200 transition hover:bg-lime-400/15"
              >
                Reemplazar y cargar ejemplo
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

export function CircuitConstructor() {
  return (
    <ReactFlowProvider>
      <ConstructorWorkspace />
    </ReactFlowProvider>
  );
}
