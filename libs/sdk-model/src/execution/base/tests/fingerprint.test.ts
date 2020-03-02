// (C) 2020 GoodData Corporation

import { Account, Won } from "../../../../__mocks__/model";
import { IDimension, MeasureGroupIdentifier } from "../dimension";
import { dimensionFingerprint } from "../fingerprint";
import { newTotal } from "../totals";

describe("dimensionFingerprint", () => {
    const DimensionWithUndefinedTotals: IDimension = {
        itemIdentifiers: [MeasureGroupIdentifier],
    };

    const DimensionWithEmptyTotals: IDimension = {
        itemIdentifiers: [MeasureGroupIdentifier],
        totals: [],
    };

    const DimensionWithSomeTotals: IDimension = {
        itemIdentifiers: [MeasureGroupIdentifier],
        totals: [newTotal("sum", Won, Account.Name)],
    };

    it("should return same fingerprint for dim with none totals vs dim with empty totals", () => {
        expect(dimensionFingerprint(DimensionWithUndefinedTotals)).toEqual(
            dimensionFingerprint(DimensionWithEmptyTotals),
        );
    });

    it("should return different fingerprint for dim with no totals vs dim with some totals", () => {
        expect(dimensionFingerprint(DimensionWithUndefinedTotals)).not.toEqual(
            dimensionFingerprint(DimensionWithSomeTotals),
        );
    });
});
