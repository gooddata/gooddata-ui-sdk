// (C) 2021-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { getAvailableDrillTargets } from "../drillTargets.js";
import {
    OneMeasureAndRepeatingRowAttributesOnDifferentPositions,
    TwoMeasuresWithTwoRowAndTwoColumnAttributes,
} from "./drilling.fixture.js";

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
