// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { newAbsoluteGranularityDateFilter, newPositiveAttributeFilter } from "../execution/filter/factory.js";
import { idRef, uriRef } from "../objRef/factory.js";

import {
    type FilterContextItem,
    type IDashboardAbsoluteGranularityDateFilter,
    newDashboardParameterizedDateFilter,
} from "./filterContext.js";
import { dashboardAttributeFilter } from "./filterContext.test.helpers.js";
import {
    filterContextItemsToDashboardFiltersByDateDataSet,
    filterContextItemsToDashboardFiltersByRichTextWidget,
    filterContextItemsToDashboardFiltersByWidget,
} from "./filterConverters.js";

const widgetDataSet = idRef("widget", "dataSet");
const ownDataSet = idRef("closed", "dataSet");
const requestedDataSet = idRef("requested", "dataSet");

const commonGranularityDateFilter: IDashboardAbsoluteGranularityDateFilter = {
    dashboardAbsoluteGranularityDateFilter: {
        granularity: "GDC.time.month",
        from: "2026-01",
        to: "2026-03",
        localIdentifier: "common",
    },
};

const granularityDateFilterWithDataSet: IDashboardAbsoluteGranularityDateFilter = {
    dashboardAbsoluteGranularityDateFilter: {
        granularity: "GDC.time.week",
        from: "2026-05",
        dataSet: ownDataSet,
        localIdentifier: "withDataSet",
        emptyValueHandling: "include",
    },
};

const openStartGranularityDateFilter: IDashboardAbsoluteGranularityDateFilter = {
    dashboardAbsoluteGranularityDateFilter: {
        granularity: "GDC.time.quarter",
        to: "2026-2",
        localIdentifier: "openStart",
    },
};

const filterContextItems: FilterContextItem[] = [
    dashboardAttributeFilter,
    commonGranularityDateFilter,
    granularityDateFilterWithDataSet,
    openStartGranularityDateFilter,
];

const attributeFilter = newPositiveAttributeFilter(uriRef("/displayForm"), { uris: [] });

describe("filter context with an absolute date filter with granularity", () => {
    it.each([
        ["filterContextItemsToDashboardFiltersByWidget", filterContextItemsToDashboardFiltersByWidget],
        [
            "filterContextItemsToDashboardFiltersByRichTextWidget",
            filterContextItemsToDashboardFiltersByRichTextWidget,
        ],
    ])(
        "%s should use the data set of the widget only for filters without their own data set",
        (_name, convert) => {
            expect(convert(filterContextItems, { dateDataSet: widgetDataSet })).toEqual([
                attributeFilter,
                newAbsoluteGranularityDateFilter(widgetDataSet, "GDC.time.month", "2026-01", "2026-03", {
                    localIdentifier: "common",
                }),
                newAbsoluteGranularityDateFilter(ownDataSet, "GDC.time.week", "2026-05", undefined, {
                    localIdentifier: "withDataSet",
                    emptyValueHandling: "include",
                }),
                newAbsoluteGranularityDateFilter(widgetDataSet, "GDC.time.quarter", undefined, "2026-2", {
                    localIdentifier: "openStart",
                }),
            ]);
        },
    );

    it("filterContextItemsToDashboardFiltersByDateDataSet should use the given data set", () => {
        expect(
            filterContextItemsToDashboardFiltersByDateDataSet(filterContextItems, requestedDataSet),
        ).toEqual([
            attributeFilter,
            newAbsoluteGranularityDateFilter(requestedDataSet, "GDC.time.month", "2026-01", "2026-03", {
                localIdentifier: "common",
            }),
            newAbsoluteGranularityDateFilter(requestedDataSet, "GDC.time.week", "2026-05", undefined, {
                localIdentifier: "withDataSet",
                emptyValueHandling: "include",
            }),
            newAbsoluteGranularityDateFilter(requestedDataSet, "GDC.time.quarter", undefined, "2026-2", {
                localIdentifier: "openStart",
            }),
        ]);
    });
});

describe("filter context with a parameterized date filter", () => {
    const items: FilterContextItem[] = [
        dashboardAttributeFilter,
        newDashboardParameterizedDateFilter(idRef("period", "parameter"), { localIdentifier: "period" }),
    ];

    it.each([
        ["filterContextItemsToDashboardFiltersByWidget", filterContextItemsToDashboardFiltersByWidget],
        [
            "filterContextItemsToDashboardFiltersByRichTextWidget",
            filterContextItemsToDashboardFiltersByRichTextWidget,
        ],
    ])("%s should throw", (_name, convert) => {
        expect(() => convert(items, { dateDataSet: widgetDataSet })).toThrow();
    });

    it("filterContextItemsToDashboardFiltersByDateDataSet should throw", () => {
        expect(() => filterContextItemsToDashboardFiltersByDateDataSet(items, requestedDataSet)).toThrow();
    });
});
