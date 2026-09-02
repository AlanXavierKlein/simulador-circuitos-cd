import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";

import type { JunctionFlowNode } from "./flow-types";

const positions = [
  ["top", Position.Top],
  ["right", Position.Right],
  ["bottom", Position.Bottom],
  ["left", Position.Left],
] as const;

export function JunctionNode({ data }: NodeProps<JunctionFlowNode>) {
  return (
    <div
      className="relative grid size-[22px] place-items-center rounded-full border-[4px] border-slate-950 bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.65)]"
      aria-label={data.isGround ? "Nodo 0, tierra" : `Nodo ${data.label}`}
    >
      {positions.map(([id, position]) => (
        <Handle
          key={id}
          id={id}
          type="source"
          position={position}
          className="opacity-0"
          style={{ width: 8, height: 8 }}
        />
      ))}
      <span className="pointer-events-none absolute top-6 whitespace-nowrap rounded-md border border-slate-700 bg-slate-950/95 px-2 py-0.5 font-mono text-[10px] text-slate-300 shadow-lg">
        {data.isGround ? "⏚ 0" : data.label}
      </span>
    </div>
  );
}
