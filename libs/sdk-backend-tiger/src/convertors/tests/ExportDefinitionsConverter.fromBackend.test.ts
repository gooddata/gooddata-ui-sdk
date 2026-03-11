// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type AutomationAutomationTabularExport,
    type JsonApiAutomationOutAttributesDashboardTabularExportsInner,
} from "@gooddata/api-client-tiger";
import {
    type IDashboardAttributeFilter,
    type IExportDefinitionDashboardRequestPayload,
    type IMeasureValueFilter,
    idRef,
    isMeasureValueFilter,
} from "@gooddata/sdk-model";

import {
    convertDashboardTabularExportRequest,
    convertTabularExportRequest,
} from "../fromBackend/ExportDefinitionsConverter.js";

describe("ExportDefinitionsConverter fromBackend", () => {
    it("converts compound Tiger MVF in visualizationObjectCustomFilters to SDK conditions", () => {
        const exportRequest = {
            requestPayload: {
                fileName: "tabular",
                format: "CSV",
                visualizationObject: "visId",
                relatedDashboardId: "dashboardId",
                visualizationObjectCustomFilters: [
                    {
                        measureValueFilter: {
                            measure: { identifier: { id: "m1", type: "metric" } },
                            condition: {
                                compound: {
                                    treatNullValuesAs: 5,
                                    conditions: [
                                        { comparison: { operator: "GREATER_THAN", value: 10 } },
                                        { range: { operator: "BETWEEN", from: 1, to: 9 } },
                                    ],
                                },
                            },
                        },
                    },
                ],
                metadata: { widget: "widgetId" },
                settings: {},
            },
        } as unknown as AutomationAutomationTabularExport;

        const result = convertTabularExportRequest(exportRequest);
        const mvf = result.content.filters?.[0] as IMeasureValueFilter;

        expect(result.content.filters).toHaveLength(1);
        expect(mvf).toBeDefined();
        expect(isMeasureValueFilter(mvf)).toBe(true);
        expect(mvf.measureValueFilter.conditions).toEqual([
            { comparison: { operator: "GREATER_THAN", value: 10, treatNullValuesAs: 5 } },
            { range: { operator: "BETWEEN", from: 1, to: 9, treatNullValuesAs: 5 } },
        ]);
    });

    it("converts dashboard tabular widget override filters through stored filter conversion", () => {
        const exportRequest = {
            requestPayload: {
                fileName: "dashboard-tabular",
                format: "XLSX",
                dashboardId: "dashboardId",
                widgetIds: ["widgetId"],
                dashboardFiltersOverride: [
                    {
                        measureValueFilter: {
                            measure: { identifier: { id: "m1", type: "metric" } },
                            condition: {
                                compound: {
                                    treatNullValuesAs: 1,
                                    conditions: [{ comparison: { operator: "GREATER_THAN", value: 3 } }],
                                },
                            },
                        },
                    },
                ],
                settings: {},
            },
        } as unknown as JsonApiAutomationOutAttributesDashboardTabularExportsInner;

        const result = convertDashboardTabularExportRequest(exportRequest);
        expect(result.type).toBe("visualizationObject");
        expect(result.content.filters).toHaveLength(1);
        expect(isMeasureValueFilter(result.content.filters?.[0])).toBe(true);
    });

    it("converts dashboard tab-level filters to FilterContextItem[]", () => {
        const tigerDashboardFilter = {
            attributeFilter: {
                displayForm: {
                    identifier: { id: "attr.df", type: "label" },
                },
                negativeSelection: false,
                attributeElements: { values: ["A"] },
            },
        };

        const exportRequest = {
            requestPayload: {
                fileName: "dashboard-tabular-no-widget",
                format: "XLSX",
                dashboardId: "dashboardId",
                dashboardTabsFiltersOverrides: {
                    tab1: [tigerDashboardFilter],
                },
                settings: {},
            },
        } as unknown as JsonApiAutomationOutAttributesDashboardTabularExportsInner;

        const result = convertDashboardTabularExportRequest(
            exportRequest,
        ) as IExportDefinitionDashboardRequestPayload;
        expect(result.type).toBe("dashboard");
        expect(result.content.filtersByTab?.["tab1"]).toHaveLength(1);
        const converted = result.content.filtersByTab?.["tab1"]?.[0] as IDashboardAttributeFilter;
        expect(converted).toBeDefined();
        expect(converted.attributeFilter.displayForm).toEqual(idRef("attr.df", "displayForm"));
    });
});
