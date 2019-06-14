// (C) 2007-2018 GoodData Corporation
import { toAfmResultSpec } from "../../toAfmResultSpec";
import {
    executionWithoutTotals,
    executionWithTotals,
    tableWithoutTotals,
    tableWithTotals,
} from "./totals.fixtures";

describe("totals toAfmResultSpec", () => {
    it("should not contain afm.native totals attribute", () => {
        const executionObject = toAfmResultSpec(tableWithoutTotals);
        expect(executionObject).toEqual(executionWithoutTotals);
    });

    it("should convert table grand totals", () => {
        const executionObject = toAfmResultSpec(tableWithTotals);
        expect(executionObject).toEqual(executionWithTotals);
    });
});
