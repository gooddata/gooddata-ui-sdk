// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { idRef, newParameterizedDateFilter } from "@gooddata/sdk-model";

import { convertExtendedFilter, convertFilter } from "./FilterConverter.js";

// the visualization object that the "visualization saved" message carries to the embedding application
describe("convertExtendedFilter with a period", () => {
    const filter = newParameterizedDateFilter(idRef("closed", "dataSet"), idRef("lastQuarter", "parameter"), {
        localIdentifier: "period-filter",
        emptyValueHandling: "exclude",
    });

    it("keeps the date data set, the period, the local identifier and the empty values", () => {
        expect(convertExtendedFilter(filter)).toEqual({
            parameterizedDateFilter: {
                localIdentifier: "period-filter",
                dataSet: idRef("closed", "dataSet"),
                parameter: idRef("lastQuarter", "parameter"),
                emptyValueHandling: "exclude",
            },
        });
    });

    it("converts a metric's period filter the same way", () => {
        expect(convertFilter(filter)).toEqual(convertExtendedFilter(filter));
    });
});
