// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { type IBucketItemMetricFilter } from "../../typings/bucket_item_filter.js";

import { buildMeasureAdditionalDateFilterLabels } from "./measureAdditionalDateFilterLabels.js";

describe("buildMeasureAdditionalDateFilterLabels", () => {
    const monthOfYearRef = idRef("date.monthOfYear", "displayForm");
    const dayOfWeekRef = idRef("date.dayOfWeek", "displayForm");
    const dateAttributes = [
        { dfRef: monthOfYearRef, dateType: "GDC.time.month_in_year" },
        { dfRef: dayOfWeekRef, dateType: "GDC.time.day_in_week" },
    ];
    const monthOfYear: IBucketItemMetricFilter = {
        attribute: "date.monthOfYear",
        displayFormRef: monthOfYearRef,
        selectedElements: [
            { uri: "1", title: "1", formattedTitle: "Jan" },
            { uri: "2", title: "2", available: false },
        ],
        isInverted: true,
        totalElementsCount: 12,
    };

    it("gives each filter its granularity and the filter bar's label shape", () => {
        expect(buildMeasureAdditionalDateFilterLabels([monthOfYear], dateAttributes)).toEqual([
            {
                granularity: "GDC.time.month_in_year",
                isAllSelected: false,
                isInverted: true,
                selectionSize: 1,
                selectedElements: [
                    { title: "1", available: true, formattedTitle: "Jan" },
                    { title: "2", available: false },
                ],
                totalElementsCount: 12,
            },
        ]);
    });

    it("keeps an unknown total unknown, so the label lists the values instead of a size", () => {
        const { totalElementsCount: _total, ...withoutTotal } = monthOfYear;

        expect(buildMeasureAdditionalDateFilterLabels([withoutTotal], dateAttributes)[0]).toMatchObject({
            totalElementsCount: undefined,
        });
    });

    it("leaves out a filter that selects everything, and one of an unknown attribute", () => {
        const all: IBucketItemMetricFilter = { ...monthOfYear, selectedElements: [] };
        const unknown: IBucketItemMetricFilter = {
            ...monthOfYear,
            displayFormRef: idRef("date.unknown", "displayForm"),
        };

        expect(buildMeasureAdditionalDateFilterLabels([all, unknown], dateAttributes)).toEqual([]);
    });
});
