// (C) 2019-2026 GoodData Corporation

import {
    type DashboardAttachmentType,
    type FilterContextItem,
    type IAutomationMetadataObjectDefinition,
    type IDashboardExportParameter,
    type IExportDefinitionMetadataObjectDefinition,
    type IExportDefinitionVisualizationObjectSettings,
    type IFilter,
    type IInsight,
    type IWidget,
    type WidgetAttachmentType,
    insightProperties,
} from "@gooddata/sdk-model";

import { setExportParametersByTab } from "../../../../../_staging/automation/index.js";

/**
 * Rebuilds the export definitions and re-applies the parameter wire (fresh definitions carry no
 * `content.parametersByTab`). The wire is passed in rather than read off `automation` so it survives
 * a rebuild from zero definitions — see `latestParametersWireRef`.
 */
export function withRebuiltExportDefinitions(
    automation: IAutomationMetadataObjectDefinition,
    exportDefinitions: NonNullable<IAutomationMetadataObjectDefinition["exportDefinitions"]>,
    parametersByTab: Record<string, IDashboardExportParameter[]> | undefined,
): IAutomationMetadataObjectDefinition {
    const next = { ...automation, exportDefinitions };
    return parametersByTab ? setExportParametersByTab(next, parametersByTab) : next;
}

export function newDashboardExportDefinitionMetadataObjectDefinition({
    dashboardId,
    dashboardTitle,
    dashboardFilters,
    filtersByTab,
    format,
    templateId,
}: {
    dashboardId: string;
    dashboardTitle: string;
    dashboardFilters?: FilterContextItem[];
    filtersByTab?: Record<string, FilterContextItem[]>;
    format: DashboardAttachmentType;
    templateId?: string;
}): IExportDefinitionMetadataObjectDefinition {
    // Use filtersByTab if provided, otherwise fall back to simple filters
    const filtersObj = filtersByTab
        ? { filtersByTab }
        : dashboardFilters
          ? { filters: dashboardFilters }
          : {};

    const settingsObj = format === "XLSX" ? { settings: { mergeHeaders: true, exportInfo: true } } : {};

    return {
        type: "exportDefinition",
        title: dashboardTitle,
        requestPayload: {
            type: "dashboard",
            fileName: dashboardTitle,
            format,
            content: {
                dashboard: dashboardId,
                ...filtersObj,
            },
            ...settingsObj,
            ...(templateId ? { templateId } : {}),
        },
    };
}

export function newWidgetExportDefinitionMetadataObjectDefinition({
    insight,
    widget,
    dashboardId,
    format,
    widgetFilters,
    widgetFiltersWithInsight,
    dashboardFilters,
    defaultPdfPageSize,
    defaultCsvDelimiter,
}: {
    insight: IInsight;
    widget: IWidget;
    dashboardId: string;
    format: WidgetAttachmentType;
    widgetFilters?: IFilter[];
    widgetFiltersWithInsight?: IFilter[];
    dashboardFilters?: FilterContextItem[];
    defaultPdfPageSize?: IExportDefinitionVisualizationObjectSettings["pageSize"];
    defaultCsvDelimiter?: string;
}): IExportDefinitionMetadataObjectDefinition {
    const widgetTitle = widget.title;

    // Determine which filters to use based on format:
    // - CSV: Use widgetFiltersWithInsight (insight filters merged on frontend)
    // - CSV_RAW: Use widgetFilters (insight filters merged on backend)
    // - Other formats: Use dashboardFilters (backend handles insight filter merging)
    const shouldUseCsvFilters = format === "CSV";
    const shouldUseCsvRawFilters = format === "CSV_RAW";

    let filtersObj: { filters?: IFilter[] | FilterContextItem[] } = {};
    if (shouldUseCsvFilters && (widgetFiltersWithInsight ?? []).length > 0) {
        filtersObj = { filters: widgetFiltersWithInsight };
    } else if (shouldUseCsvRawFilters && (widgetFilters ?? []).length > 0) {
        filtersObj = { filters: widgetFilters };
    } else if (!shouldUseCsvFilters && !shouldUseCsvRawFilters && (dashboardFilters ?? []).length > 0) {
        filtersObj = { filters: dashboardFilters };
    }

    const grandTotalsPosition = insightProperties(insight)?.["controls"]?.["grandTotalsPosition"];

    const pdfSettings: IExportDefinitionVisualizationObjectSettings = {
        pageSize: defaultPdfPageSize ?? "A4",
        orientation: "portrait",
        exportInfo: true,
        ...(grandTotalsPosition ? { grandTotalsPosition } : {}),
    };

    const xlsxSettings: IExportDefinitionVisualizationObjectSettings = {
        mergeHeaders: true,
        exportInfo: true,
        ...(grandTotalsPosition ? { grandTotalsPosition } : {}),
    };

    const csvSettings: IExportDefinitionVisualizationObjectSettings = {
        ...(defaultCsvDelimiter ? { delimiter: defaultCsvDelimiter } : {}),
        ...(grandTotalsPosition ? { grandTotalsPosition } : {}),
    };
    const hasCsvSettings = Object.keys(csvSettings).length > 0;

    const settingsObj =
        format === "XLSX"
            ? { settings: xlsxSettings }
            : format === "PDF_TABULAR"
              ? { settings: pdfSettings }
              : (format === "CSV" || format === "CSV_RAW") && hasCsvSettings
                ? { settings: csvSettings }
                : {};

    return {
        type: "exportDefinition",
        title: widgetTitle,
        requestPayload: {
            type: "visualizationObject",
            fileName: widgetTitle,
            format: format,
            content: {
                visualizationObject: insight.insight.identifier,
                widget: widget.identifier,
                dashboard: dashboardId,
                ...filtersObj,
            },
            ...settingsObj,
        },
    };
}
