"use client";

import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MiniMap,
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
  OnSelectionChangeParams,
  XYPosition,
} from "@xyflow/react";
import { AlertTriangle, CheckCircle2, MousePointer2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AnimatedWire } from "@/components/circuit/AnimatedWire";
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

const STORAGE_KEY = "circuitos-cc:constructor:v1";

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
): ConstructorFlowNode {
  const id = `builder:${kind}:${crypto.randomUUID()}`;
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
    },
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

function normalizeConnection(
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

  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null;
  const selectedEdge = edges.find((edge) => edge.id === selectedEdgeId) ?? null;

  const addNodeAt = useCallback(
    (kind: ConstructorNodeKind, position: XYPosition) => {
      setNodes((current) => [
        ...current,
        createConstructorNode(kind, position, current),
      ]);
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
      setNodes((current) => {
        const position = findNearbyPosition(kind, visibleCenter, current);
        return [...current, createConstructorNode(kind, position, current)];
      });
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
    (connection) => {
      const normalized = normalizeConnection(connection, nodes);
      if (!normalized) return false;
      const componentId =
        normalized.targetHandle === "from"
          ? normalized.target
          : normalized.source;
      const componentHandle =
        normalized.targetHandle === "from" ? "from" : "to";
      return !edges.some((edge) => {
        if (edge.source === componentId) {
          return edge.sourceHandle === componentHandle;
        }
        if (edge.target === componentId) {
          return edge.targetHandle === componentHandle;
        }
        return false;
      });
    },
    [edges, nodes],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const normalized = normalizeConnection(connection, nodes);
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

  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setStorageMessage("Canvas limpio. El circuito guardado sigue disponible.");
  }, []);

  const displayedIssues =
    nodes.length === 0
      ? [
          "Arrastrá componentes y nodos al canvas. El primer nodo de unión se usa como tierra.",
        ]
      : calculation.error
        ? [
            "La red está cerrada, pero el sistema todavía no tiene una solución física única.",
            calculation.error,
          ]
        : validation.issues;
  const circuitKey = validation.circuit
    ? validation.circuit.nodes.map((node) => node.id).join("|")
    : "invalid";

  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
      <ConstructorSidebar
        selectedNode={selectedNode}
        selectedEdge={selectedEdge}
        storageMessage={storageMessage}
        onAdd={addFromPalette}
        onUpdateLabel={updateSelectedLabel}
        onUpdateValue={updateSelectedValue}
        onSetGround={setSelectedAsGround}
        onRotate={rotateSelected}
        onDeleteSelection={deleteSelection}
        onSave={saveCircuit}
        onLoad={loadCircuit}
        onClear={clearCanvas}
      />

      <div className="min-w-0">
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
            nodes={nodes}
            edges={displayedEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
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
            <MiniMap
              pannable
              zoomable
              nodeColor={(node) =>
                node.type === "source"
                  ? "#fbbf24"
                  : node.type === "resistor"
                    ? "#22d3ee"
                    : "#c4b5fd"
              }
              nodeStrokeColor="#020617"
              nodeBorderRadius={10}
              maskColor="rgba(2, 6, 23, 0.72)"
              bgColor="#0f172a"
            />
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
            <Panel position="top-right" className="m-4! hidden sm:block">
              <div className="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-950/85 px-3 py-2 text-[11px] text-slate-400 shadow-xl backdrop-blur-md">
                <MousePointer2 className="size-3.5 text-cyan-300" />
                Uní cada terminal con un nodo
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {calculation.result && validation.circuit ? (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-lime-400/25 bg-lime-400/[0.06] p-4 text-sm text-lime-100">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-lime-300" />
            <div>
              <p className="font-medium">Circuito válido y resuelto.</p>
              <p className="mt-1 text-lime-100/65">
                Los resultados y la animación se actualizan al editar valores.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-4 text-sm text-amber-100">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-300" />
            <div>
              <p className="font-medium">
                El circuito todavía está incompleto.
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-100/70">
                {displayedIssues.slice(0, 5).map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

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
