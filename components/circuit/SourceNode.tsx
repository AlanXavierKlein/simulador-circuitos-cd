import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";

import { cn } from "@/lib/utils";

import type { SourceFlowNode } from "./flow-types";

const handleStyle = {
  width: 13,
  height: 13,
  border: "3px solid #0f172a",
  background: "#fbbf24",
};

function VoltageSymbol({
  vertical,
  reversed,
}: {
  vertical: boolean;
  reversed: boolean;
}) {
  return vertical ? (
    <svg
      viewBox="0 0 116 180"
      className="absolute inset-0 size-full"
      aria-hidden="true"
    >
      <path
        d="M58 0 V67 M58 113 V180"
        stroke="#fbbf24"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d={reversed ? "M39 68 H77 M27 91 H89" : "M27 68 H89 M39 91 H77"}
        stroke="#fbbf24"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {reversed ? (
        <>
          <text x="91" y="72" fill="#94a3b8" fontSize="20" fontWeight="700">
            −
          </text>
          <text x="94" y="103" fill="#fbbf24" fontSize="18" fontWeight="700">
            +
          </text>
        </>
      ) : (
        <>
          <text x="94" y="72" fill="#fbbf24" fontSize="18" fontWeight="700">
            +
          </text>
          <text x="91" y="103" fill="#94a3b8" fontSize="20" fontWeight="700">
            −
          </text>
        </>
      )}
    </svg>
  ) : (
    <svg
      viewBox="0 0 180 104"
      className="absolute inset-0 size-full"
      aria-hidden="true"
    >
      <path
        d="M0 52 H67 M113 52 H180"
        stroke="#fbbf24"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d={reversed ? "M68 33 V71 M91 21 V83" : "M68 21 V83 M91 33 V71"}
        stroke="#fbbf24"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {reversed ? (
        <>
          <text x="62" y="28" fill="#94a3b8" fontSize="20" fontWeight="700">
            −
          </text>
          <text x="87" y="20" fill="#fbbf24" fontSize="18" fontWeight="700">
            +
          </text>
        </>
      ) : (
        <>
          <text x="57" y="20" fill="#fbbf24" fontSize="18" fontWeight="700">
            +
          </text>
          <text x="87" y="28" fill="#94a3b8" fontSize="20" fontWeight="700">
            −
          </text>
        </>
      )}
    </svg>
  );
}

function CurrentSymbol({
  vertical,
  reversed,
}: {
  vertical: boolean;
  reversed: boolean;
}) {
  return vertical ? (
    <svg
      viewBox="0 0 116 180"
      className="absolute inset-0 size-full"
      aria-hidden="true"
    >
      <path
        d="M58 0 V42 M58 138 V180"
        stroke="#fbbf24"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle
        cx="58"
        cy="90"
        r="47"
        fill="#111827"
        stroke="#fbbf24"
        strokeWidth="4"
      />
      <path
        d={
          reversed
            ? "M58 116 V66 M45 80 L58 66 L71 80"
            : "M58 64 V114 M45 100 L58 114 L71 100"
        }
        fill="none"
        stroke="#fbbf24"
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
        d="M0 52 H38 M142 52 H180"
        stroke="#fbbf24"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle
        cx="90"
        cy="52"
        r="47"
        fill="#111827"
        stroke="#fbbf24"
        strokeWidth="4"
      />
      <path
        d={
          reversed
            ? "M117 52 H67 M81 39 L67 52 L81 65"
            : "M63 52 H113 M99 39 L113 52 L99 65"
        }
        fill="none"
        stroke="#fbbf24"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SourceNode({ data, selected }: NodeProps<SourceFlowNode>) {
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
        "relative grid place-items-center rounded-2xl border border-amber-400/35 bg-slate-950/92 shadow-xl shadow-black/30 transition-[border-color,box-shadow]",
        isVertical ? "h-[180px] w-[116px]" : "h-[104px] w-[180px]",
        selected && "border-amber-300 shadow-[0_0_28px_rgba(251,191,36,0.22)]",
      )}
      aria-label={`${data.label}, ${data.value}`}
    >
      <Handle
        id="from"
        type="source"
        position={fromPosition}
        style={handleStyle}
      />

      {data.sourceType === "voltage" ? (
        <VoltageSymbol vertical={isVertical} reversed={data.reversed} />
      ) : (
        <CurrentSymbol vertical={isVertical} reversed={data.reversed} />
      )}

      <span
        className={cn(
          "absolute rounded-md border border-amber-400/25 bg-slate-900/95 px-2 py-1 text-xs font-semibold tracking-wide text-amber-100",
          isVertical ? "right-2 top-5" : "left-1/2 top-2 -translate-x-1/2",
        )}
      >
        {data.label}
      </span>
      <span
        className={cn(
          "absolute rounded-md bg-slate-900/95 px-2 py-1 font-mono text-[11px] text-amber-300",
          isVertical
            ? "bottom-5 right-2"
            : "bottom-2 left-1/2 -translate-x-1/2",
        )}
      >
        {data.value}
      </span>

      <Handle id="to" type="source" position={toPosition} style={handleStyle} />
    </div>
  );
}
