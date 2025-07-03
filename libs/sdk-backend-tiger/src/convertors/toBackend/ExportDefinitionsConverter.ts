// (C) 2020-2025 GoodData Corporation
import {
    DashboardTabularExportRequestV2,
    ImageExportRequest,
    JsonApiExportDefinitionInDocument,
    JsonApiExportDefinitionOutWithLinksTypeEnum,
    JsonApiExportDefinitionPostOptionalIdDocument,
    SlidesExportRequest,
    TabularExportRequest,
    VisualExportRequest,
} from "@gooddata/api-client-tiger";
import {
    IExportDefinitionRequestPayload,
    IExportDefinitionMetadataObjectDefinition,
    isExportDefinitionDashboardRequestPayload,
    IExportDefinitionDashboardRequestPayload,
    IExportDefinitionVisualizationObjectRequestPayload,
    isExportDefinitionVisualizationObjectRequestPayload,
} from "@gooddata/sdk-model";
import { cloneWithSanitizedIds } from "./IdSanitization.js";
import { UnexpectedError } from "@gooddata/sdk-backend-spi";

export const convertExportDefinitionMdObjectDefinition = (
    exportDefinition: IExportDefinitionMetadataObjectDefinition,
    enableAutomationFilterContext: boolean,
): JsonApiExportDefinitionPostOptionalIdDocument => {
    const { title, description, tags, requestPayload } = exportDefinition;

    return {
        data: {
            type: JsonApiExportDefinitionOutWithLinksTypeEnum.EXPORT_DEFINITION,
            attributes: {
                title,
                description,
                tags,
                requestPayload: convertExportDefinitionRequestPayload(
                    requestPayload,
                    enableAutomationFilterContext,
                    title,
                ),
            },
        },
    };
};

export const convertToImageExportRequest = (
    exportRequest: IExportDefinitionVisualizationObjectRequestPayload,
    title?: string,
): ImageExportRequest => {
    if (exportRequest.format === "PNG") {
        const { dashboard, widget, filters } = exportRequest.content;
        if (!widget || !dashboard) {
            console.error("Export definition must have a widget");
            throw new UnexpectedError("Export definition must have a widget");
        }
        const isMetadataFilled = title || filters;
        const metadataObj = {
            ...(isMetadataFilled
                ? {
                      metadata: {
                          ...(filters
                              ? {
                                    filters: filters.map(cloneWithSanitizedIds),
                                }
                              : {}),
                          ...(title ? { title } : {}),
                      },
                  }
                : {}),
        };

        return {
            dashboardId: dashboard,
            fileName: exportRequest.fileName,
            format: exportRequest.format,
            widgetIds: [widget],
            ...metadataObj,
        };
    }
    throw new UnexpectedError("Export definition must be a PNG format");
};

export const convertToSlidesExportRequest = (
    exportRequest: IExportDefinitionRequestPayload,
    title?: string,
): SlidesExportRequest => {
    const format = exportRequest.format === "PDF_SLIDES" ? "PDF" : exportRequest.format;

    if (format !== "PDF" && format !== "PPTX") {
        throw new UnexpectedError("Export definition must be a PDF or PPTX format");
    }

    if (isExportDefinitionDashboardRequestPayload(exportRequest)) {
        const { filters, dashboard } = exportRequest.content;
        const isMetadataFilled = title || exportRequest.content.filters;
        const metadataObj = {
            ...(isMetadataFilled
                ? {
                      metadata: {
                          ...(filters
                              ? {
                                    filters: filters.map(cloneWithSanitizedIds),
                                }
                              : {}),
                          ...(title ? { title } : {}),
                      },
                  }
                : {}),
        };

        return {
            fileName: exportRequest.fileName,
            format,
            dashboardId: dashboard,
            ...metadataObj,
        };
    }

    const { filters, widget, dashboard } = exportRequest.content;

    if (!widget) {
        console.error("Export definition must have a widget");
        throw new UnexpectedError("Export definition must have a widget");
    }

    return {
        fileName: exportRequest.fileName,
        format,
        dashboardId: dashboard,
        widgetIds: [widget],
        metadata: {
            widget,
            ...(filters ? { filters: filters.map(cloneWithSanitizedIds) } : {}),
            ...(title ? { title } : {}),
        },
    };
};

