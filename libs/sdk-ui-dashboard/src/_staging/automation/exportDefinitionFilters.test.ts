// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { NotSupported } from "@gooddata/sdk-backend-spi";
import {
    type FilterContextItem,
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type IExportDefinitionDashboardContent,
    type IExportDefinitionRequestPayload,
    type IFilter,
    idRef,
    newAbsoluteGranularityDateFilter,
    newAllTimeDashboardDateFilter,
    newDashboardParameterizedDateFilter,
    newParameterizedDateFilter,
} from "@gooddata/sdk-model";

import {
    automationHasUneditableDateFilter,
    getAutomationDashboardFilters,
    getAutomationDashboardFiltersByTab,
    getAutomationVisualizationFilters,
} from "./index.js";

describe("filters of export definitions with an absolute date filter with granularity", () => {
    const granularityDateFilter: FilterContextItem = {
        dashboardAbsoluteGranularityDateFilter: {
            granularity: "GDC.time.month",
            from: "2026-01",
            to: "2026-03",
        },
    };
    const automationWith = (requestPayload: unknown) =>
        ({ exportDefinitions: [{ requestPayload }] }) as unknown as IAutomationMetadataObject;

    it("getAutomationDashboardFilters should throw", () => {
        const automation = automationWith({
            type: "dashboard",
            content: { filters: [granularityDateFilter] },
        });
        expect(() => getAutomationDashboardFilters(automation)).toThrow(NotSupported);
    });

    it("getAutomationDashboardFiltersByTab should throw", () => {
        const automation = automationWith({
            type: "dashboard",
            content: { filtersByTab: { "tab-A": [granularityDateFilter] } },
        });
        expect(() => getAutomationDashboardFiltersByTab(automation)).toThrow(NotSupported);
    });

    it("getAutomationVisualizationFilters should throw", () => {
        const automation = automationWith({
            type: "visualizationObject",
            content: { filters: [granularityDateFilter] },
        });
        expect(() => getAutomationVisualizationFilters(automation)).toThrow(NotSupported);
    });
});

describe("filters of export definitions with a parameterized date filter", () => {
    const parameterizedDateFilter = newDashboardParameterizedDateFilter(idRef("period", "parameter"));
    const automationWith = (
        requestPayload: IExportDefinitionRequestPayload,
    ): IAutomationMetadataObjectDefinition => ({
        type: "automation",
        exportDefinitions: [{ type: "exportDefinition", requestPayload }],
    });
    const dashboardExport = (content: Omit<IExportDefinitionDashboardContent, "dashboard">) =>
        automationWith({
            type: "dashboard",
            fileName: "export",
            format: "PDF",
            content: { dashboard: "dashboard", ...content },
        });

    it.each([
        [
            "getAutomationDashboardFilters",
            () => getAutomationDashboardFilters(dashboardExport({ filters: [parameterizedDateFilter] })),
        ],
        [
            "getAutomationDashboardFiltersByTab",
            () =>
                getAutomationDashboardFiltersByTab(
                    dashboardExport({ filtersByTab: { "tab-A": [parameterizedDateFilter] } }),
                ),
        ],
        [
            "getAutomationVisualizationFilters",
            () =>
                getAutomationVisualizationFilters(
                    automationWith({
                        type: "visualizationObject",
                        fileName: "export",
                        format: "XLSX",
                        content: { visualizationObject: "visualization", filters: [parameterizedDateFilter] },
                    }),
                ),
        ],
    ])("%s should throw", (_name, getFilters) => {
        expect(getFilters).toThrow(NotSupported);
    });
});

describe("automationHasUneditableDateFilter", () => {
    const visualizationExport = (filters: IFilter[] | FilterContextItem[]): IAutomationMetadataObject => ({
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
                requestPayload: {
                    type: "visualizationObject",
                    fileName: "export",
                    format: "XLSX",
                    content: { visualizationObject: "visualization", filters },
                },
            },
        ],
    });
    const dataSet = idRef("closed", "dataSet");

    it.each<[string, IAutomationMetadataObject]>([
        [
            "a parameterized date filter context item",
            visualizationExport([newDashboardParameterizedDateFilter(idRef("period", "parameter"))]),
        ],
        [
            "an absolute date filter context item with granularity",
            visualizationExport([
                {
                    dashboardAbsoluteGranularityDateFilter: {
                        granularity: "GDC.time.month",
                        from: "2026-01",
                    },
                },
            ]),
        ],
    ])("is true for %s", (_desc, automation) => {
        expect(automationHasUneditableDateFilter(automation)).toBe(true);
    });

    it.each<[string, IAutomationMetadataObject]>([
        [
            "execution filters, which the getters accept",
            visualizationExport([
                newParameterizedDateFilter(dataSet, idRef("period", "parameter")),
                newAbsoluteGranularityDateFilter(dataSet, "GDC.time.month", "2026-01", "2026-03"),
            ]),
        ],
        ["other filter context items", visualizationExport([newAllTimeDashboardDateFilter()])],
    ])("is false for %s", (_desc, automation) => {
        expect(automationHasUneditableDateFilter(automation)).toBe(false);
    });
});
