import type { NodeProps } from "@xyflow/react";

import { ComponentShell } from "./ComponentShell";
import type { ResistorFlowNode } from "./flow-types";

export function ResistorNode({ data, selected }: NodeProps<ResistorFlowNode>) {
  const vertical = data.orientation === "vertical";

  return (
    <ComponentShell data={data} selected={selected}>
      <svg
        viewBox={vertical ? "0 0 116 180" : "0 0 180 104"}
        className="absolute inset-0 size-full"
        aria-hidden="true"
      >
        <path
          d={
            vertical
              ? "M58 0 V35 L42 45 L74 58 L42 72 L74 86 L42 100 L74 114 L42 128 L58 139 V180"
              : "M0 52 H33 L43 36 L57 68 L72 36 L87 68 L102 36 L117 68 L132 36 L143 52 H180"
          }
          fill="none"
          stroke="#67e8f9"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </ComponentShell>
  );
}
