// (C) 2021-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { idRef, newAbsoluteGranularityDateFilter, uriRef } from "@gooddata/sdk-model";

import { EmptyDashboardWithReferences } from "../../tests/Dashboard.test.helpers.js";
import { SimpleDashboardWithReferences } from "../../tests/SimpleDashboard.test.helpers.js";
import { defaultDateFilterConfig } from "../dateFilterConfig/defaultConfig.js";

import {
    dashboardFilterContextDefinition,
    dashboardFilterContextSanitize,
    dashboardFilterToFilterContextItem,
} from "./dashboardFilterContext.js";
import {
    TestFilterContext,
    TestFilterContextWithInvalidParents,
} from "./dashboardFilterContext.test.helpers.js";
// TODO RAIL-3383 move the fixtures?

describe("dashboardFilterContextDefinition", () => {
    it("should return default filter context when dashboard does not have one", () => {
        const filterContext = dashboardFilterContextDefinition(
            EmptyDashboardWithReferences.dashboard,
            defaultDateFilterConfig,
        );

        expect(filterContext.ref).toBeUndefined();
        expect(filterContext.filters).toBeDefined();
    });

    it("should remove identity from persisted filter context", () => {
        const filterContext = dashboardFilterContextDefinition(
            SimpleDashboardWithReferences.dashboard,
            defaultDateFilterConfig,
        );

        expect(filterContext).toEqual({
            ...SimpleDashboardWithReferences.dashboard.filterContext,
            ref: undefined,
            uri: undefined,
            identifier: undefined,
        });
    });
});

describe("omitNonExistingParentsFromFilterContext", () => {
    it("should handle filters without local identifiers and parents", () => {
        const getResult = () => dashboardFilterContextSanitize(TestFilterContext);

        expect(getResult).not.toThrow();
    });

    it("should only remove connections to non-existing parents", () => {
        const result = dashboardFilterContextSanitize(TestFilterContextWithInvalidParents);

        expect(result.filters).toEqual([
            {
                dateFilter: {
                    type: "relative",
                    granularity: "GDC.time.date",
                },
            },
            {
                attributeFilter: {
                    attributeElements: {
                        uris: [
                            "/gdc/md/GoodSalesDemo/obj/1251/elements?id=169661",
                            "/gdc/md/GoodSalesDemo/obj/1251/elements?id=169658",
                        ],
                    },
                    displayForm: uriRef("/gdc/md/GoodSalesDemo/obj/1252"),
                    localIdentifier: "filter1",
                    negativeSelection: false,
                },
            },
            {
                attributeFilter: {
                    attributeElements: {
                        uris: ["/gdc/md/GoodSalesDemo/obj/1026/elements?id=1234"],
                    },
                    displayForm: uriRef("/gdc/md/GoodSalesDemo/obj/1027"),
                    localIdentifier: "filter2",
                    filterElementsBy: [
                        {
                            filterLocalIdentifier: "filter1",
                            over: {
                                attributes: [uriRef("/gdc/md/GoodSalesDemo/obj/9999")],
                            },
                        },
                    ],
                    negativeSelection: true,
                },
            },
        ]);
    });
});

describe("dashboardFilterToFilterContextItem", () => {
    const dataSet = idRef("closed", "dataSet");
    const filter = newAbsoluteGranularityDateFilter(dataSet, "GDC.time.week", "2026-05", "2026-08", {
        localIdentifier: "date",
        emptyValueHandling: "include",
    });

    it("should convert an absolute date filter with granularity to the common date filter", () => {
        expect(dashboardFilterToFilterContextItem(filter, false)).toStrictEqual({
            dashboardAbsoluteGranularityDateFilter: {
                granularity: "GDC.time.week",
                from: "2026-05",
                to: "2026-08",
                emptyValueHandling: "include",
                localIdentifier: "date",
            },
        });
    });

    it("should keep the date dataset of an absolute date filter with granularity", () => {
        expect(dashboardFilterToFilterContextItem(filter, true)).toEqual({
            dashboardAbsoluteGranularityDateFilter: {
                granularity: "GDC.time.week",
                from: "2026-05",
                to: "2026-08",
                emptyValueHandling: "include",
                localIdentifier: "date",
                dataSet,
            },
        });
    });

    it("should convert only one bound without a local identifier", () => {
        expect(
            dashboardFilterToFilterContextItem(
                newAbsoluteGranularityDateFilter(dataSet, "GDC.time.month", "2026-03"),
                false,
            ),
        ).toStrictEqual({
            dashboardAbsoluteGranularityDateFilter: { granularity: "GDC.time.month", from: "2026-03" },
        });
    });
});
