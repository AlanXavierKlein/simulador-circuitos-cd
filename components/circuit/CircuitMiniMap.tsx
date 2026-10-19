"use client";

import { MiniMap, Panel } from "@xyflow/react";
import { Map, X } from "lucide-react";
import { useState } from "react";

/** Mini mapa compartido por el simulador, la guía y el constructor. */
export function CircuitMiniMap() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Panel position="bottom-right" className="m-3! hidden sm:block">
        <button
          type="button"
          aria-label={
            visible ? "Ocultar mapa del circuito" : "Mostrar mapa del circuito"
          }
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
          className="flex h-8 items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-2.5 text-xs text-slate-300 transition hover:border-cyan-400/50 hover:text-cyan-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
        >
          {visible ? <X className="size-3.5" /> : <Map className="size-3.5" />}
          Mapa
        </button>
      </Panel>
      {visible ? (
        <MiniMap
          ariaLabel="Mapa de navegación del circuito: muestra el zoom y la posición actuales"
          pannable
          zoomable
          position="bottom-right"
          className="circuit-minimap hidden sm:block"
          style={{ width: 180, height: 120, zIndex: 6, marginBottom: 54 }}
          nodeColor={(node) =>
            node.type === "source"
              ? node.data.sourceType === "voltage"
                ? "#fbbf24"
                : "#22d3ee"
              : node.type === "resistor" || node.type === "instrument"
                ? "#67e8f9"
                : "#c4b5fd"
          }
          nodeStrokeColor="#f8fafc"
          nodeStrokeWidth={3}
          nodeBorderRadius={8}
          maskColor="rgba(2, 6, 23, 0.48)"
          maskStrokeColor="#67e8f9"
          maskStrokeWidth={2}
          bgColor="#020617"
          offsetScale={8}
        />
      ) : null}
    </>
  );
}
