// (C) 2020-2024 GoodData Corporation
import {
    JsonApiExportDefinitionInDocument,
    JsonApiExportDefinitionOutDocument,
    JsonApiExportDefinitionOutIncludes,
    JsonApiExportDefinitionOutList,
    JsonApiExportDefinitionOutWithLinks,
    JsonApiExportDefinitionOutWithLinksTypeEnum,
    JsonApiExportDefinitionPostOptionalIdDocument,
    JsonApiVisualizationObjectLinkageTypeEnum,
    TabularExportRequest,
    VisualExportRequest,
} from "@gooddata/api-client-tiger";
import {
    idRef,
    IExportDefinition,
    IExportDefinitionBase,
    IExportDefinitionRequestPayload,
    IFilter,
} from "@gooddata/sdk-model";
import { convertUserIdentifier } from "./UsersConverter.js";

export const exportDefinitionOutToExportDefinition = (
    exportDefinitionOut: JsonApiExportDefinitionOutWithLinks,
    included: JsonApiExportDefinitionOutIncludes[] = [],
): IExportDefinition => {
    const { id, attributes, links, relationships = {} } = exportDefinitionOut;
    const { createdBy, modifiedBy } = relationships;
    const {
        title = "",
        description = "",
        tags = [],
        requestPayload,
        createdAt,
        modifiedAt,
    } = attributes ?? {};
    const request = exportRequestToExportDefinitionRequest(
        requestPayload as VisualExportRequest | TabularExportRequest,
    );

    return {
        type: "exportDefinition",
        id,
        uri: links!.self,
        ref: idRef(id, "exportDefinition"),
        title,
        description,
        tags,
        requestPayload: request,
        created: createdAt,
        updated: modifiedAt,
        createdBy: convertUserIdentifier(createdBy, included),
        updatedBy: convertUserIdentifier(modifiedBy, included),
        production: true,
        deprecated: false,
        unlisted: false,
    };
};

const exportRequestToExportDefinitionRequest = (
    exportRequest: VisualExportRequest | TabularExportRequest,
): IExportDefinitionRequestPayload => {
    if (isTabularRequest(exportRequest) && exportRequest.format === "PDF") {
        const pdfPageSize = exportRequest.settings?.pdfPageSize;
        return {
            fileName: exportRequest.fileName,
            format: exportRequest.format,
            visualizationObjectId: exportRequest.visualizationObject ?? "",
            filters: (exportRequest.visualizationObjectCustomFilters as IFilter[]) ?? [],
            pdfOptions: {
                orientation:
                    pdfPageSize === "portrait" || pdfPageSize === "landscape" ? pdfPageSize : "portrait",
            },
        };
    } else {
        // to be expanded when more formats are supported
        return {
            fileName: "",
            format: "PDF",
            visualizationObjectId: "",
        };
    }
};

const isTabularRequest = (
    request: VisualExportRequest | TabularExportRequest,
): request is TabularExportRequest => {
    return "visualizationObject" in request;
};

export const exportDefinitionOutDocumentToExportDefinitionOutWithLinks = (
    exportDefinitionDocument: JsonApiExportDefinitionOutDocument,
): JsonApiExportDefinitionOutWithLinks => {
    const { data: exportDefinitionOut, ...restExportDefinitionOut } = exportDefinitionDocument;

    return { ...exportDefinitionOut, ...restExportDefinitionOut };
};

export const exportDefinitionOutDocumentToExportDefinition = (
    exportDefinitionDocument: JsonApiExportDefinitionOutDocument,
): IExportDefinition => {
    const exportDefinitionOut =
        exportDefinitionOutDocumentToExportDefinitionOutWithLinks(exportDefinitionDocument);

    return exportDefinitionOutToExportDefinition(exportDefinitionOut);
};

export const exportDefinitionsOutListToExportDefinitions = (
    exportDefinitions: JsonApiExportDefinitionOutList,
): IExportDefinition[] => {
    return exportDefinitions.data.map((exportDefinition) =>
        exportDefinitionOutToExportDefinition(exportDefinition, exportDefinitions.included),
    );
};

export const exportDefinitionToExportDefinitionPostOptionalIdDocument = (
    exportDefinition: IExportDefinitionBase,
): JsonApiExportDefinitionPostOptionalIdDocument => {
    const { title, description, tags, requestPayload } = exportDefinition;

    return {
        data: {
            type: JsonApiExportDefinitionOutWithLinksTypeEnum.EXPORT_DEFINITION,
            attributes: {
                title,
                description,
                tags,
                requestPayload: exportDefinitionRequestToExportRequest(requestPayload),
            },
            relationships: {
                visualizationObject: {
                    data: {
                        id: requestPayload.visualizationObjectId,
                        type: JsonApiVisualizationObjectLinkageTypeEnum.VISUALIZATION_OBJECT,
                    },
                },
            },
        },
    };
};

const exportDefinitionRequestToExportRequest = (
    exportRequest: IExportDefinitionRequestPayload,
): TabularExportRequest => {
    return {
        fileName: exportRequest.fileName,
        format: exportRequest.format,
        visualizationObject: exportRequest.visualizationObjectId,
        visualizationObjectCustomFilters: exportRequest.filters,
        settings: {
            pdfPageSize: exportRequest.pdfOptions?.orientation,
        },
    };
};

export const exportDefinitionToExportDefinitionInDocument = (
    exportDefinition: IExportDefinitionBase,
    identifier: string,
): JsonApiExportDefinitionInDocument => {
    const postDefinition = exportDefinitionToExportDefinitionPostOptionalIdDocument(exportDefinition);

    return {
        data: {
            ...postDefinition.data,
            id: identifier,
        },
    };
};
