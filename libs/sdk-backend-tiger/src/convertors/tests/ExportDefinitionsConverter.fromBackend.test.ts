// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type AutomationAutomationImageExport,
    type AutomationAutomationSlidesExport,
    type AutomationAutomationTabularExport,
    type AutomationAutomationVisualExport,
    type JsonApiExportDefinitionOutWithLinks,
    type JsonApiWorkspaceAutomationOutAttributesDashboardTabularExportsInner,
    type JsonApiWorkspaceAutomationOutAttributesRawExportsInner,
} from "@gooddata/api-client-tiger";
import {
    type IDashboardAttributeFilter,
    type IDashboardExportParameter,
    type IExportDefinitionDashboardRequestPayload,
    type IExportDefinitionVisualizationObjectRequestPayload,
    type IMeasureValueFilter,
    idRef,
    isDashboardArbitraryAttributeFilter,
    isDashboardMatchAttributeFilter,
    isMeasureValueFilter,
} from "@gooddata/sdk-model";

import {
    convertDashboardTabularExportRequest,
    convertExportDefinitionMdObject,
    convertImageExportRequest,
    convertSlidesExportRequest,
    convertTabularExportRequest,
    convertToRawExportRequest,
    convertVisualExportRequest,
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
        } as AutomationAutomationTabularExport;

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

    it("converts CSV delimiter from tabular export settings", () => {
        const exportRequest = {
            requestPayload: {
                fileName: "tabular",
                format: "CSV",
                visualizationObject: "visId",
                relatedDashboardId: "dashboardId",
                metadata: { widget: "widgetId" },
                settings: {
                    delimiter: ";",
                },
            },
        } as AutomationAutomationTabularExport;

        const result = convertTabularExportRequest(exportRequest);

        expect(result.settings?.delimiter).toBe(";");
    });

    it("converts CSV delimiter from raw export settings", () => {
        const exportRequest = {
            requestPayload: {
                fileName: "raw-export",
                format: "CSV",
                delimiter: "|",
                execution: {
                    attributes: [],
                    filters: [],
                    measures: [],
                    auxMeasures: [],
                },
                metadata: {
                    widget: "widgetId",
                    visualizationObject: "visId",
                    dashboard: "dashboardId",
                },
            },
        } as JsonApiWorkspaceAutomationOutAttributesRawExportsInner;

        const result = convertToRawExportRequest(exportRequest);

        expect(result.settings?.delimiter).toBe("|");
    });

    it("restores content.parametersByTab from metadata in raw export", () => {
        const parameter: IDashboardExportParameter = { id: "topN", value: "5", title: "Top N" };
        const exportRequest = {
            requestPayload: {
                fileName: "raw-export",
                format: "CSV",
                execution: { attributes: [], filters: [], measures: [], auxMeasures: [] },
                metadata: {
                    widget: "widgetId",
                    visualizationObject: "visId",
                    parametersByTab: { tabOwning: [parameter] },
                },
            },
        } as unknown as JsonApiWorkspaceAutomationOutAttributesRawExportsInner;

        const result = convertToRawExportRequest(exportRequest);

        expect(result.content.parametersByTab?.["tabOwning"]).toEqual([parameter]);
    });

    it("restores content.parametersByTab from metadata in formatted CSV export", () => {
        const parameter: IDashboardExportParameter = { id: "topN", value: "5", title: "Top N" };
        const exportRequest = {
            requestPayload: {
                fileName: "formatted-csv",
                format: "CSV",
                visualizationObject: "visId",
                relatedDashboardId: "dashboardId",
                metadata: { widget: "widgetId", parametersByTab: { tabOwning: [parameter] } },
                settings: {},
            },
        } as unknown as AutomationAutomationTabularExport;

        const result = convertTabularExportRequest(exportRequest);

        expect(result.content.parametersByTab?.["tabOwning"]).toEqual([parameter]);
    });

    it("omits content.parametersByTab when formatted CSV export metadata has none", () => {
        const exportRequest = {
            requestPayload: {
                fileName: "formatted-csv",
                format: "CSV",
                visualizationObject: "visId",
                relatedDashboardId: "dashboardId",
                metadata: { widget: "widgetId" },
                settings: {},
            },
        } as AutomationAutomationTabularExport;

        const result = convertTabularExportRequest(exportRequest);

        expect(result.content.parametersByTab).toBeUndefined();
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
        } as unknown as JsonApiWorkspaceAutomationOutAttributesDashboardTabularExportsInner;

        const result = convertDashboardTabularExportRequest(exportRequest);
        expect(result.type).toBe("visualizationObject");
        expect(result.content.filters).toHaveLength(1);
        expect(isMeasureValueFilter(result.content.filters?.[0])).toBe(true);
    });

    it("restores content.parametersByTab from metadata in visual export", () => {
        const parameter: IDashboardExportParameter = { id: "p1", value: "42", title: "Param 1" };
        const exportRequest = {
            requestPayload: {
                fileName: "dashboard-visual",
                dashboardId: "dashboardId",
                metadata: { parametersByTab: { tab1: [parameter] } },
            },
        } as unknown as AutomationAutomationVisualExport;

        const result = convertVisualExportRequest(exportRequest);

        expect(result.content.parametersByTab?.["tab1"]).toEqual([parameter]);
    });

    it("restores content.parametersByTab from metadata in image (PNG) export", () => {
        const parameter: IDashboardExportParameter = { id: "p1", value: "7", title: "Param 1" };
        const exportRequest = {
            requestPayload: {
                fileName: "widget-png",
                dashboardId: "dashboardId",
                format: "PNG",
                widgetIds: ["widgetId"],
                metadata: { parametersByTab: { tabOwning: [parameter] } },
            },
        } as unknown as AutomationAutomationImageExport;

        const result = convertImageExportRequest(exportRequest);

        expect(result.content.parametersByTab?.["tabOwning"]).toEqual([parameter]);
    });

    it("restores content.parametersByTab from metadata in dashboard slides export", () => {
        const parameter: IDashboardExportParameter = { id: "p1", value: "42", title: "Param 1" };
        const exportRequest = {
            requestPayload: {
                fileName: "dashboard-slides",
                format: "PDF",
                dashboardId: "dashboardId",
                metadata: { parametersByTab: { tab1: [parameter] } },
            },
        } as unknown as AutomationAutomationSlidesExport;

        const result = convertSlidesExportRequest(exportRequest) as IExportDefinitionDashboardRequestPayload;

        expect(result.type).toBe("dashboard");
        expect(result.content.parametersByTab?.["tab1"]).toEqual([parameter]);
    });

    it("restores content.parametersByTab from metadata in widget slides export", () => {
        const parameter: IDashboardExportParameter = { id: "p1", value: "9", title: "Param 1" };
        const exportRequest = {
            requestPayload: {
                fileName: "widget-slides",
                format: "PPTX",
                dashboardId: "dashboardId",
                widgetIds: ["widgetId"],
                metadata: { widget: "widgetId", parametersByTab: { tabOwning: [parameter] } },
            },
        } as unknown as AutomationAutomationSlidesExport;

        const result = convertSlidesExportRequest(exportRequest);

        expect(result.type).toBe("visualizationObject");
        expect(result.content.parametersByTab?.["tabOwning"]).toEqual([parameter]);
    });

    it("omits content.parametersByTab when visual export metadata has none", () => {
        const exportRequest = {
            requestPayload: { fileName: "dashboard-visual", dashboardId: "dashboardId", metadata: {} },
        } as unknown as AutomationAutomationVisualExport;

        const result = convertVisualExportRequest(exportRequest);

        expect(result.content.parametersByTab).toBeUndefined();
    });

    it("restores content.parametersByTab from metadata in standalone dashboard export definition", () => {
        const parameter: IDashboardExportParameter = { id: "p1", value: "42", title: "Param 1" };
        const exportDefinitionOut = {
            id: "ed1",
            attributes: {
                title: "dashboard-export-definition",
                requestPayload: {
                    fileName: "dashboard-export-definition",
                    dashboardId: "dashboardId",
                    metadata: { parametersByTab: { tab1: [parameter] } },
                },
            },
        } as unknown as JsonApiExportDefinitionOutWithLinks;

        const result = convertExportDefinitionMdObject(exportDefinitionOut);
        const content = result.requestPayload.content as {
            parametersByTab?: Record<string, IDashboardExportParameter[]>;
        };

        expect(result.requestPayload.type).toBe("dashboard");
        expect(content.parametersByTab?.["tab1"]).toEqual([parameter]);
    });

    it("restores content.parametersByTab from metadata in standalone visualization-object export definition", () => {
        const parameter: IDashboardExportParameter = { id: "topN", value: "5", title: "Top N" };
        const exportDefinitionOut = {
            id: "ed1",
            attributes: {
                title: "viz-export-definition",
                requestPayload: {
                    fileName: "viz-export-definition",
                    format: "CSV",
                    visualizationObject: "visId",
                    relatedDashboardId: "dashboardId",
                    metadata: { widget: "widgetId", parametersByTab: { tabOwning: [parameter] } },
                },
            },
        } as unknown as JsonApiExportDefinitionOutWithLinks;

        const result = convertExportDefinitionMdObject(exportDefinitionOut);
        const content = result.requestPayload.content as {
            parametersByTab?: Record<string, IDashboardExportParameter[]>;
        };

        expect(result.requestPayload.type).toBe("visualizationObject");
        expect(content.parametersByTab?.["tabOwning"]).toEqual([parameter]);
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
        const tigerArbitraryFilter = {
            arbitraryAttributeFilter: {
                displayForm: {
                    identifier: { id: "attr.df", type: "label" },
                },
                values: ["custom-value"],
                negativeSelection: false,
                localIdentifier: "arbLocalId",
            },
        };
        const tigerMatchFilter = {
            matchAttributeFilter: {
                displayForm: {
                    identifier: { id: "attr.df", type: "label" },
                },
                operator: "contains",
                literal: "foo",
                caseSensitive: true,
                negativeSelection: false,
                localIdentifier: "matchLocalId",
            },
        };

        const exportRequest = {
            requestPayload: {
                fileName: "dashboard-tabular-no-widget",
                format: "XLSX",
                dashboardId: "dashboardId",
                dashboardTabsFiltersOverrides: {
                    tab1: [tigerDashboardFilter, tigerArbitraryFilter, tigerMatchFilter],
                },
                settings: {},
            },
        } as JsonApiWorkspaceAutomationOutAttributesDashboardTabularExportsInner;

        const result = convertDashboardTabularExportRequest(
            exportRequest,
        ) as IExportDefinitionDashboardRequestPayload;
        expect(result.type).toBe("dashboard");
        expect(result.content.filtersByTab?.["tab1"]).toHaveLength(3);
        const converted = result.content.filtersByTab?.["tab1"]?.[0] as IDashboardAttributeFilter;
        expect(converted).toBeDefined();
        expect(converted.attributeFilter.displayForm).toEqual(idRef("attr.df", "displayForm"));
        expect(isDashboardArbitraryAttributeFilter(result.content.filtersByTab?.["tab1"]?.[1])).toBe(true);
        expect(isDashboardMatchAttributeFilter(result.content.filtersByTab?.["tab1"]?.[2])).toBe(true);
    });

    it("converts dashboardTabsParametersOverrides to content.parametersByTab", () => {
        const exportRequest = {
            requestPayload: {
                fileName: "dashboard-tabular-params",
                format: "XLSX",
                dashboardId: "dashboardId",
                dashboardTabsParametersOverrides: {
                    tab1: [{ id: "topN", value: "5", title: "Top N" }],
                    tab2: [{ id: "limit", value: "10", title: "Limit" }],
                },
                settings: {},
            },
        } as JsonApiWorkspaceAutomationOutAttributesDashboardTabularExportsInner;

        const result = convertDashboardTabularExportRequest(
            exportRequest,
        ) as IExportDefinitionDashboardRequestPayload;

        expect(result.content.parametersByTab).toEqual({
            tab1: [{ id: "topN", value: "5", title: "Top N" }],
            tab2: [{ id: "limit", value: "10", title: "Limit" }],
        });
    });

    it("converts dashboardTabsParametersOverrides to content.parametersByTab in widget tabular export", () => {
        const exportRequest = {
            requestPayload: {
                fileName: "widget-tabular-params",
                format: "XLSX",
                dashboardId: "dashboardId",
                widgetIds: ["widgetId"],
                dashboardTabsParametersOverrides: {
                    tabOwning: [{ id: "topN", value: "5", title: "Top N" }],
                },
                settings: {},
            },
        } as JsonApiWorkspaceAutomationOutAttributesDashboardTabularExportsInner;

        const result = convertDashboardTabularExportRequest(
            exportRequest,
        ) as IExportDefinitionVisualizationObjectRequestPayload;

        expect(result.type).toBe("visualizationObject");
        expect(result.content.parametersByTab).toEqual({
            tabOwning: [{ id: "topN", value: "5", title: "Top N" }],
        });
    });

    it("leaves content.parametersByTab undefined when no overrides present", () => {
        const exportRequest = {
            requestPayload: {
                fileName: "dashboard-tabular-no-params",
                format: "XLSX",
                dashboardId: "dashboardId",
                settings: {},
            },
        } as JsonApiWorkspaceAutomationOutAttributesDashboardTabularExportsInner;

        const result = convertDashboardTabularExportRequest(
            exportRequest,
        ) as IExportDefinitionDashboardRequestPayload;

        expect(result.content.parametersByTab).toBeUndefined();
    });
});
