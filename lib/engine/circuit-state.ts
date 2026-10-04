import type { Circuit, Component } from "./model";

export type CircuitValueUpdateOptions = {
  /** Solo se habilita en ejercicios que admiten cortocircuitos ideales. */
  allowZeroResistance?: boolean;
};

/** Crea una copia independiente de la netlist para conservar un estado base. */
export function cloneCircuit(circuit: Circuit): Circuit {
  return {
    nodes: circuit.nodes.map((node) => ({ ...node })),
    components: circuit.components.map((component) => ({ ...component })),
  };
}

/** Compara únicamente los valores eléctricos de dos netlists equivalentes. */
export function hasOriginalCircuitValues(
  circuit: Circuit,
  originalCircuit: Circuit,
): boolean {
  if (circuit.components.length !== originalCircuit.components.length) {
    return false;
  }

  return originalCircuit.components.every((originalComponent) => {
    const component = circuit.components.find(
      (candidate) => candidate.label === originalComponent.label,
    );
    if (!component || component.type !== originalComponent.type) return false;

    if (component.type === "resistor" && originalComponent.type === "resistor") {
      return component.ohms === originalComponent.ohms;
    }
    if (
      component.type === "voltageSource" &&
      originalComponent.type === "voltageSource"
    ) {
      return component.volts === originalComponent.volts;
    }
    return (
      component.type === "currentSource" &&
      originalComponent.type === "currentSource" &&
      component.amps === originalComponent.amps
    );
  });
}

function withComponentValue(
  component: Component,
  value: number,
  options: CircuitValueUpdateOptions,
): Component {
  if (!Number.isFinite(value)) {
    throw new Error("El valor debe ser un número finito.");
  }

  if (component.type === "resistor") {
    if (value < 0 || (value === 0 && !options.allowZeroResistance)) {
      throw new Error(
        options.allowZeroResistance
          ? "La resistencia debe ser mayor o igual que cero."
          : "La resistencia debe ser mayor que cero.",
      );
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
  options: CircuitValueUpdateOptions = {},
): Circuit {
  let wasUpdated = false;
  const components = circuit.components.map((component) => {
    if (component.label !== label) return component;
    wasUpdated = true;
    return withComponentValue(component, value, options);
  });

  if (!wasUpdated) {
    throw new Error(`No existe la rama ${label}.`);
  }

  return { ...circuit, components };
}
