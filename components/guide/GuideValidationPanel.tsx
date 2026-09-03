import { CheckCircle2, CircleAlert, FlaskConical } from "lucide-react";

export type ValidationReading = {
  id: string;
  label: string;
  expected: number;
  actual: number;
  unit: string;
  tolerancePercent?: number;
};

function relativeErrorPercent(actual: number, expected: number): number {
  if (Math.abs(expected) < 1e-12) {
    return Math.abs(actual) < 1e-12 ? 0 : Number.POSITIVE_INFINITY;
  }
  return (Math.abs(actual - expected) / Math.abs(expected)) * 100;
}

function formatNumber(value: number, digits = 5): string {
  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: digits,
  }).format(value);
}

export function GuideValidationPanel({
  readings,
}: {
  readings: ValidationReading[];
}) {
  const evaluated = readings.map((reading) => {
    const error = relativeErrorPercent(reading.actual, reading.expected);
    const tolerance = reading.tolerancePercent ?? 2;
    return { ...reading, error, tolerance, passed: error <= tolerance };
  });
  const passedCount = evaluated.filter((reading) => reading.passed).length;

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl shadow-black/20 sm:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-lime-400/20 bg-lime-400/10 text-lime-300">
            <FlaskConical className="size-5" />
          </span>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime-300">
              Validación
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Simulador vs. resultado oficial
            </h2>
          </div>
        </div>
        <span className="w-fit rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1 font-mono text-xs text-lime-200">
          {passedCount}/{evaluated.length} dentro de tolerancia
        </span>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[620px] border-separate border-spacing-y-2 text-left text-sm">
          <thead className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-500">
            <tr>
              <th className="px-3 py-1 font-medium">Magnitud</th>
              <th className="px-3 py-1 font-medium">Simulador</th>
              <th className="px-3 py-1 font-medium">Oficial</th>
              <th className="px-3 py-1 font-medium">Error relativo</th>
              <th className="px-3 py-1 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {evaluated.map((reading) => (
              <tr key={reading.id} className="bg-slate-900/65 text-slate-300">
                <td className="rounded-l-xl px-3 py-3 font-medium text-slate-100">
                  {reading.label}
                </td>
                <td className="px-3 py-3 font-mono">
                  {formatNumber(reading.actual)} {reading.unit}
                </td>
                <td className="px-3 py-3 font-mono">
                  {formatNumber(reading.expected)} {reading.unit}
                </td>
                <td className="px-3 py-3 font-mono">
                  {Number.isFinite(reading.error)
                    ? `${formatNumber(reading.error, 3)} %`
                    : "—"}
                </td>
                <td className="rounded-r-xl px-3 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 font-medium ${
                      reading.passed ? "text-lime-300" : "text-amber-300"
                    }`}
                  >
                    {reading.passed ? (
                      <CheckCircle2 className="size-4" />
                    ) : (
                      <CircleAlert className="size-4" />
                    )}
                    {reading.passed ? "Coincide" : "Revisar"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        Se admite hasta 2 % de diferencia por el redondeo de los valores
        publicados, salvo que el caso indique otra tolerancia.
      </p>
    </section>
  );
}
