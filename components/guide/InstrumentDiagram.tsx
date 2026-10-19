"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
} from "@xyflow/react";
import type {
  Node,
  NodeProps,
  NodeTypes,
  ReactFlowInstance,
} from "@xyflow/react";
import { useCallback, useEffect, useId, useMemo, useRef } from "react";

import { CircuitCanvasFrame } from "@/components/circuit/CircuitCanvasFrame";
import { CircuitMiniMap } from "@/components/circuit/CircuitMiniMap";

type InstrumentDiagramProps = {
  kind: "ammeter" | "voltmeter";
  scales: [number, number, number];
};

function Resistor({ x, label }: { x: number; label: string }) {
  return (
    <g>
      <path
        d={`M ${x} 94 l 14 -14 18 28 18 -28 18 28 18 -28 14 14`}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <text
        x={x + 50}
        y="64"
        textAnchor="middle"
        className="fill-slate-100 font-mono text-[17px] font-semibold"
      >
        {label}
      </text>
    </g>
  );
}

function InstrumentSchematic({ kind, scales }: InstrumentDiagramProps) {
  const isAmmeter = kind === "ammeter";
  const arrowId = useId();

  return (
    <svg
      viewBox="0 0 760 300"
      role="img"
      aria-label={
        isAmmeter
          ? "Esquema del amperímetro con shunt Ayrton"
          : "Esquema del voltímetro con resistencias multiplicadoras"
      }
      className="pointer-events-none block size-full text-cyan-300"
    >
      <defs>
        <marker
          id={arrowId}
          markerWidth="10"
          markerHeight="10"
          refX="8"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" className="fill-lime-300" />
        </marker>
      </defs>

      <line
        x1="70"
        y1="94"
        x2="120"
        y2="94"
        stroke="#64748b"
        strokeWidth="2.5"
      />
      <Resistor x={120} label="R1" />
      <line
        x1="220"
        y1="94"
        x2="270"
        y2="94"
        stroke="#64748b"
        strokeWidth="2.5"
      />
      <Resistor x={270} label="R2" />
      <line
        x1="370"
        y1="94"
        x2="420"
        y2="94"
        stroke="#64748b"
        strokeWidth="2.5"
      />
      <Resistor x={420} label="R3" />
      <line
        x1="520"
        y1="94"
        x2="690"
        y2="94"
        stroke="#64748b"
        strokeWidth="2.5"
      />

      {scales.map((scale, index) => {
        const x = [220, 370, 520][index];
        const displayScale = isAmmeter ? scales[2 - index] : scale;
        return (
          <g key={`${kind}-${index}`}>
            <circle cx={x} cy="94" r="7" className="fill-amber-300" />
            <line
              x1={x}
              y1="94"
              x2={x}
              y2="126"
              className="stroke-amber-300"
              strokeWidth="3"
            />
            <text
              x={x}
              y="148"
              textAnchor="middle"
              className="fill-amber-200 font-mono text-[16px] font-semibold"
            >
              {displayScale} {isAmmeter ? "A" : "V"}
            </text>
          </g>
        );
      })}

      {isAmmeter ? (
        <>
          <path
            d="M 70 94 V 232 H 266 M 334 232 H 390 M 478 232 H 690 V 94"
            fill="none"
            className="stroke-slate-500"
            strokeWidth="2.5"
          />
          <circle
            cx="300"
            cy="232"
            r="34"
            className="fill-[#080d18] stroke-lime-300"
            strokeWidth="3"
          />
          <text
            x="300"
            y="240"
            textAnchor="middle"
            className="fill-lime-200 text-[22px] font-bold"
          >
            G
          </text>
          <path
            d="M 390 232 l 12 -12 16 24 16 -24 16 24 16 -24 12 12"
            fill="none"
            className="stroke-lime-300"
            strokeWidth="3"
          />
          <text
            x="430"
            y="205"
            textAnchor="middle"
            className="fill-lime-200 font-mono text-[16px]"
          >
            rg
          </text>
          <line
            x1="200"
            y1="178"
            x2="530"
            y2="178"
            className="stroke-lime-300"
            strokeWidth="3"
            markerEnd={`url(#${arrowId})`}
          />
          <text
            x="365"
            y="169"
            textAnchor="middle"
            className="fill-lime-200 font-mono text-[15px]"
          >
            corriente del galvanómetro
          </text>
        </>
      ) : (
        <>
          <path
            d="M 70 94 V 134 M 104 238 H 690"
            fill="none"
            className="stroke-slate-500"
            strokeWidth="2.5"
          />
          <path
            d="M 70 134 l -12 10 24 15 -24 15 24 15 -12 15"
            fill="none"
            className="stroke-lime-300"
            strokeWidth="3"
          />
          <text x="105" y="174" className="fill-lime-200 font-mono text-[16px]">
            rg
          </text>
          <circle
            cx="70"
            cy="238"
            r="34"
            className="fill-[#080d18] stroke-lime-300"
            strokeWidth="3"
          />
          <text
            x="70"
            y="246"
            textAnchor="middle"
            className="fill-lime-200 text-[22px] font-bold"
          >
            G
          </text>
          <line
            x1="140"
            y1="180"
            x2="140"
            y2="240"
            className="stroke-lime-300"
            strokeWidth="3"
            markerEnd={`url(#${arrowId})`}
          />
          <text x="157" y="217" className="fill-lime-200 font-mono text-[15px]">
            Ig
          </text>
          <text
            x="630"
            y="270"
            textAnchor="middle"
            className="fill-slate-400 font-mono text-[14px]"
          >
            retorno común
          </text>
        </>
      )}
    </svg>
  );
}

