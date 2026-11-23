// (C) 2026 GoodData Corporation

// @vitest-environment node

import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    type IFilter,
    type IInsight,
    type IMeasure,
    idRef,
    localIdRef,
    newAbsoluteGranularityDateFilter,
    newBucket,
    newInsightDefinition,
    newMeasure,
    newPositiveAttributeFilter,
    newRelativeDateFilter,
} from "@gooddata/sdk-model";

import { getIncludedSourceFiltersForDashboard } from "./sourceDrillFilters.js";

const attributeFilter = newPositiveAttributeFilter(idRef("region", "displayForm"), ["East"]);
const dateFilter = newRelativeDateFilter(idRef("created", "dataSet"), "GDC.time.year", -1, 0);
const granularityDateFilter = newAbsoluteGranularityDateFilter(
    idRef("closed", "dataSet"),
    "GDC.time.month",
    "2026-03",
    "2026-04",
);

const sourceInsight = (filters: IFilter[], measure: IMeasure): IInsight => {
    const definition = newInsightDefinition("local:table", (builder) =>
        builder.buckets([newBucket("measures", measure)]).filters(filters),
    );
    return {
        insight: {
            ...definition.insight,
            identifier: "source",
            uri: "/source",
            ref: idRef("source", "insight"),
        },
    } as IInsight;
};

describe("getIncludedSourceFiltersForDashboard", () => {
    let warnSpy: MockInstance;

    beforeEach(() => {
        warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
        warnSpy.mockRestore();
    });

    it("skips an absolute date filter with granularity among the source insight filters", () => {
        const insight = sourceInsight(
            [attributeFilter, dateFilter, granularityDateFilter],
            newMeasure(idRef("amount", "measure"), (m) => m.localId("m1")),
        );

        const result = getIncludedSourceFiltersForDashboard(insight, {
            origin: { type: "drillFromAttribute", attribute: localIdRef("a1") },
            includedSourceInsightFiltersObjRefs: [
                { type: "attributeFilter", label: idRef("region", "displayForm") },
                { type: "dateFilter", dataSet: idRef("created", "dataSet") },
                { type: "dateFilter", dataSet: idRef("closed", "dataSet") },
            ],
        });

        expect(result).toEqual([attributeFilter, dateFilter]);
        expect(warnSpy).toHaveBeenCalledTimes(1);
        expect(warnSpy).toHaveBeenCalledWith(expect.any(String), granularityDateFilter);
    });

    it("skips an absolute date filter with granularity among the source measure filters", () => {
        const insight = sourceInsight(
            [],
            newMeasure(idRef("amount", "measure"), (m) =>
                m.localId("m1").filters(attributeFilter, granularityDateFilter),
            ),
        );

        const result = getIncludedSourceFiltersForDashboard(insight, {
            origin: { type: "drillFromMeasure", measure: localIdRef("m1") },
            includedSourceMeasureFiltersObjRefs: [
                { type: "attributeFilter", label: idRef("region", "displayForm") },
                { type: "dateFilter", dataSet: idRef("closed", "dataSet") },
            ],
        });

        expect(result).toEqual([attributeFilter]);
        expect(warnSpy).toHaveBeenCalledTimes(1);
        expect(warnSpy).toHaveBeenCalledWith(expect.any(String), granularityDateFilter);
    });
});
