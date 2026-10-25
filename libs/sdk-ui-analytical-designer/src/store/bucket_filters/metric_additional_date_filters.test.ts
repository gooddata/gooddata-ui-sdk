// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { DATE_DATASET_ATTRIBUTE } from "../../models/date_item.js";
import { type IBucketItemMetricFilter } from "../../typings/bucket_item_filter.js";
import { type IAttributeFilter } from "../filter_bar/filter_bar_types.js";

import {
    isMetricAdditionalDateFilter,
    metricFilterToAttributeFilter,
    pickMetricAdditionalDateFilters,
    replaceMetricAdditionalDateFilters,
} from "./metric_additional_date_filters.js";

const monthOfYearDf = idRef("closed.month.in.year", "displayForm");
const dayOfWeekDf = idRef("closed.day.in.week", "displayForm");
const regionDf = idRef("region.name", "displayForm");

const dateDatasetAttributes = [{ dfRef: monthOfYearDf }, { dfRef: dayOfWeekDf }];

const dateFilter: IBucketItemMetricFilter = {
    attribute: DATE_DATASET_ATTRIBUTE,
    interval: { granularity: "GDC.time.year", interval: [-1, -1] },
    dimension: "closed",
};

const regionFilter: IBucketItemMetricFilter = {
    localIdentifier: "f-region",
    attribute: "region",
    displayFormRef: regionDf,
    selectedElements: [{ uri: "/r/1", title: "EU" }],
    isInverted: false,
    totalElementsCount: 5,
};

const monthOfYearFilter: IBucketItemMetricFilter = {
    localIdentifier: "f-month-of-year",
    attribute: "closed.month.in.year",
    displayFormRef: monthOfYearDf,
    selectedElements: [{ uri: "1", title: "January" }],
    isInverted: false,
    totalElementsCount: 12,
};

const dayOfWeekAttributeFilter: IAttributeFilter = {
    type: "attribute",
    localIdentifier: "new-day-of-week",
    cacheItemIdentifier: "closed.day.in.week",
    displayFormRef: dayOfWeekDf,
    filterConfig: {
        selectedElements: [{ uri: "2", title: "Tuesday" }],
        isInverted: false,
        totalElementsCount: 7,
    },
};

describe("metric additional date filters", () => {
    describe("isMetricAdditionalDateFilter", () => {
        it("recognizes an attribute filter on a date dataset attribute", () => {
            expect(isMetricAdditionalDateFilter(monthOfYearFilter, dateDatasetAttributes)).toBe(true);
        });

        it("ignores the date filter and attribute filters on regular attributes", () => {
            expect(isMetricAdditionalDateFilter(dateFilter, dateDatasetAttributes)).toBe(false);
            expect(isMetricAdditionalDateFilter(regionFilter, dateDatasetAttributes)).toBe(false);
        });
    });

    it("picks only the additional date filters, in order", () => {
        expect(
            pickMetricAdditionalDateFilters(
                [dateFilter, regionFilter, monthOfYearFilter],
                dateDatasetAttributes,
            ),
        ).toEqual([monthOfYearFilter]);
    });

    describe("metricFilterToAttributeFilter", () => {
        it("maps the stored filter to the filter bar shape", () => {
            expect(metricFilterToAttributeFilter(monthOfYearFilter)).toEqual({
                type: "attribute",
                localIdentifier: "f-month-of-year",
                cacheItemIdentifier: "closed.month.in.year",
                displayFormRef: monthOfYearDf,
                filterConfig: {
                    selectedElements: [{ uri: "1", title: "January" }],
                    isInverted: false,
                    totalElementsCount: 12,
                },
            });
        });

        it("keys a filter stored without a local identifier by its display form", () => {
            const { localIdentifier: _dropped, ...withoutIdentifier } = monthOfYearFilter;

            expect(metricFilterToAttributeFilter(withoutIdentifier).localIdentifier).toBe(
                "closed.month.in.year",
            );
        });
    });

    describe("replaceMetricAdditionalDateFilters", () => {
        const stored = [dateFilter, regionFilter, monthOfYearFilter];

        it("keeps every other filter and the identity of an additional filter whose selection changed", () => {
            const edited: IAttributeFilter = {
                ...metricFilterToAttributeFilter(monthOfYearFilter),
                localIdentifier: "a-different-identifier",
                filterConfig: {
                    selectedElements: [{ uri: "12", title: "December" }],
                    isInverted: true,
                    totalElementsCount: 12,
                },
            };

            const { filters, added, removed } = replaceMetricAdditionalDateFilters(
                stored,
                [edited],
                dateDatasetAttributes,
            );

            expect(filters.slice(0, 2)).toEqual([dateFilter, regionFilter]);
            expect(filters[2]).toMatchObject({
                localIdentifier: "f-month-of-year",
                attribute: "closed.month.in.year",
                selectedElements: [{ uri: "12", title: "December" }],
                isInverted: true,
            });
            expect(added).toEqual([]);
            expect(removed).toEqual([]);
        });

        it("adds a new additional filter with the identifier the picker gave it", () => {
            const { filters, added, removed } = replaceMetricAdditionalDateFilters(
                stored,
                [metricFilterToAttributeFilter(monthOfYearFilter), dayOfWeekAttributeFilter],
                dateDatasetAttributes,
            );

            expect(filters).toHaveLength(4);
            expect(filters[3]).toMatchObject({
                localIdentifier: "new-day-of-week",
                attribute: "closed.day.in.week",
                displayFormRef: dayOfWeekDf,
                selectedElements: [{ uri: "2", title: "Tuesday" }],
                isInverted: false,
                totalElementsCount: 7,
            });
            expect(added).toEqual([filters[3]]);
            expect(removed).toEqual([]);
        });

        it("drops the additional filters the applied set no longer contains", () => {
            const { filters, added, removed } = replaceMetricAdditionalDateFilters(
                stored,
                [],
                dateDatasetAttributes,
            );

            expect(filters).toEqual([dateFilter, regionFilter]);
            expect(added).toEqual([]);
            expect(removed).toEqual([monthOfYearFilter]);
        });
    });
});
