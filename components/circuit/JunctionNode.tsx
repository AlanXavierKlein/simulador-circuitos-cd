import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";

import type { JunctionFlowNode } from "./flow-types";

const positions = [
  ["top", Position.Top],
  ["right", Position.Right],
  ["bottom", Position.Bottom],
  ["left", Position.Left],
] as const;

export function JunctionNode({ data, selected }: NodeProps<JunctionFlowNode>) {
  const isConstructorNode = "builderKind" in data;
  const isValidTarget = data.connectionHint === "valid";
  const isInvalidTarget = data.connectionHint === "invalid";
  const isIncomplete =
    !data.connectionActive && data.validationHint === "incomplete";
  const isUnsolvable =
    !data.connectionActive && data.validationHint === "unsolvable";

  return (
    <div
      className={`relative grid place-items-center rounded-full border-[4px] ${
        data.isGround
          ? isConstructorNode
            ? "size-11 bg-sky-300 shadow-[0_0_22px_rgba(125,211,252,0.5)]"
            : "size-[22px] bg-sky-300 shadow-[0_0_18px_rgba(125,211,252,0.62)]"
          : isConstructorNode
            ? "size-11 bg-violet-300 shadow-[0_0_22px_rgba(196,181,253,0.5)]"
            : "size-[22px] bg-violet-300 shadow-[0_0_18px_rgba(196,181,253,0.62)]"
      } ${
        selected
          ? "border-white ring-2 ring-violet-300/70 ring-offset-2 ring-offset-slate-950"
          : "border-slate-950"
      } ${
        isValidTarget
          ? "border-lime-100 ring-4 ring-lime-300/75 ring-offset-2 ring-offset-slate-950 shadow-[0_0_30px_rgba(163,230,53,0.75)]"
          : ""
      } ${isInvalidTarget ? "opacity-35" : ""}`}
      style={
        isIncomplete
          ? {
              borderColor: "#fcd34d",
              boxShadow: "0 0 26px rgba(251,191,36,0.72)",
            }
          : isUnsolvable
            ? {
                borderColor: "#fda4af",
                boxShadow: "0 0 26px rgba(251,113,133,0.75)",
              }
            : undefined
      }
      aria-label={data.isGround ? "Nodo 0, tierra" : `Nodo ${data.label}`}
    >
      {positions.map(([id, position]) => (
        <Handle
          key={id}
          id={id}
          type="source"
          position={position}
          className={isConstructorNode ? "opacity-80" : "opacity-0"}
          style={
            isConstructorNode
              ? {
                  width: 16,
                  height: 16,
                  border: isValidTarget
                    ? "3px solid #f8fafc"
                    : "3px solid #0f172a",
                  background: isValidTarget ? "#a3e635" : "#c4b5fd",
                  boxShadow: isValidTarget
                    ? "0 0 16px rgba(163,230,53,0.9)"
                    : undefined,
                }
              : { width: 8, height: 8 }
          }
        />
      ))}
      <span
        className={`pointer-events-none absolute whitespace-nowrap rounded-md border border-slate-700 bg-slate-950/95 px-2 py-0.5 font-mono text-[10px] text-slate-300 shadow-lg ${
          isConstructorNode ? "top-12" : "top-6"
        }`}
      >
        {data.isGround ? "⏚ 0" : data.label}
      </span>
      {data.connectionHintMessage ? (
        <span className="pointer-events-none absolute left-1/2 top-16 z-20 w-max max-w-56 -translate-x-1/2 rounded-lg border border-amber-400/30 bg-slate-950/95 px-3 py-2 text-center text-[11px] leading-4 text-amber-100 shadow-xl">
          {data.connectionHintMessage}
        </span>
      ) : null}
    </div>
  );
}
