import { Handle, Position } from "@xyflow/react";
import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

import type { ResistorNodeData, SourceNodeData } from "./flow-types";

/** Shared presentation; node dimensions and terminal positions stay fixed. */
export function ComponentShell({
  data,
  selected,
  children,
}: {
  data: ResistorNodeData | SourceNodeData;
  selected?: boolean;
  children: ReactNode;
}) {
  const vertical = data.orientation === "vertical";
  const builder = "builderKind" in data;
  const voltage = data.sourceType === "voltage";
  const currentSource = data.sourceType === "current";
  const fromPosition = vertical
    ? data.reversed
      ? Position.Bottom
      : Position.Top
    : data.reversed
      ? Position.Right
      : Position.Left;
  const toPosition = vertical
    ? data.reversed
      ? Position.Top
      : Position.Bottom
    : data.reversed
      ? Position.Left
      : Position.Right;

  const terminalStyle = (id: "from" | "to"): CSSProperties => {
    const target = data.validTargetHandles?.includes(id);
    const origin = data.connectionOriginHandle === id;
    return {
      width: 13,
      height: 13,
      border: `2px solid ${target || origin ? "#f8fafc" : "#080d18"}`,
      background: target
        ? "#a3e635"
        : origin || voltage
          ? "#fbbf24"
          : "#67e8f9",
      opacity: !builder
        ? 0
        : data.connectionActive && !target && !origin
          ? 0.28
          : 1,
      ...(target || origin
        ? { boxShadow: "0 0 0 4px rgb(255 255 255 / 0.12)" }
        : {}),
    };
  };

  return (
    <div
      className={cn(
        "circuit-component",
        selected && "is-selected",
        !data.connectionActive &&
          data.validationHint &&
          `is-${data.validationHint}`,
        data.connectionHint === "valid" && "is-target",
        data.connectionHint === "invalid" && "opacity-40",
      )}
      data-orientation={data.orientation}
      data-builder={builder}
      data-source={currentSource ? "current" : voltage ? "voltage" : "resistor"}
      aria-label={`${data.label}, ${data.value}`}
    >
      <Handle
        id="from"
        type="source"
        position={fromPosition}
        style={terminalStyle("from")}
      />
      {children}
      <span className="circuit-component__label">{data.label}</span>
      <span className="circuit-component__value">{data.value}</span>
      {data.connectionHintMessage ? (
        <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-3 w-max max-w-56 -translate-x-1/2 rounded-lg border border-amber-400/30 bg-slate-950/95 px-3 py-2 text-center text-xs leading-5 text-amber-100 shadow-xl">
          {data.connectionHintMessage}
        </span>
      ) : null}
      <Handle
        id="to"
        type="source"
        position={toPosition}
        style={terminalStyle("to")}
      />
    </div>
  );
}
