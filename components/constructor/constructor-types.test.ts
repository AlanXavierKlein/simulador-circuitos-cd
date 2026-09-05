import { describe, expect, it } from "vitest";

import type { ComponentOrientation } from "@/components/circuit/flow-types";

import { componentRotation, nextComponentRotation } from "./constructor-types";

describe("constructor component rotation", () => {
  it("cycles through the four visual directions in 90 degree steps", () => {
    let state: { orientation: ComponentOrientation; reversed: boolean } = {
      orientation: "horizontal",
      reversed: false,
    };
    const rotations = [componentRotation(state.orientation, state.reversed)];

    for (let index = 0; index < 4; index += 1) {
      state = nextComponentRotation(state.orientation, state.reversed);
      rotations.push(componentRotation(state.orientation, state.reversed));
    }

    expect(rotations).toEqual([0, 90, 180, 270, 0]);
  });
});