export const convertToVisualExportRequest = (
    exportRequest: IExportDefinitionDashboardRequestPayload,
    title?: string,
): VisualExportRequest => {
    const { filters, dashboard } = exportRequest.content;
    const isMetadataFilled = title || exportRequest.content.filters;
    const metadataObj = {
        ...(isMetadataFilled
            ? {
                  metadata: {
                      ...(filters
                          ? {
                                filters: filters.map(cloneWithSanitizedIds),
                            }
                          : {}),
                      ...(title ? { title } : {}),
                  },
              }
            : {}),
    };

    return {
        fileName: exportRequest.fileName,
        dashboardId: dashboard,
        ...metadataObj,
    };
};

export const convertToDashboardTabularExportRequest = (
    exportRequest: IExportDefinitionRequestPayload,
): DashboardTabularExportRequestV2 => {
    const { filters, dashboard } = exportRequest.content;
    if (
        exportRequest.format === "XLSX" &&
        isExportDefinitionDashboardRequestPayload(exportRequest) &&
        dashboard != null
    ) {
        const { mergeHeaders, orientation, exportInfo } = exportRequest.settings ?? {};

        return {
            fileName: exportRequest.fileName,
            format: "XLSX",
            dashboardId: dashboard,
            settings: {
                ...(mergeHeaders ? { mergeHeaders } : {}),
                ...(orientation ? { pdfPageSize: orientation } : {}),
                ...(exportInfo ? { exportInfo } : {}),
            },
            dashboardFiltersOverride: filters?.map(cloneWithSanitizedIds),
        };
    }
    throw new UnexpectedError("Export definition must be tabular");
};

export const convertToTabularExportRequest = (
    exportRequest: IExportDefinitionRequestPayload,
    title?: string,
): TabularExportRequest => {
    if (
        (exportRequest.format === "CSV" || exportRequest.format === "XLSX") &&
        isExportDefinitionVisualizationObjectRequestPayload(exportRequest)
    ) {
        const { visualizationObject, filters, widget, dashboard } = exportRequest.content;
        const { mergeHeaders, orientation, exportInfo } = exportRequest.settings ?? {};
        const filtersObj = filters
            ? { visualizationObjectCustomFilters: filters.map(cloneWithSanitizedIds) }
            : {};

        return {
            fileName: exportRequest.fileName,
            format: exportRequest.format,
            visualizationObject,
            ...filtersObj,
            relatedDashboardId: dashboard,
            settings: {
                ...(mergeHeaders ? { mergeHeaders } : {}),
                ...(orientation ? { pdfPageSize: orientation } : {}),
                ...(exportInfo ? { exportInfo } : {}),
            },
            metadata: {
                widget,
                ...(title ? { title } : {}),
            },
        };
    }
    throw new UnexpectedError("Export definition must be tabular");
};

export const convertExportDefinitionRequestPayload = (
    exportRequest: IExportDefinitionRequestPayload,
    enableAutomationFilterContext: boolean,
    title?: string,
): TabularExportRequest | VisualExportRequest => {
    if (isExportDefinitionDashboardRequestPayload(exportRequest)) {
        const { filters, dashboard } = exportRequest.content;
        const isMetadataFilled = title || exportRequest.content.filters;
        const metadataObj = {
            ...(isMetadataFilled
                ? {
                      metadata: {
                          ...(filters
                              ? {
                                    filters: enableAutomationFilterContext
                                        ? filters.map(cloneWithSanitizedIds)
                                        : filters,
                                }
                              : {}),
                          ...(title ? { title } : {}),
                      },
                  }
                : {}),
        };

        return {
            fileName: exportRequest.fileName,
            dashboardId: dashboard,
            ...metadataObj,
        } as VisualExportRequest;
    }

    const { mergeHeaders, orientation } = exportRequest.settings ?? {};
    const { visualizationObject, filters, widget, dashboard } = exportRequest.content;
    const filtersObj = filters
        ? { visualizationObjectCustomFilters: filters.map(cloneWithSanitizedIds) }
        : {};

    return {
        fileName: exportRequest.fileName,
        format: exportRequest.format,
        visualizationObject,
        ...filtersObj,
        relatedDashboardId: dashboard,
        settings: {
            ...(mergeHeaders ? { mergeHeaders } : {}),
            ...(orientation ? { pdfPageSize: orientation } : {}),
        },
        metadata: {
            widget,
            ...(title ? { title } : {}),
        },
    } as TabularExportRequest;
};

export const convertExportDefinitionMdObject = (
    exportDefinition: IExportDefinitionMetadataObjectDefinition,
    identifier: string,
    enableAutomationFilterContext: boolean,
): JsonApiExportDefinitionInDocument => {
    const postDefinition = convertExportDefinitionMdObjectDefinition(
        exportDefinition,
        enableAutomationFilterContext,
    );

    return {
        data: {
            ...postDefinition.data,
            id: identifier,
        },
    };
};
