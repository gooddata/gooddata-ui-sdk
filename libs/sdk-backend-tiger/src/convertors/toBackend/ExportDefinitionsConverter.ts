// (C) 2020-2024 GoodData Corporation
import {
    JsonApiAnalyticalDashboardLinkageTypeEnum,
    JsonApiExportDefinitionInDocument,
    JsonApiExportDefinitionOutWithLinksTypeEnum,
    JsonApiExportDefinitionPostOptionalIdDocument,
    JsonApiVisualizationObjectLinkageTypeEnum,
    TabularExportRequest,
    VisualExportRequest,
} from "@gooddata/api-client-tiger";
import {
    IExportDefinitionRequestPayload,
    isExportDefinitionDashboardContent,
    IExportDefinitionMetadataObjectDefinition,
} from "@gooddata/sdk-model";

export const convertExportDefinitionMdObjectDefinition = (
    exportDefinition: IExportDefinitionMetadataObjectDefinition,
): JsonApiExportDefinitionPostOptionalIdDocument => {
    const { title, description, tags, requestPayload } = exportDefinition;

    const relationships = isExportDefinitionDashboardContent(requestPayload.content)
        ? {
              analyticalDashboard: {
                  data: {
                      id: requestPayload.content.dashboard,
                      type: JsonApiAnalyticalDashboardLinkageTypeEnum.ANALYTICAL_DASHBOARD,
                  },
              },
          }
        : {
              visualizationObject: {
                  data: {
                      id: requestPayload.content.visualizationObject,
                      type: JsonApiVisualizationObjectLinkageTypeEnum.VISUALIZATION_OBJECT,
                  },
              },
          };

    return {
        data: {
            type: JsonApiExportDefinitionOutWithLinksTypeEnum.EXPORT_DEFINITION,
            attributes: {
                title,
                description,
                tags,
                requestPayload: convertExportDefinitionRequestPayload(requestPayload),
            },
            relationships,
        },
    };
};

const convertExportDefinitionRequestPayload = (
    exportRequest: IExportDefinitionRequestPayload,
): TabularExportRequest | VisualExportRequest => {
    if (isExportDefinitionDashboardContent(exportRequest.content)) {
        return {
            fileName: exportRequest.fileName,
            dashboardId: exportRequest.content.dashboard,
        };
    }

    return {
        fileName: exportRequest.fileName,
        format: exportRequest.format,
        visualizationObject: exportRequest.content.visualizationObject,
        visualizationObjectCustomFilters: exportRequest.content.filters,
        settings: {
            pdfPageSize: exportRequest.pdfOptions?.orientation,
        },
    };
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
