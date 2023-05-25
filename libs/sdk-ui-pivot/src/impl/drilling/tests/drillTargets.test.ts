// (C) 2021 GoodData Corporation
import {
    TwoMeasuresWithTwoRowAndTwoColumnAttributes,
    OneMeasureAndRepeatingRowAttributesOnDifferentPositions,
} from "./drilling.fixture.js";
import { getAvailableDrillTargets } from "../drillTargets.js";
import { describe, it, expect } from "vitest";

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
