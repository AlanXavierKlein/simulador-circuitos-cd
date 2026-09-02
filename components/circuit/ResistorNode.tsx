import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";

import { cn } from "@/lib/utils";

import type { ResistorFlowNode } from "./flow-types";

const handleStyle = {
  width: 13,
  height: 13,
  border: "3px solid #0f172a",
  background: "#67e8f9",
};

export function ResistorNode({ data, selected }: NodeProps<ResistorFlowNode>) {
  const isVertical = data.orientation === "vertical";
  const fromPosition = isVertical
    ? data.reversed
      ? Position.Bottom
      : Position.Top
    : data.reversed
      ? Position.Right
      : Position.Left;
  const toPosition = isVertical
    ? data.reversed
      ? Position.Top
      : Position.Bottom
    : data.reversed
      ? Position.Left
      : Position.Right;

  return (
    <div
      className={cn(
        "relative grid place-items-center rounded-2xl border border-slate-700/80 bg-slate-950/92 shadow-xl shadow-black/30 transition-[border-color,box-shadow]",
        isVertical ? "h-[180px] w-[116px]" : "h-[104px] w-[180px]",
        selected && "border-cyan-300 shadow-[0_0_28px_rgba(34,211,238,0.22)]",
      )}
      aria-label={`${data.label}, ${data.value}`}
    >
      <Handle
        id="from"
        type="source"
        position={fromPosition}
        style={handleStyle}
      />

      {isVertical ? (
        <svg
          viewBox="0 0 116 180"
          className="absolute inset-0 size-full"
          aria-hidden="true"
        >
          <path
            d="M58 0 V35 L42 45 L74 58 L42 72 L74 86 L42 100 L74 114 L42 128 L58 139 V180"
            fill="none"
            stroke="#67e8f9"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          viewBox="0 0 180 104"
          className="absolute inset-0 size-full"
          aria-hidden="true"
        >
          <path
            d="M0 52 H33 L43 36 L57 68 L72 36 L87 68 L102 36 L117 68 L132 36 L143 52 H180"
            fill="none"
            stroke="#67e8f9"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      <span
        className={cn(
          "absolute rounded-md border border-slate-700 bg-slate-900/95 px-2 py-1 text-xs font-semibold tracking-wide text-slate-100",
          isVertical ? "right-2 top-6" : "left-1/2 top-2 -translate-x-1/2",
        )}
      >
        {data.label}
      </span>
      <span
        className={cn(
          "absolute rounded-md bg-slate-900/95 px-2 py-1 font-mono text-[11px] text-lime-300",
          isVertical
            ? "bottom-6 right-2"
            : "bottom-2 left-1/2 -translate-x-1/2",
        )}
      >
        {data.value}
      </span>

      <Handle id="to" type="source" position={toPosition} style={handleStyle} />
    </div>
  );
}
