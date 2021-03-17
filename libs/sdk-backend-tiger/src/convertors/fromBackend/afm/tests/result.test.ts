// (C) 2020-2021 GoodData Corporation
import { transformExecutionResult, transformGrandTotalData } from "../result";
import { createDefaultDateFormatter } from "../../dateFormatting/defaultDateFormatter";
import { mockResult, mockDimensions } from "./result.fixture";
import {
    defWithDimensions,
    emptyDef,
    MeasureGroupIdentifier,
    newDimension,
    newTotal,
} from "@gooddata/sdk-model";
import { totalLocalIdentifier } from "../../../toBackend/afm/TotalsConverter";

describe("transformExecutionResult", () => {
    it("should format date dimensions values", () => {
        const actual = transformExecutionResult(mockResult, mockDimensions, createDefaultDateFormatter());
        expect(actual).toMatchSnapshot();
    });
});

const TotalSum1 = newTotal("sum", "m1", "localAttr1");
const TotalSum2 = newTotal("sum", "m2", "localAttr1");
const TotalMax2 = newTotal("max", "m2", "localAttr1");
const Def1 = defWithDimensions(
    emptyDef("test"),
    newDimension(["localAttr1", "localAttr2"], [TotalSum1, TotalMax2, TotalSum2]),
    newDimension([MeasureGroupIdentifier]),
);
const GrandTotal1 = {
    localIdentifier: totalLocalIdentifier("sum", 0),
    data: [1, 2, 3],
};
const GrandTotal2 = {
    localIdentifier: totalLocalIdentifier("max", 0),
    data: [0, 0, 0],
};

describe("transformGrandTotalData", () => {
    it("should transform grand total data", () => {
        expect(transformGrandTotalData(Def1, [GrandTotal1, GrandTotal2])).toMatchSnapshot();
    });
});
