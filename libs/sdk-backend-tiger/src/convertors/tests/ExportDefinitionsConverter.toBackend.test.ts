// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type DashboardTabularExportRequestV2 } from "@gooddata/api-client-tiger";
import {
    type FilterContextItem,
    type IDashboardAttributeFilter,
    type IDashboardExportParameter,
    type IExecutionDefinition,
    type IExportDefinitionDashboardRequestPayload,
    type IExportDefinitionVisualizationObjectRequestPayload,
    idRef,
    newMeasureValueFilterWithOptions,
} from "@gooddata/sdk-model";

import {
    convertExportDefinitionRequestPayload,
    convertToDashboardTabularExportRequest,
    convertToImageExportRequest,
    convertToRawExportRequest,
    convertToSlidesExportRequest,
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

    it("passes CSV delimiter to visualization tabular export", () => {
        const request: IExportDefinitionVisualizationObjectRequestPayload = {
            type: "visualizationObject",
            fileName: "tabular",
            format: "CSV",
            settings: {
                delimiter: ";",
            },
            content: {
                visualizationObject: "visId",
                widget: "widgetId",
                dashboard: "dashboardId",
            },
        };

        const result = convertToTabularExportRequest(request);

        expect(result.settings?.delimiter).toBe(";");
    });

    it("passes CSV delimiter to raw export", () => {
        const request: IExportDefinitionVisualizationObjectRequestPayload = {
            type: "visualizationObject",
            fileName: "raw-export",
            format: "CSV_RAW",
            settings: {
                delimiter: "|",
            },
            content: {
                visualizationObject: "visId",
                widget: "widgetId",
                dashboard: "dashboardId",
            },
        };
        const widgetExecution: IExecutionDefinition = {
            workspace: "workspaceId",
            buckets: [],
            attributes: [],
            measures: [],
            filters: [],
            sortBy: [],
            dimensions: [],
        };

        const result = convertToRawExportRequest(request, widgetExecution);

        expect(result.delimiter).toBe("|");
    });

    it("routes executionConfig.parameterValues to execution.parameters in raw export", () => {
        const request: IExportDefinitionVisualizationObjectRequestPayload = {
            type: "visualizationObject",
            fileName: "raw-export",
            format: "CSV_RAW",
            content: {
                visualizationObject: "visId",
                widget: "widgetId",
                dashboard: "dashboardId",
            },
        };
        const widgetExecution: IExecutionDefinition = {
            workspace: "workspaceId",
            buckets: [],
            attributes: [],
            measures: [],
            filters: [],
            sortBy: [],
            dimensions: [],
            executionConfig: {
                parameterValues: [{ ref: idRef("topN", "parameter"), value: 5 }],
            },
        };

        const result = convertToRawExportRequest(request, widgetExecution);

        expect(result.execution.parameters).toEqual([
            { parameter: { identifier: { id: "topN", type: "parameter" } }, value: "5" },
        ]);
        // parameterValues must not leak into executionSettings (backend rejects unknown fields there)
        expect(result.executionSettings).toBeUndefined();
    });

    it("keeps real execution settings in executionSettings, stripped of parameterValues, in raw export", () => {
        const request: IExportDefinitionVisualizationObjectRequestPayload = {
            type: "visualizationObject",
            fileName: "raw-export",
            format: "CSV_RAW",
            content: {
                visualizationObject: "visId",
                widget: "widgetId",
                dashboard: "dashboardId",
            },
        };
        const widgetExecution: IExecutionDefinition = {
            workspace: "workspaceId",
            buckets: [],
            attributes: [],
            measures: [],
            filters: [],
            sortBy: [],
            dimensions: [],
            executionConfig: {
                dataSamplingPercentage: 50,
                parameterValues: [{ ref: idRef("topN", "parameter"), value: 5 }],
            },
        };

        const result = convertToRawExportRequest(request, widgetExecution);

        expect(result.executionSettings).toEqual({ dataSamplingPercentage: 50 });
        expect(result.execution.parameters).toHaveLength(1);
    });

    it("routes executionConfig.measureDefinitionOverrides to execution.measureDefinitionOverrides in raw export", () => {
        const request: IExportDefinitionVisualizationObjectRequestPayload = {
            type: "visualizationObject",
            fileName: "raw-export",
            format: "CSV_RAW",
            content: {
                visualizationObject: "visId",
                widget: "widgetId",
                dashboard: "dashboardId",
            },
        };
        const widgetExecution: IExecutionDefinition = {
            workspace: "workspaceId",
            buckets: [],
            attributes: [],
            measures: [],
            filters: [],
            sortBy: [],
            dimensions: [],
            executionConfig: {
                measureDefinitionOverrides: [
                    {
                        item: { identifier: { id: "m1", type: "metric" } },
                        definition: { inline: { maql: "SELECT 1" } },
                    },
                ],
            },
        };

        const result = convertToRawExportRequest(request, widgetExecution);

        expect(result.execution.measureDefinitionOverrides).toEqual([
            {
                item: { identifier: { id: "m1", type: "metric" } },
                definition: { inline: { maql: "SELECT 1" } },
            },
        ]);
        // like parameterValues, overrides must not leak into executionSettings
        expect(result.executionSettings).toBeUndefined();
    });

    it("emits metadata.parametersByTab from viz-object content in raw export", () => {
        const parameter: IDashboardExportParameter = { id: "topN", value: "5", title: "Top N" };
        const request: IExportDefinitionVisualizationObjectRequestPayload = {
            type: "visualizationObject",
            fileName: "raw-export",
            format: "CSV_RAW",
            content: {
                visualizationObject: "visId",
                widget: "widgetId",
                dashboard: "dashboardId",
                parametersByTab: { tabOwning: [parameter] },
            },
        };
        const widgetExecution: IExecutionDefinition = {
            workspace: "workspaceId",
            buckets: [],
            attributes: [],
            measures: [],
            filters: [],
            sortBy: [],
            dimensions: [],
        };

        const result = convertToRawExportRequest(request, widgetExecution);
        const metadata = result.metadata as {
            parametersByTab?: Record<string, IDashboardExportParameter[]>;
        };

        expect(metadata.parametersByTab?.["tabOwning"]).toEqual([parameter]);
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

    it("preserves common date filter without dataSet in dashboard override", () => {
        const commonDateFilter: FilterContextItem = {
            dateFilter: {
                type: "relative",
                granularity: "GDC.time.date",
                from: -29,
                to: 0,
            },
        };

        const request: IExportDefinitionVisualizationObjectRequestPayload = {
            type: "visualizationObject",
            fileName: "xlsx-export",
            format: "XLSX",
            content: {
                visualizationObject: "visId",
                widget: "widgetId",
                dashboard: "dashboardId",
                filters: [commonDateFilter],
            },
        };

        const result = convertVisualizationToDashboardTabularExportRequest(request);
        expect(result.dashboardFiltersOverride).toHaveLength(1);
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

    it("emits metadata.parametersByTab from dashboard content in visual export", () => {
        const parameter: IDashboardExportParameter = { id: "p1", value: "42", title: "Param 1" };
        const request: IExportDefinitionDashboardRequestPayload = {
            type: "dashboard",
            fileName: "dashboard-visual",
            format: "PDF",
            content: {
                dashboard: "dashboardId",
                parametersByTab: { tab1: [parameter] },
            },
        };

        const result = convertToVisualExportRequest(request);
        const metadata = result.metadata as {
            parametersByTab?: Record<string, IDashboardExportParameter[]>;
        };

        expect(metadata.parametersByTab?.["tab1"]).toEqual([parameter]);
    });

    it("emits per-tab params flat alongside viz-object filters in image (PNG) export", () => {
        const parameter: IDashboardExportParameter = { id: "p1", value: "7", title: "Param 1" };
        const widgetFilter: FilterContextItem = {
            attributeFilter: {
                displayForm: idRef("attr.df", "displayForm"),
                negativeSelection: false,
                attributeElements: { values: ["North"] },
            },
        };
        const request: IExportDefinitionVisualizationObjectRequestPayload = {
            type: "visualizationObject",
            fileName: "widget-png",
            format: "PNG",
            content: {
                visualizationObject: "visId",
                widget: "widgetId",
                dashboard: "dashboardId",
                filters: [widgetFilter],
                parametersByTab: { tabOwning: [parameter] },
            },
        };

        const result = convertToImageExportRequest(request);
        const metadata = result.metadata as {
            filters?: FilterContextItem[];
            parametersByTab?: Record<string, IDashboardExportParameter[]>;
        };

        expect(metadata.parametersByTab?.["tabOwning"]).toEqual([parameter]);
        expect(metadata.filters).toHaveLength(1);
    });

    it("emits metadata.parametersByTab from dashboard content in slides export", () => {
        const parameter: IDashboardExportParameter = { id: "p1", value: "42", title: "Param 1" };
        const request: IExportDefinitionDashboardRequestPayload = {
            type: "dashboard",
            fileName: "dashboard-slides",
            format: "PDF_SLIDES",
            content: {
                dashboard: "dashboardId",
                parametersByTab: { tab1: [parameter] },
            },
        };

        const result = convertToSlidesExportRequest(request);
        const metadata = result.metadata as {
            parametersByTab?: Record<string, IDashboardExportParameter[]>;
        };

        expect(metadata.parametersByTab?.["tab1"]).toEqual([parameter]);
    });

    it("emits metadata.parametersByTab from viz-object content in widget slides export", () => {
        const parameter: IDashboardExportParameter = { id: "p1", value: "9", title: "Param 1" };
        const request: IExportDefinitionVisualizationObjectRequestPayload = {
            type: "visualizationObject",
            fileName: "widget-slides",
            format: "PPTX",
            content: {
                visualizationObject: "visId",
                widget: "widgetId",
                dashboard: "dashboardId",
                parametersByTab: { tabOwning: [parameter] },
            },
        };

        const result = convertToSlidesExportRequest(request);
        const metadata = result.metadata as {
            parametersByTab?: Record<string, IDashboardExportParameter[]>;
        };

        expect(metadata.parametersByTab?.["tabOwning"]).toEqual([parameter]);
    });

    it("emits metadata.parametersByTab from dashboard content in standalone export definition", () => {
        const parameter: IDashboardExportParameter = { id: "p1", value: "42", title: "Param 1" };
        const request: IExportDefinitionDashboardRequestPayload = {
            type: "dashboard",
            fileName: "dashboard-export-definition",
            format: "PDF",
            content: {
                dashboard: "dashboardId",
                parametersByTab: { tab1: [parameter] },
            },
        };

        const result = convertExportDefinitionRequestPayload(request);
        const metadata = result.metadata as {
            parametersByTab?: Record<string, IDashboardExportParameter[]>;
        };

        expect(metadata.parametersByTab?.["tab1"]).toEqual([parameter]);
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

    it("maps content.parametersByTab to dashboardTabsParametersOverrides in dashboard tabular export", () => {
        const request: IExportDefinitionDashboardRequestPayload = {
            type: "dashboard",
            fileName: "dashboard-tabular",
            format: "XLSX",
            content: {
                dashboard: "dashboardId",
                parametersByTab: {
                    tab1: [{ id: "topN", value: "5", title: "Top N" }],
                    tab2: [{ id: "limit", value: "10", title: "Limit" }],
                },
            },
        };

        const result = convertToDashboardTabularExportRequest(request);

        expect(result.dashboardTabsParametersOverrides).toEqual({
            tab1: [{ id: "topN", value: "5", title: "Top N" }],
            tab2: [{ id: "limit", value: "10", title: "Limit" }],
        });
    });

    it("omits dashboardTabsParametersOverrides when content has no parametersByTab", () => {
        const request: IExportDefinitionDashboardRequestPayload = {
            type: "dashboard",
            fileName: "dashboard-tabular",
            format: "XLSX",
            content: { dashboard: "dashboardId" },
        };

        expect(
            convertToDashboardTabularExportRequest(request).dashboardTabsParametersOverrides,
        ).toBeUndefined();
    });

    it("maps content.parametersByTab to dashboardTabsParametersOverrides in widget tabular export", () => {
        const request: IExportDefinitionVisualizationObjectRequestPayload = {
            type: "visualizationObject",
            fileName: "widget-tabular",
            format: "XLSX",
            content: {
                visualizationObject: "visId",
                widget: "widgetId",
                dashboard: "dashboardId",
                parametersByTab: {
                    tabOwning: [{ id: "topN", value: "5", title: "Top N" }],
                },
            },
        };

        const result = convertVisualizationToDashboardTabularExportRequest(request);

        expect(result.dashboardTabsParametersOverrides).toEqual({
            tabOwning: [{ id: "topN", value: "5", title: "Top N" }],
        });
    });
});
