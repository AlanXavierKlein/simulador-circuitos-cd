export type CircuitNode = {
  id: string;
  label?: string;
  isGround?: boolean;
};

type BaseComponent = {
  id: string;
  label: string;
  fromNodeId: CircuitNode["id"];
  toNodeId: CircuitNode["id"];
};

export type Resistor = BaseComponent & {
  type: "resistor";
  resistance: number;
};

export type VoltageSource = BaseComponent & {
  type: "voltageSource";
  voltage: number;
};

export type CurrentSource = BaseComponent & {
  type: "currentSource";
  current: number;
};

export type Component = Resistor | VoltageSource | CurrentSource;

export type Circuit = {
  nodes: CircuitNode[];
  components: Component[];
};
