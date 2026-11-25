// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { idRef, newParameterizedDateFilter, uriRef } from "@gooddata/sdk-model";

import { convertFilter as convertBearFilter } from "../../convertors/fromBackend/VisualizationConverter.js";

import { convertExtendedFilter, convertFilter } from "./FilterConverter.js";

describe("convertExtendedFilter with a period", () => {
    const filter = newParameterizedDateFilter(idRef("closed", "dataSet"), idRef("lastQuarter", "parameter"), {
        localIdentifier: "period-filter",
        emptyValueHandling: "exclude",
    });

    it("keeps the date data set, the period, the local identifier and the empty values", () => {
        expect(convertExtendedFilter(filter, false)).toEqual({
            parameterizedDateFilter: {
                localIdentifier: "period-filter",
                dataSet: { identifier: "closed" },
                parameter: { identifier: "lastQuarter" },
                emptyValueHandling: "exclude",
            },
        });
    });

    it("adds no keys that the stored filter does not have", () => {
        expect(convertExtendedFilter(newParameterizedDateFilter("closed", "lastQuarter"), false)).toEqual({
            parameterizedDateFilter: {
                dataSet: { identifier: "closed" },
                parameter: { identifier: "lastQuarter" },
            },
        });
    });

    it("converts a metric's period filter the same way", () => {
        expect(convertFilter(filter, false)).toEqual(convertExtendedFilter(filter, false));
    });

    it("keeps uri references", () => {
        const byUri = newParameterizedDateFilter(uriRef("/closed"), uriRef("/lastQuarter"));
        expect(convertExtendedFilter(byUri, false)).toEqual({
            parameterizedDateFilter: { dataSet: { uri: "/closed" }, parameter: { uri: "/lastQuarter" } },
        });
    });

    it("comes back unchanged through the save converter", () => {
        expect(convertBearFilter(convertExtendedFilter(filter, false))).toEqual(filter);
    });
});
