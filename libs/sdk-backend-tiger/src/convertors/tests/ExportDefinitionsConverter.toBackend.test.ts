// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type DashboardTabularExportRequestV2 } from "@gooddata/api-client-tiger";
import {
    type FilterContextItem,
    type IDashboardAttributeFilter,
    type IExportDefinitionDashboardRequestPayload,
    type IExportDefinitionVisualizationObjectRequestPayload,
    idRef,
    newMeasureValueFilterWithOptions,
} from "@gooddata/sdk-model";

import {
    convertToDashboardTabularExportRequest,
    convertToTabularExportRequest,
    convertToVisualExportRequest,
    convertVisualizationToDashboardTabularExportRequest,
} from "../toBackend/ExportDefinitionsConverter.js";

describe("ExportDefinitionsConverter toBackend", () => {
    it("converts compound MVF in visualization tabular export", () => {
        const request: IExportDefinitionVisualizationObjectRequestPayload = {
            type: "visualizationObject",
            fileName: "tabular",
            format: "CSV",
            content: {
                visualizationObject: "visId",
                widget: "widgetId",
                dashboard: "dashboardId",
                filters: [
                    newMeasureValueFilterWithOptions(idRef("m1", "measure"), {
                        conditions: [
                            { operator: "GREATER_THAN", value: 10 },
                            { operator: "BETWEEN", from: 1, to: 5 },
                        ],
                        treatNullValuesAs: 7,
                    }),
                ],
            },
        };

        const result = convertToTabularExportRequest(request);
        const filters = result.visualizationObjectCustomFilters as Array<{
            measureValueFilter?: {
                condition?: { compound?: { conditions: unknown[]; treatNullValuesAs?: number } };
            };
        }>;

        expect(filters).toHaveLength(1);
        expect(filters[0].measureValueFilter?.condition?.compound?.treatNullValuesAs).toBe(7);
        expect(filters[0].measureValueFilter?.condition?.compound?.conditions).toHaveLength(2);
    });

    it("converts dashboard filter context metadata in visual export", () => {
        const dashboardFilter: FilterContextItem = {
            attributeFilter: {
                displayForm: idRef("attr.df", "displayForm"),
                negativeSelection: false,
                attributeElements: { values: ["North"] },
            },
        };

        const request: IExportDefinitionDashboardRequestPayload = {
            type: "dashboard",
            fileName: "dashboard-visual",
            format: "PDF",
            content: {
                dashboard: "dashboardId",
                filters: [dashboardFilter],
                filtersByTab: {
                    tab1: [dashboardFilter],
                },
            },
        };

        const result = convertToVisualExportRequest(request, "My title");
        const metadata = result.metadata as {
            title?: string;
            filters?: FilterContextItem[];
            filtersByTab?: Record<string, FilterContextItem[]>;
        };

        expect(metadata.title).toBe("My title");
        expect(metadata.filters).toHaveLength(1);
        expect(metadata.filtersByTab?.["tab1"]).toHaveLength(1);

        const convertedFilter = metadata.filters?.[0] as IDashboardAttributeFilter;
        expect(convertedFilter.attributeFilter.displayForm).toEqual({
            identifier: { id: "attr.df", type: "label" },
        });
    });

    it("keeps dashboard override empty for non-FilterContextItem filters", () => {
        const request: IExportDefinitionVisualizationObjectRequestPayload = {
            type: "visualizationObject",
            fileName: "xlsx-export",
            format: "XLSX",
            content: {
                visualizationObject: "visId",
                widget: "widgetId",
                dashboard: "dashboardId",
                filters: [
                    newMeasureValueFilterWithOptions(idRef("m1", "measure"), {
                        conditions: [{ operator: "GREATER_THAN", value: 10 }],
                    }),
                ],
            },
        };

        const result = convertVisualizationToDashboardTabularExportRequest(request);
        expect(result.dashboardFiltersOverride).toEqual([]);
    });

    it("maps FilterContextItem filters to dashboard override in dashboard tabular export", () => {
        const dashboardFilter: FilterContextItem = {
            dateFilter: {
                type: "absolute",
                granularity: "GDC.time.date",
                from: "2020-01-01",
                to: "2020-01-31",
                dataSet: idRef("date.ds", "dataSet"),
            },
        };

        const request: IExportDefinitionDashboardRequestPayload = {
            type: "dashboard",
            fileName: "dashboard-tabular",
            format: "XLSX",
            content: {
                dashboard: "dashboardId",
                filters: [dashboardFilter],
            },
        };

        const result: DashboardTabularExportRequestV2 = convertToDashboardTabularExportRequest(request);
        expect(result.dashboardFiltersOverride).toHaveLength(1);
    });
});
