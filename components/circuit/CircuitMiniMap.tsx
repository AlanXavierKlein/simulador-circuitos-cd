"use client";

import { MiniMap } from "@xyflow/react";

/** Mini mapa compartido por el simulador, la guía y el constructor. */
export function CircuitMiniMap() {
  return (
    <MiniMap
      ariaLabel="Mapa de navegación del circuito: muestra el zoom y la posición actuales"
      pannable
      zoomable
      position="bottom-right"
      className="circuit-minimap hidden sm:block"
      style={{ width: 204, height: 138, zIndex: 6 }}
      nodeColor={(node) =>
        node.type === "source"
          ? node.data.sourceType === "voltage"
            ? "#fbbf24"
            : "#22d3ee"
          : node.type === "resistor"
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
  );
}
