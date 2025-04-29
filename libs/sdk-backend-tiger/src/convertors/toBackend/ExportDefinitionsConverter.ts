// (C) 2020-2025 GoodData Corporation
import {
    JsonApiExportDefinitionInDocument,
    JsonApiExportDefinitionOutWithLinksTypeEnum,
    JsonApiExportDefinitionPostOptionalIdDocument,
    TabularExportRequest,
    VisualExportRequest,
} from "@gooddata/api-client-tiger";
import {
    IExportDefinitionRequestPayload,
    IExportDefinitionMetadataObjectDefinition,
    isExportDefinitionDashboardRequestPayload,
} from "@gooddata/sdk-model";
import { cloneWithSanitizedIds } from "./IdSanitization.js";

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
