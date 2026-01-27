// (C) 2020-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ITotal } from "@gooddata/sdk-model";

import { type IBucketFilter } from "../../../../interfaces/Visualization.js";
import {
    attributeFilter,
    measureValueFilter,
    rankingFilter,
} from "../../../../tests/mocks/referencePointMocks.js";
import { removeInvalidTotals } from "../totalsHelpers.js";

describe("removeInvalidTotals", () => {
    describe("remove native totals", () => {
        const nativeTotal: ITotal = {
            attributeIdentifier: "a1",
            measureIdentifier: "m1",
            type: "nat",
        };

        const sumTotal: ITotal = {
            attributeIdentifier: "a1",
            measureIdentifier: "m2",
            type: "sum",
        };

        const Scenarios: Array<[string, ITotal[], IBucketFilter[], ITotal[]]> = [
            [
                "do nothing when measure value or ranking filter is not present",
                [nativeTotal, sumTotal],
                [attributeFilter],
                [nativeTotal, sumTotal],
            ],
            [
                "remove native total when measure value filter is present",
                [nativeTotal, sumTotal],
                [attributeFilter, measureValueFilter],
                [sumTotal],
            ],
            [
                "remove native total when ranking filter is present",
                [nativeTotal, sumTotal],
                [attributeFilter, rankingFilter],
                [sumTotal],
            ],
        ];

        it.each(Scenarios)("should %s", (_desc, totals, filters, expectedTotals) => {
            expect(removeInvalidTotals(totals, filters)).toEqual(expectedTotals);
        });
    });
});
