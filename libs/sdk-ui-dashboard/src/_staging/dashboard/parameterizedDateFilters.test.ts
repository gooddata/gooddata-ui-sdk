// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { NotSupported } from "@gooddata/sdk-backend-spi";
import {
    type FilterContextItem,
    type IAutomationMetadataObject,
    type IDashboard,
    type IExportDefinitionRequestPayload,
    type IFilter,
    type IFilterContext,
    idRef,
    newAllTimeDashboardDateFilter,
    newDashboardParameterizedDateFilter,
    newParameterizedDateFilter,
} from "@gooddata/sdk-model";

import { EmptyDashboardWithReferences } from "../../tests/Dashboard.test.helpers.js";

import {
    assertNoParameterizedDateFilterInDashboards,
    automationContainsDashboardParameterizedDateFilter,
    dashboardContainsParameterizedDateFilter,
} from "./parameterizedDateFilters.js";

const parameterizedDateFilter = newDashboardParameterizedDateFilter(idRef("period", "parameter"));

const filterContext = (filters: FilterContextItem[]): IFilterContext => ({
    ref: idRef("filterContext"),
    uri: "filterContext",
    identifier: "filterContext",
    title: "",
    description: "",
    filters,
});

const dashboardWithFilters = (
    filters: FilterContextItem[],
    tabFilters?: FilterContextItem[],
): IDashboard => ({
    ...EmptyDashboardWithReferences.dashboard,
    filterContext: filterContext(filters),
    tabs: tabFilters
        ? [{ localIdentifier: "tab", title: "Tab", filterContext: filterContext(tabFilters) }]
        : [],
});

const supportedDashboard = dashboardWithFilters([newAllTimeDashboardDateFilter()]);

describe("assertNoParameterizedDateFilterInDashboards", () => {
    it("accepts dashboards and default filter overrides without the filter", () => {
        expect(() =>
            assertNoParameterizedDateFilterInDashboards(
                [supportedDashboard, undefined],
                [newAllTimeDashboardDateFilter()],
            ),
        ).not.toThrow();
    });

    it.each<[string, (IDashboard | undefined)[], FilterContextItem[] | undefined]>([
        [
            "any of the dashboards",
            [supportedDashboard, dashboardWithFilters([parameterizedDateFilter])],
            undefined,
        ],
        ["the default filter overrides", [supportedDashboard], [parameterizedDateFilter]],
    ])("rejects the filter in %s", (_desc, dashboards, overrideDefaultFilters) => {
        expect(() => assertNoParameterizedDateFilterInDashboards(dashboards, overrideDefaultFilters)).toThrow(
            NotSupported,
        );
    });
});

describe("dashboardContainsParameterizedDateFilter", () => {
    it("finds the filter in a tab", () => {
        expect(
            dashboardContainsParameterizedDateFilter(dashboardWithFilters([], [parameterizedDateFilter])),
        ).toBe(true);
    });

    it("finds nothing in a dashboard with other filters", () => {
        expect(dashboardContainsParameterizedDateFilter(supportedDashboard)).toBe(false);
    });
});

describe("automationContainsDashboardParameterizedDateFilter", () => {
    const automation = (requestPayload: IExportDefinitionRequestPayload): IAutomationMetadataObject => ({
        type: "automation",
        id: "automation",
        ref: idRef("automation", "automation"),
        uri: "automation",
        title: "",
        description: "",
        production: true,
        deprecated: false,
        unlisted: false,
        exportDefinitions: [
            {
                type: "exportDefinition",
                id: "export",
                ref: idRef("export", "exportDefinition"),
                uri: "export",
                title: "",
                description: "",
                production: true,
                deprecated: false,
                unlisted: false,
                requestPayload,
            },
        ],
    });
    const visualizationExport = (filters: IFilter[] | FilterContextItem[]) =>
        automation({
            type: "visualizationObject",
            fileName: "export",
            format: "XLSX",
            content: { visualizationObject: "visualization", filters },
        });
    const dashboardExport = (content: {
        filters?: FilterContextItem[];
        filtersByTab?: Record<string, FilterContextItem[]>;
    }) =>
        automation({
            type: "dashboard",
            fileName: "export",
            format: "PDF",
            content: { dashboard: "dashboard", ...content },
        });

    it.each<[string, IAutomationMetadataObject]>([
        ["the visualization export filter context items", visualizationExport([parameterizedDateFilter])],
        ["the dashboard export filters", dashboardExport({ filters: [parameterizedDateFilter] })],
        [
            "the dashboard export tab filters",
            dashboardExport({ filtersByTab: { tab: [parameterizedDateFilter] } }),
        ],
    ])("finds the filter in %s", (_desc, automation) => {
        expect(automationContainsDashboardParameterizedDateFilter(automation)).toBe(true);
    });

    it.each<[string, IAutomationMetadataObject | undefined]>([
        [
            "the execution filter of a visualization export",
            visualizationExport([
                newParameterizedDateFilter(idRef("closed", "dataSet"), idRef("period", "parameter")),
            ]),
        ],
        [
            "an automation with other filters",
            dashboardExport({ filtersByTab: { tab: [newAllTimeDashboardDateFilter()] } }),
        ],
        ["no automation", undefined],
    ])("finds nothing in %s", (_desc, automation) => {
        expect(automationContainsDashboardParameterizedDateFilter(automation)).toBe(false);
    });
});
