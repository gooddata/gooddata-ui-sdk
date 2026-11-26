// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { NotSupported } from "@gooddata/sdk-backend-spi";
import {
    type FilterContextItem,
    type IAutomationMetadataObject,
    type IDashboard,
    type IFilter,
    idRef,
    newAbsoluteDateFilter,
    newAbsoluteGranularityDateFilter,
    newAllTimeDashboardDateFilter,
} from "@gooddata/sdk-model";

import {
    ABSOLUTE_GRANULARITY_DATE_FILTER_WITH_DATA_SET_NOT_SUPPORTED,
    assertNoAbsoluteGranularityDateFilterWithDataSetInDashboards,
    automationContainsAbsoluteGranularityDateFilter,
} from "./absoluteGranularityDateFilters.js";

const commonGranularityDateFilter: FilterContextItem = {
    dashboardAbsoluteGranularityDateFilter: {
        granularity: "GDC.time.year",
        from: "2025",
        to: "2026",
    },
};

const granularityDateFilter: FilterContextItem = {
    dashboardAbsoluteGranularityDateFilter: {
        granularity: "GDC.time.year",
        from: "2025",
        to: "2026",
        dataSet: idRef("date"),
    },
};

const dashboardWithFilters = (filters: FilterContextItem[]) =>
    ({ filterContext: { title: "", description: "", filters } }) as unknown as IDashboard;

const supportedDashboard = dashboardWithFilters([
    newAllTimeDashboardDateFilter(),
    commonGranularityDateFilter,
]);

describe("assertNoAbsoluteGranularityDateFilterWithDataSetInDashboards", () => {
    it("accepts dashboards and default filter overrides with the common filter only", () => {
        expect(() =>
            assertNoAbsoluteGranularityDateFilterWithDataSetInDashboards(
                [supportedDashboard, undefined],
                [commonGranularityDateFilter],
            ),
        ).not.toThrow();
    });

    it.each<[string, (IDashboard | undefined)[], FilterContextItem[] | undefined]>([
        [
            "any of the dashboards",
            [supportedDashboard, dashboardWithFilters([granularityDateFilter])],
            undefined,
        ],
        ["the default filter overrides", [supportedDashboard], [granularityDateFilter]],
    ])("rejects the filter for a date dataset in %s", (_desc, dashboards, overrideDefaultFilters) => {
        expect(() =>
            assertNoAbsoluteGranularityDateFilterWithDataSetInDashboards(dashboards, overrideDefaultFilters),
        ).toThrow(new NotSupported(ABSOLUTE_GRANULARITY_DATE_FILTER_WITH_DATA_SET_NOT_SUPPORTED));
    });
});

describe("automationContainsAbsoluteGranularityDateFilter", () => {
    const granularityExecutionFilter = newAbsoluteGranularityDateFilter(
        idRef("closed", "dataSet"),
        "GDC.time.year",
        "2025",
        "2026",
    );
    const dateFilter = newAbsoluteDateFilter(idRef("closed", "dataSet"), "2025-01-01", "2026-12-31");

    const alert = (filters: IFilter[]) =>
        ({ alert: { execution: { filters } } }) as unknown as IAutomationMetadataObject;
    const visualizationExport = (filters: (IFilter | FilterContextItem)[]) =>
        ({
            exportDefinitions: [
                {
                    requestPayload: {
                        type: "visualizationObject",
                        content: { visualizationObject: "", filters },
                    },
                },
            ],
        }) as unknown as IAutomationMetadataObject;
    const dashboardExport = (content: {
        filters?: FilterContextItem[];
        filtersByTab?: Record<string, FilterContextItem[]>;
    }) =>
        ({
            exportDefinitions: [
                { requestPayload: { type: "dashboard", content: { dashboard: "", ...content } } },
            ],
        }) as unknown as IAutomationMetadataObject;

    it.each<[string, IAutomationMetadataObject]>([
        ["the alert filters", alert([granularityExecutionFilter])],
        ["the visualization export filter context items", visualizationExport([granularityDateFilter])],
        ["the visualization export filters", visualizationExport([granularityExecutionFilter])],
        ["the dashboard export filters", dashboardExport({ filters: [granularityDateFilter] })],
        [
            "the dashboard export tab filters",
            dashboardExport({ filtersByTab: { tab: [granularityDateFilter] } }),
        ],
    ])("finds the filter in %s", (_desc, automation) => {
        expect(automationContainsAbsoluteGranularityDateFilter(automation)).toBe(true);
    });

    it.each<[string, IAutomationMetadataObject | undefined]>([
        [
            "an automation with other filters",
            {
                ...alert([dateFilter]),
                ...dashboardExport({ filtersByTab: { tab: [newAllTimeDashboardDateFilter()] } }),
            },
        ],
        ["no automation", undefined],
    ])("finds nothing in %s", (_desc, automation) => {
        expect(automationContainsAbsoluteGranularityDateFilter(automation)).toBe(false);
    });
});
