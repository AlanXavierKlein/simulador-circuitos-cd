import type {
  ComponentPositionMap,
  CurrentLabelPlacementMap,
  NodePositionMap,
} from "./circuit-adapter";

export const problem9Positions: NodePositionMap = {
  a: { x: 100, y: 90 },
  A: { x: 500, y: 90 },
  r: { x: 900, y: 90 },
  b: { x: 900, y: 540 },
  "0": { x: 500, y: 540 },
  l: { x: 100, y: 540 },
  m: { x: 500, y: 315 },
};

export const problem9CurrentLabelPlacements: CurrentLabelPlacementMap = {
  I0: { componentLabel: "R4", edge: "to", normalOffset: 70 },
  I1: { componentLabel: "E2", edge: "from", normalOffset: 115 },
  I2: {
    componentLabel: "R2",
    edge: "from",
    tangentOffset: 75,
    normalOffset: 95,
  },
};

export type GuideCircuitLayout = {
  nodePositions: NodePositionMap;
  componentPositions?: ComponentPositionMap;
  currentLabelPlacements?: CurrentLabelPlacementMap;
};

export const guideCircuitLayouts: Record<string, GuideCircuitLayout> = {
  p8a: {
    nodePositions: {
      a: { x: 100, y: 100 },
      x: { x: 420, y: 100 },
      y: { x: 800, y: 100 },
      w: { x: 800, y: 520 },
      z: { x: 420, y: 520 },
      "0": { x: 100, y: 520 },
    },
  },
  p8b: {
    nodePositions: {
      a: { x: 100, y: 310 },
      x: { x: 360, y: 310 },
      y: { x: 680, y: 310 },
      z: { x: 680, y: 570 },
      "0": { x: 100, y: 570 },
    },
    componentPositions: {
      R2: { x: 520, y: 135 },
    },
  },
  p9: {
    nodePositions: problem9Positions,
    currentLabelPlacements: problem9CurrentLabelPlacements,
  },
  p11: {
    nodePositions: {
      "0": { x: 180, y: 180 },
      t: { x: 720, y: 180 },
      b: { x: 720, y: 520 },
    },
    componentPositions: {
      Ie: { x: 450, y: 20 },
      Is: { x: 900, y: 350 },
      R3: { x: 420, y: 520 },
    },
    currentLabelPlacements: {
      I0: { componentLabel: "R3", edge: "from", normalOffset: 75 },
      I1: { componentLabel: "R1", edge: "from", normalOffset: 75 },
      I2: { componentLabel: "R2", edge: "from", normalOffset: 75 },
      Ie: { componentLabel: "Ie", edge: "from", normalOffset: 65 },
      Is: { componentLabel: "Is", edge: "from", normalOffset: 65 },
    },
  },
};
