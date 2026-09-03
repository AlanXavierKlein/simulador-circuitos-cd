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
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <text
        x={x + 50}
        y="64"
        textAnchor="middle"
        className="fill-cyan-200 font-mono text-[17px] font-semibold"
      >
        {label}
      </text>
    </g>
  );
}

export function InstrumentDiagram({ kind, scales }: InstrumentDiagramProps) {
  const isAmmeter = kind === "ammeter";

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-[#080d18] p-4 shadow-xl shadow-black/20">
      <svg
        viewBox="0 0 760 300"
        role="img"
        aria-label={
          isAmmeter
            ? "Esquema del amperímetro con shunt Ayrton"
            : "Esquema del voltímetro con resistencias multiplicadoras"
        }
        className="h-auto w-full text-cyan-300"
      >
        <defs>
          <marker
            id={`${kind}-arrow`}
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

        <rect
          x="1"
          y="1"
          width="758"
          height="298"
          rx="24"
          className="fill-slate-950/20 stroke-slate-800"
        />
        <line
          x1="70"
          y1="94"
          x2="120"
          y2="94"
          stroke="currentColor"
          strokeWidth="5"
        />
        <Resistor x={120} label="R1" />
        <line
          x1="220"
          y1="94"
          x2="270"
          y2="94"
          stroke="currentColor"
          strokeWidth="5"
        />
        <Resistor x={270} label="R2" />
        <line
          x1="370"
          y1="94"
          x2="420"
          y2="94"
          stroke="currentColor"
          strokeWidth="5"
        />
        <Resistor x={420} label="R3" />
        <line
          x1="520"
          y1="94"
          x2="690"
          y2="94"
          stroke="currentColor"
          strokeWidth="5"
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
              d="M 70 94 V 232 H 690 V 94"
              fill="none"
              className="stroke-slate-500"
              strokeWidth="4"
            />
            <circle
              cx="300"
              cy="232"
              r="34"
              className="fill-slate-900 stroke-lime-300"
              strokeWidth="4"
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
              d="M 334 232 H 390 l 12 -12 16 24 16 -24 16 24 16 -24 12 12 H 520"
              fill="none"
              className="stroke-lime-300"
              strokeWidth="4"
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
              markerEnd={`url(#${kind}-arrow)`}
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
              d="M 70 94 V 238 H 690"
              fill="none"
              className="stroke-slate-500"
              strokeWidth="4"
            />
            <path
              d="M 70 94 v 40 l -12 12 24 16 -24 16 24 16 -12 12"
              fill="none"
              className="stroke-lime-300"
              strokeWidth="4"
            />
            <text
              x="105"
              y="174"
              className="fill-lime-200 font-mono text-[16px]"
            >
              rg
            </text>
            <circle
              cx="70"
              cy="238"
              r="34"
              className="fill-slate-900 stroke-lime-300"
              strokeWidth="4"
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
              markerEnd={`url(#${kind}-arrow)`}
            />
            <text
              x="157"
              y="217"
              className="fill-lime-200 font-mono text-[15px]"
            >
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
    </div>
  );
}
