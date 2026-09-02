export type NodeId = string;

/** Nodo eléctrico. El nodo con id "0" es la referencia de potencial. */
export type CircuitNode = {
  id: NodeId;
  label?: string;
};

type BaseComponent = {
  /** Etiqueta única de la rama; también identifica sus resultados. */
  label: string;
  nFrom: NodeId;
  nTo: NodeId;
};

export type Resistor = BaseComponent & {
  type: "resistor";
  ohms: number;
};

export type VoltageSource = BaseComponent & {
  type: "voltageSource";
  /** V(nFrom) - V(nTo). nFrom es el terminal positivo si volts > 0. */
  volts: number;
};

export type CurrentSource = BaseComponent & {
  type: "currentSource";
  /** Corriente conocida en el sentido nFrom -> nTo. */
  amps: number;
};

export type Component = Resistor | VoltageSource | CurrentSource;

export type Circuit = {
  nodes: CircuitNode[];
  components: Component[];
};

export function isResistor(component: Component): component is Resistor {
  return component.type === "resistor";
}

export function isVoltageSource(
  component: Component,
): component is VoltageSource {
  return component.type === "voltageSource";
}

export function isCurrentSource(
  component: Component,
): component is CurrentSource {
  return component.type === "currentSource";
}
