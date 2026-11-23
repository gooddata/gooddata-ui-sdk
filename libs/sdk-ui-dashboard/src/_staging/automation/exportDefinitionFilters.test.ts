// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { NotSupported } from "@gooddata/sdk-backend-spi";
import { type FilterContextItem, type IAutomationMetadataObject } from "@gooddata/sdk-model";

import {
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
