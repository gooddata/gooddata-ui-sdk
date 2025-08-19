// (C) 2021-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import {
    OneMeasureAndRepeatingRowAttributesOnDifferentPositions,
    TwoMeasuresWithTwoRowAndTwoColumnAttributes,
} from "./drilling.fixture.js";
import { getAvailableDrillTargets } from "../drillTargets.js";

describe("getAvailableDrillTargets", () => {
    it("gets propper available drill targets - ignoring column attributes", () => {
        expect(getAvailableDrillTargets(TwoMeasuresWithTwoRowAndTwoColumnAttributes)).toMatchSnapshot();
    });

    it("gets propper available drill targets for duplicated row attribute", () => {
        expect(
            getAvailableDrillTargets(OneMeasureAndRepeatingRowAttributesOnDifferentPositions),
        ).toMatchSnapshot();
    });
});
