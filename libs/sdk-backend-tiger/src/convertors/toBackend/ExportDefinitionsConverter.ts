// (C) 2020-2024 GoodData Corporation
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
): JsonApiExportDefinitionPostOptionalIdDocument => {
    const { title, description, tags, requestPayload } = exportDefinition;

    return {
        data: {
            type: JsonApiExportDefinitionOutWithLinksTypeEnum.EXPORT_DEFINITION,
            attributes: {
                title,
                description,
                tags,
                requestPayload: convertExportDefinitionRequestPayload(requestPayload),
            },
        },
    };
};

export const convertExportDefinitionRequestPayload = (
    exportRequest: IExportDefinitionRequestPayload,
): TabularExportRequest | VisualExportRequest => {
    if (isExportDefinitionDashboardRequestPayload(exportRequest)) {
        const { filters, dashboard } = exportRequest.content;
        const metadataObj = exportRequest.content.filters ? { metadata: { filters } } : {};

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
        },
    } as TabularExportRequest;
};

export const convertExportDefinitionMdObject = (
    exportDefinition: IExportDefinitionMetadataObjectDefinition,
    identifier: string,
): JsonApiExportDefinitionInDocument => {
    const postDefinition = convertExportDefinitionMdObjectDefinition(exportDefinition);

    return {
        data: {
            ...postDefinition.data,
            id: identifier,
        },
    };
};
