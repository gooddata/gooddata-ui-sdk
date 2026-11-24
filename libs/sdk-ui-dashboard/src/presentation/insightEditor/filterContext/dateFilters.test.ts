// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
    type IFilter,
    type IInsight,
    idRef,
    newAbsoluteDateFilter,
    newInsightDefinition,
    newParameterizedDateFilter,
} from "@gooddata/sdk-model";

import { getDateFilterItems } from "./dateFilters.js";

function insightWithFilters(filters: IFilter[]): IInsight {
    const definition = newInsightDefinition("local:table", (builder) => builder.filters(filters));
    return {
        insight: {
            ...definition.insight,
            identifier: "insight",
            uri: "/insight",
            ref: idRef("insight", "insight"),
        },
    };
}

describe("getDateFilterItems", () => {
    it("refuses a parameterized date filter of the insight", () => {
        const applied = [newAbsoluteDateFilter(idRef("created", "dataSet"), "2026-01-01", "2026-03-31")];
        const insight = insightWithFilters([
            newParameterizedDateFilter(idRef("closed", "dataSet"), "period"),
        ]);

        expect(() => getDateFilterItems(applied, insight)).toThrow(
            "Parameterized date filters are not supported in the insight editor yet.",
        );
    });
});
