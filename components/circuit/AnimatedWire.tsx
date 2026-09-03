import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from "@xyflow/react";
import type { EdgeProps } from "@xyflow/react";
import { ArrowRight } from "lucide-react";
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
  const [path, labelX, labelY] = getSmoothStepPath({
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
  const referenceDirection = data?.referenceDirection ?? 1;
  const edgeAngle =
    (Math.atan2(targetY - sourceY, targetX - sourceX) * 180) / Math.PI;
  const arrowAngle = edgeAngle + (referenceDirection === -1 ? 180 : 0);
  const edgeLength = Math.hypot(targetX - sourceX, targetY - sourceY) || 1;
  const tangentX = (targetX - sourceX) / edgeLength;
  const tangentY = (targetY - sourceY) / edgeLength;
  const labelOffset = data?.referenceLabelNormalOffset ?? 70;
  const tangentOffset = data?.referenceLabelTangentOffset ?? 0;
  const currentLabelX =
    labelX + tangentX * tangentOffset - tangentY * labelOffset;
  const currentLabelY =
    labelY + tangentY * tangentOffset + tangentX * labelOffset;

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
      {data?.referenceLabel ? (
        <EdgeLabelRenderer>
          <div
            role="note"
            aria-label={`${data.referenceLabel}, sentido de referencia${data.referenceIsOpposite ? ", sentido real opuesto" : ""}`}
            data-reference-label={data.referenceLabel}
            data-reference-current={data.referenceCurrent}
            data-reference-opposite={
              data.referenceIsOpposite ? "true" : "false"
            }
            className={`nodrag nopan pointer-events-none absolute flex flex-col items-center gap-0.5 rounded-xl border px-2 py-1 shadow-lg backdrop-blur-sm ${
              data.referenceIsOpposite
                ? "border-rose-400/55 bg-rose-950/90 text-rose-200"
                : "border-cyan-400/45 bg-slate-950/90 text-cyan-100"
            }`}
            style={{
              transform: `translate(-50%, -50%) translate(${currentLabelX}px, ${currentLabelY}px)`,
            }}
          >
            <span className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold">
                {data.referenceLabel}
              </span>
              <ArrowRight
                aria-hidden="true"
                className="size-3.5 shrink-0"
                style={{ transform: `rotate(${arrowAngle}deg)` }}
              />
            </span>
            {data.referenceIsOpposite ? (
              <span className="whitespace-nowrap text-[9px] font-semibold uppercase tracking-wide text-rose-300">
                real: opuesto
              </span>
            ) : null}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

export const AnimatedWire = memo(AnimatedWireComponent);
