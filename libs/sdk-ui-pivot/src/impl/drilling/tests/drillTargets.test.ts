// (C) 2021 GoodData Corporation
import { TwoMeasuresWithTwoRowAndTwoColumnAttributes } from "./drilling.fixture";
import { getAvailableDrillTargets } from "../drillTargets";

describe("getAvailableDrillTargets", () => {
    it("gets propper available drill targets - ignoring column attributes", () => {
        expect(getAvailableDrillTargets(TwoMeasuresWithTwoRowAndTwoColumnAttributes)).toMatchSnapshot();
    });
});
