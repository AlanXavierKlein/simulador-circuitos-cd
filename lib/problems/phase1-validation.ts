import type { Circuit } from "../engine/model";

/** Figura 5(a): R2 y R6 en serie con R3 || (R1 + R4 + R5). */
export const problem8a: Circuit = {
  nodes: ["0", "a", "x", "y", "w", "z"].map((id) => ({ id })),
  components: [
    { type: "resistor", label: "R2", nFrom: "a", nTo: "x", ohms: 10 },
    { type: "resistor", label: "R1", nFrom: "x", nTo: "y", ohms: 10 },
    { type: "resistor", label: "R4", nFrom: "y", nTo: "w", ohms: 10 },
    { type: "resistor", label: "R5", nFrom: "w", nTo: "z", ohms: 10 },
    { type: "resistor", label: "R3", nFrom: "x", nTo: "z", ohms: 10 },
    { type: "resistor", label: "R6", nFrom: "z", nTo: "0", ohms: 10 },
    {
      type: "voltageSource",
      label: "V",
      nFrom: "a",
      nTo: "0",
      volts: 9,
    },
  ],
};

/** Figura 6. Las referencias de R1/R4, R3 y R2/R5 son I0, I1 e I2. */
export const problem9: Circuit = {
  nodes: ["0", "A", "a", "l", "m", "r", "b"].map((id) => ({ id })),
  components: [
    { type: "resistor", label: "R4", nFrom: "0", nTo: "l", ohms: 15 },
    {
      type: "voltageSource",
      label: "E1",
      nFrom: "a",
      nTo: "l",
      volts: 10,
    },
    { type: "resistor", label: "R1", nFrom: "a", nTo: "A", ohms: 25 },
    {
      type: "voltageSource",
      label: "E2",
      nFrom: "m",
      nTo: "0",
      volts: 15,
    },
    { type: "resistor", label: "R3", nFrom: "m", nTo: "A", ohms: 10 },
    { type: "resistor", label: "R2", nFrom: "A", nTo: "r", ohms: 20 },
    {
      type: "voltageSource",
      label: "E3",
      nFrom: "b",
      nTo: "r",
      volts: 10,
    },
    { type: "resistor", label: "R5", nFrom: "b", nTo: "0", ohms: 30 },
  ],
};

/**
 * Figura 8. Ie e Is cierran las corrientes externas equivalentes de la red:
 * Ie entra al nodo izquierdo e Is sale del nodo inferior derecho.
 */
export const problem11: Circuit = {
  nodes: ["0", "t", "b"].map((id) => ({ id })),
  components: [
    { type: "resistor", label: "R1", nFrom: "0", nTo: "t", ohms: 6 },
    { type: "resistor", label: "R2", nFrom: "t", nTo: "b", ohms: 10 },
    { type: "resistor", label: "R3", nFrom: "0", nTo: "b", ohms: 9 },
    {
      type: "currentSource",
      label: "Ie",
      nFrom: "t",
      nTo: "0",
      amps: 1,
    },
    {
      type: "currentSource",
      label: "Is",
      nFrom: "b",
      nTo: "t",
      amps: 0.25,
    },
  ],
};
