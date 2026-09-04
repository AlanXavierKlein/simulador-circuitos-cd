import type { Circuit, Component } from "./model";

/** Crea una copia independiente de la netlist para conservar un estado base. */
export function cloneCircuit(circuit: Circuit): Circuit {
  return {
    nodes: circuit.nodes.map((node) => ({ ...node })),
    components: circuit.components.map((component) => ({ ...component })),
  };
}

function withComponentValue(component: Component, value: number): Component {
  if (!Number.isFinite(value)) {
    throw new Error("El valor debe ser un número finito.");
  }

  if (component.type === "resistor") {
    if (value <= 0) {
      throw new Error("La resistencia debe ser mayor que cero.");
    }
    return { ...component, ohms: value };
  }

  return component.type === "voltageSource"
    ? { ...component, volts: value }
    : { ...component, amps: value };
}

/** Devuelve una netlist nueva con el valor de una única rama actualizado. */
export function updateCircuitComponentValue(
  circuit: Circuit,
  label: string,
  value: number,
): Circuit {
  let wasUpdated = false;
  const components = circuit.components.map((component) => {
    if (component.label !== label) return component;
    wasUpdated = true;
    return withComponentValue(component, value);
  });

  if (!wasUpdated) {
    throw new Error(`No existe la rama ${label}.`);
  }

  return { ...circuit, components };
}
