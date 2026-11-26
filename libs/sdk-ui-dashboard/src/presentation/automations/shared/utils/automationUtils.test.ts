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
    type IUser,
    idRef,
    newDashboardParameterizedDateFilter,
    uriRef,
} from "@gooddata/sdk-model";

import {
    getAutomationDashboardFilters as getStagingAutomationDashboardFilters,
    getAutomationDashboardFiltersByTab as getStagingAutomationDashboardFiltersByTab,
    getAutomationVisualizationFilters as getStagingAutomationVisualizationFilters,
} from "../../../../_staging/automation/index.js";
import { ABSOLUTE_GRANULARITY_DATE_FILTER_AUTOMATIONS_NOT_SUPPORTED } from "../../../../_staging/dashboard/absoluteGranularityDateFilters.js";

import {
    convertUserToAutomationRecipient,
    getAutomationDashboardFilters,
    getAutomationDashboardFiltersByTab,
    getAutomationVisualizationFilters,
} from "./automationUtils.js";

const currentUser: IUser = {
    ref: uriRef("/users/john.id"),
    login: "john.id",
    email: "john@example.com",
    fullName: "John Doe",
    firstName: "John",
    lastName: "Doe",
};

describe("convertUserToAutomationRecipient", () => {
    it("builds the default recipient from the dashboard user", () => {
        expect(convertUserToAutomationRecipient(currentUser)).toEqual({
            id: "john.id",
            email: "john@example.com",
            name: "John Doe",
            type: "user",
        });
    });
});

describe.each([
    [
        "_staging/automation",
        {
            getAutomationDashboardFilters: getStagingAutomationDashboardFilters,
            getAutomationDashboardFiltersByTab: getStagingAutomationDashboardFiltersByTab,
            getAutomationVisualizationFilters: getStagingAutomationVisualizationFilters,
        },
    ],
    [
        "automationUtils",
        {
            getAutomationDashboardFilters,
            getAutomationDashboardFiltersByTab,
            getAutomationVisualizationFilters,
        },
    ],
])("filters of export definitions with an absolute date filter with granularity (%s)", (_name, getters) => {
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
        expect(() => getters.getAutomationDashboardFilters(automation)).toThrow(
            new NotSupported(ABSOLUTE_GRANULARITY_DATE_FILTER_AUTOMATIONS_NOT_SUPPORTED),
        );
    });

    it("getAutomationDashboardFiltersByTab should throw", () => {
        const automation = automationWith({
            type: "dashboard",
            content: { filtersByTab: { "tab-A": [granularityDateFilter] } },
        });
        expect(() => getters.getAutomationDashboardFiltersByTab(automation)).toThrow(
            new NotSupported(ABSOLUTE_GRANULARITY_DATE_FILTER_AUTOMATIONS_NOT_SUPPORTED),
        );
    });

    it("getAutomationVisualizationFilters should throw", () => {
        const automation = automationWith({
            type: "visualizationObject",
            content: { filters: [granularityDateFilter] },
        });
        expect(() => getters.getAutomationVisualizationFilters(automation)).toThrow(
            new NotSupported(ABSOLUTE_GRANULARITY_DATE_FILTER_AUTOMATIONS_NOT_SUPPORTED),
        );
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
