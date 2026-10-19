import type { NodeProps } from "@xyflow/react";

import { ComponentShell } from "./ComponentShell";

import type { SourceFlowNode, VoltagePolarity } from "./flow-types";

function VoltageSymbol({
  vertical,
  reversed,
  polarity,
}: {
  vertical: boolean;
  reversed: boolean;
  polarity: VoltagePolarity;
}) {
  const showsPolarity = polarity !== "neutral";
  const effectiveReversed = polarity === "negative" ? !reversed : reversed;

  return vertical ? (
    <svg
      viewBox="0 0 116 180"
      className="absolute inset-0 size-full"
      aria-hidden="true"
    >
      <path
        d="M58 0 V68 M58 91 V180"
        stroke="#fbbf24"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d={
          showsPolarity
            ? effectiveReversed
              ? "M39 68 H77 M27 91 H89"
              : "M27 68 H89 M39 91 H77"
            : "M31 68 H85 M31 91 H85"
        }
        stroke="#fbbf24"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {showsPolarity && effectiveReversed ? (
        <>
          <text x="91" y="72" fill="#94a3b8" fontSize="20" fontWeight="700">
            −
          </text>
          <text x="94" y="103" fill="#fbbf24" fontSize="18" fontWeight="700">
            +
          </text>
        </>
      ) : showsPolarity ? (
        <>
          <text x="94" y="72" fill="#fbbf24" fontSize="18" fontWeight="700">
            +
          </text>
          <text x="91" y="103" fill="#94a3b8" fontSize="20" fontWeight="700">
            −
          </text>
        </>
      ) : null}
    </svg>
  ) : (
    <svg
      viewBox="0 0 180 104"
      className="absolute inset-0 size-full"
      aria-hidden="true"
    >
      <path
        d="M0 52 H68 M91 52 H180"
        stroke="#fbbf24"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d={
          showsPolarity
            ? effectiveReversed
              ? "M68 33 V71 M91 21 V83"
              : "M68 21 V83 M91 33 V71"
            : "M68 28 V76 M91 28 V76"
        }
        stroke="#fbbf24"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {showsPolarity && effectiveReversed ? (
        <>
          <text x="62" y="28" fill="#94a3b8" fontSize="20" fontWeight="700">
            −
          </text>
          <text x="87" y="20" fill="#fbbf24" fontSize="18" fontWeight="700">
            +
          </text>
        </>
      ) : showsPolarity ? (
        <>
          <text x="57" y="20" fill="#fbbf24" fontSize="18" fontWeight="700">
            +
          </text>
          <text x="87" y="28" fill="#94a3b8" fontSize="20" fontWeight="700">
            −
          </text>
        </>
      ) : null}
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
        stroke="#67e8f9"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle
        cx="58"
        cy="90"
        r="47"
        fill="#080d18"
        stroke="#67e8f9"
        strokeWidth="3"
      />
      <path
        d={
          reversed
            ? "M58 116 V66 M45 80 L58 66 L71 80"
            : "M58 64 V114 M45 100 L58 114 L71 100"
        }
        fill="none"
        stroke="#67e8f9"
        strokeWidth="3"
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
        stroke="#67e8f9"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle
        cx="90"
        cy="52"
        r="47"
        fill="#080d18"
        stroke="#67e8f9"
        strokeWidth="3"
      />
      <path
        d={
          reversed
            ? "M117 52 H67 M81 39 L67 52 L81 65"
            : "M63 52 H113 M99 39 L113 52 L99 65"
        }
        fill="none"
        stroke="#67e8f9"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SourceNode({ data, selected }: NodeProps<SourceFlowNode>) {
  const isVertical = data.orientation === "vertical";
  const isVoltage = data.sourceType === "voltage";
  const voltagePolarity =
    data.voltagePolarity ??
    (data.value.startsWith("-")
      ? "negative"
      : data.value.startsWith("0")
        ? "neutral"
        : "positive");
  return (
    <ComponentShell data={data} selected={selected}>
      {isVoltage ? (
        <VoltageSymbol
          vertical={isVertical}
          reversed={data.reversed}
          polarity={voltagePolarity}
        />
      ) : (
        <CurrentSymbol vertical={isVertical} reversed={data.reversed} />
      )}
    </ComponentShell>
  );
}
