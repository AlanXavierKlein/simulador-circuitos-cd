import { describe, expect, it } from "vitest";

import { solveCircuit } from "./kirchhoff";
import type { EditableCircuitConnection, EditableCircuitNode } from "./graph";
import { editableGraphToCircuit } from "./graph";

const dividerNodes: EditableCircuitNode[] = [
  { id: "ground", kind: "junction", label: "0", isGround: true },
  { id: "node-a", kind: "junction", label: "a", isGround: false },
  { id: "node-b", kind: "junction", label: "b", isGround: false },
  { id: "source", kind: "voltageSource", label: "E1", value: 12 },
  { id: "r1", kind: "resistor", label: "R1", value: 10 },
  { id: "r2", kind: "resistor", label: "R2", value: 10 },
];

const dividerConnections: EditableCircuitConnection[] = [
  {
    id: "e-source-from",
    source: "source",
    target: "node-a",
    sourceHandle: "from",
  },
  {
    id: "e-source-to",
    source: "source",
    target: "ground",
    sourceHandle: "to",
  },
  {
    id: "e-r1-from",
    source: "r1",
    target: "node-a",
    sourceHandle: "from",
  },
  {
    id: "e-r1-to",
    source: "r1",
    target: "node-b",
    sourceHandle: "to",
  },
  {
    id: "e-r2-from",
    source: "r2",
    target: "node-b",
    sourceHandle: "from",
  },
  {
    id: "e-r2-to",
    source: "r2",
    target: "ground",
    sourceHandle: "to",
  },
];

describe("conversión del constructor a una netlist", () => {
  it("convierte y resuelve un divisor de tensión válido", () => {
    const validation = editableGraphToCircuit(dividerNodes, dividerConnections);

    expect(validation.issues).toEqual([]);
    expect(validation.circuit).not.toBeNull();
    const result = solveCircuit(validation.circuit!);
    expect(result.branchCurrents.R1).toBeCloseTo(0.6, 10);
    expect(result.branchCurrents.R2).toBeCloseTo(0.6, 10);
    expect(result.nodePotentials.b).toBeCloseTo(6, 10);
  });

  it("explica los terminales sueltos sin construir una netlist", () => {
    const validation = editableGraphToCircuit(
      dividerNodes,
      dividerConnections.filter((edge) => edge.id !== "e-r2-to"),
    );

    expect(validation.circuit).toBeNull();
    expect(validation.issues).toContain(
      "R2 tiene el terminal de salida sin conectar.",
    );
  });

  it("exige una referencia a tierra", () => {
    const nodesWithoutGround = dividerNodes.map((node) =>
      node.kind === "junction" ? { ...node, isGround: false } : node,
    );
    const validation = editableGraphToCircuit(
      nodesWithoutGround,
      dividerConnections,
    );

    expect(validation.circuit).toBeNull();
    expect(validation.issues).toContain(
      "Elegí un nodo de referencia a tierra desde el panel de propiedades.",
    );
  });

  it("detecta una red conectada que todavía no cierra una malla", () => {
    const openNodes = dividerNodes.filter((node) => node.id !== "r2");
    const openConnections = dividerConnections.filter(
      (edge) => !edge.id.startsWith("e-r2"),
    );
    const validation = editableGraphToCircuit(openNodes, openConnections);

    expect(validation.circuit).toBeNull();
    expect(validation.issues).toContain(
      "El circuito todavía no forma una malla cerrada. Completá el recorrido de la corriente.",
    );
  });
});