type InstrumentFlowNode = Node<
  InstrumentDiagramProps & Record<string, unknown>,
  "instrument"
>;

function InstrumentNode({ data }: NodeProps<InstrumentFlowNode>) {
  return <InstrumentSchematic kind={data.kind} scales={data.scales} />;
}

const nodeTypes = { instrument: InstrumentNode } satisfies NodeTypes;

export function InstrumentDiagram({ kind, scales }: InstrumentDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<ReactFlowInstance<InstrumentFlowNode> | null>(null);
  const title =
    kind === "ammeter"
      ? "Problema 12 · Amperímetro con shunt Ayrton"
      : "Problema 13 · Voltímetro de tres escalas";
  const fitView = useCallback(() => {
    window.requestAnimationFrame(() => {
      void flowRef.current?.fitView({
        padding: 0.08,
        minZoom: 0.25,
        maxZoom: 1.5,
        duration: 180,
      });
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(fitView);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [fitView]);

  const nodes = useMemo<InstrumentFlowNode[]>(
    () => [
      {
        id: "instrument-schematic",
        type: "instrument",
        position: { x: 0, y: 0 },
        data: { kind, scales },
        style: { width: 760, height: 300 },
        initialWidth: 760,
        initialHeight: 300,
        draggable: false,
        selectable: false,
      },
    ],
    [kind, scales],
  );

  return (
    <div ref={containerRef} className="min-w-0">
      <CircuitCanvasFrame
        title={title}
        subtitle="R1 · R2 · R3 · galvanómetro"
        compact
      >
        <ReactFlow<InstrumentFlowNode>
          nodes={nodes}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag
          zoomOnScroll
          zoomOnPinch
          minZoom={0.25}
          maxZoom={2}
          fitView
          fitViewOptions={{ padding: 0.08, minZoom: 0.25, maxZoom: 1.5 }}
          onInit={(instance) => {
            flowRef.current = instance;
            fitView();
          }}
          colorMode="dark"
          aria-label={title}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={28}
            size={1}
            color="#1e293b"
          />
          <CircuitMiniMap />
          <Controls
            position="bottom-left"
            showInteractive={false}
            onFitView={fitView}
          />
        </ReactFlow>
      </CircuitCanvasFrame>
    </div>
  );
}
