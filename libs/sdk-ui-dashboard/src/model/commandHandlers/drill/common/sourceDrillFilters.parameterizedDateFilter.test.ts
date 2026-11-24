// (C) 2026 GoodData Corporation

// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

import {
    type IFilter,
    type IInsight,
    idRef,
    newAbsoluteDateFilter,
    newInsightDefinition,
    newParameterizedDateFilter,
} from "@gooddata/sdk-model";

import {
    getIncludedSourceFiltersForDashboard,
    getIncludedSourceInsightFilters,
} from "./sourceDrillFilters.js";

const closed = idRef("closed", "dataSet");
const created = idRef("created", "dataSet");

function insightWithFilters(filters: IFilter[]): IInsight {
    const definition = newInsightDefinition("local:table", (builder) => builder.filters(filters));
    return {
        insight: {
            ...definition.insight,
            identifier: "source",
            uri: "/source",
            ref: idRef("source", "insight"),
        },
    };
}

describe("source drill filters with a parameterized date filter", () => {
    const parameterized = newParameterizedDateFilter(closed, "period");
    const absolute = newAbsoluteDateFilter(created, "2026-01-01", "2026-03-31");
    const insight = insightWithFilters([parameterized, absolute]);
    const includedSourceInsightFiltersObjRefs = [
        { type: "dateFilter" as const, dataSet: closed },
        { type: "dateFilter" as const, dataSet: created },
    ];

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("passes it to a target insight", () => {
        expect(getIncludedSourceInsightFilters(insight, includedSourceInsightFiltersObjRefs)).toEqual([
            parameterized,
            absolute,
        ]);
    });

    it("leaves it out of the filters for a target dashboard with a warning", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

        expect(
            getIncludedSourceFiltersForDashboard(insight, {
                origin: { type: "drillFromAttribute", attribute: idRef("attr") },
                includedSourceInsightFiltersObjRefs,
            }),
        ).toEqual([absolute]);
        expect(warn).toHaveBeenCalledOnce();
    });
});
