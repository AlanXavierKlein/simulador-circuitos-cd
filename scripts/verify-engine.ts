import {
  calculatePotentialDifference,
  solveCircuit,
} from "../lib/engine/kirchhoff";
import {
  problem8a,
  problem9,
  problem11,
} from "../lib/problems/phase1-validation";

const p11 = solveCircuit(problem11);
const p9 = solveCircuit(problem9);
const p8 = solveCircuit(problem8a);

console.table([
  {
    caso: "P11",
    I0: p11.branchCurrents.R3.toFixed(5),
    I1: p11.branchCurrents.R1.toFixed(5),
    I2: p11.branchCurrents.R2.toFixed(5),
    extra: p11.currentDirections.R2.isOppositeToReference
      ? "I2: sentido opuesto"
      : "",
  },
  {
    caso: "P9",
    I0: p9.branchCurrents.R1.toFixed(5),
    I1: p9.branchCurrents.R3.toFixed(5),
    I2: p9.branchCurrents.R2.toFixed(5),
    extra: `Vb-Va=${calculatePotentialDifference(
      problem9,
      p9.branchVoltages,
      "a",
      "b",
    ).toFixed(5)} V`,
  },
  {
    caso: "P8(a)",
    I0: p8.branchCurrents.R2.toFixed(5),
    I1: "—",
    I2: "—",
    extra: `Req=${(9 / p8.branchCurrents.R2).toFixed(5)} ohm`,
  },
]);
