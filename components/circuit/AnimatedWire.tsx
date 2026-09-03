import { BaseEdge, getSmoothStepPath } from "@xyflow/react";
import type { EdgeProps } from "@xyflow/react";
import { memo } from "react";

import type { CircuitFlowEdge } from "./flow-types";

function currentColor(intensity: number): string {
  const hue = 194 - intensity * 34;
  const lightness = 52 + intensity * 14;
  return `hsl(${hue} 88% ${lightness}%)`;
}

function AnimatedWireComponent({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  data,
}: EdgeProps<CircuitFlowEdge>) {
  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 12,
  });
  const current = data?.current ?? 0;
  const intensity = Math.max(0, Math.min(1, data?.normalizedMagnitude ?? 0));
  const isStopped = Math.abs(current) < 1e-9;

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: "#334155",
          strokeWidth: 5,
        }}
      />
      <path
        d={path}
        fill="none"
        stroke={currentColor(intensity)}
        strokeWidth={2.5 + intensity * 2}
        strokeDasharray="10 14"
        strokeLinecap="round"
        className="animated-wire__flow"
        style={{
          animationDuration: `${1.9 - intensity * 1.48}s`,
          animationDirection: current < 0 ? "reverse" : "normal",
          animationPlayState: isStopped ? "paused" : "running",
          opacity: isStopped ? 0.2 : 0.42 + intensity * 0.58,
          filter: `drop-shadow(0 0 ${2 + intensity * 5}px ${currentColor(intensity)})`,
        }}
        data-branch={data?.branchLabel}
        data-current={current}
        data-direction={current < 0 ? "opposite" : "reference"}
        aria-hidden="true"
      />
    </>
  );
}

export const AnimatedWire = memo(AnimatedWireComponent);
