// (C) 2020-2024 GoodData Corporation
import {
    JsonApiExportDefinitionOutIncludes,
    JsonApiExportDefinitionOutWithLinks,
    TabularExportRequest,
    VisualExportRequest,
} from "@gooddata/api-client-tiger";
import {
    idRef,
    IExportDefinitionMetadataObject,
    IExportDefinitionRequestPayload,
    IFilter,
} from "@gooddata/sdk-model";
import { convertUserIdentifier } from "./UsersConverter.js";
import isEmpty from "lodash/isEmpty.js";

export const convertExportDefinitionMdObject = (
    exportDefinitionOut: JsonApiExportDefinitionOutWithLinks,
    included: JsonApiExportDefinitionOutIncludes[] = [],
): IExportDefinitionMetadataObject => {
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
    const request = convertExportDefinitionRequestPayload(
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

const convertExportDefinitionRequestPayload = (
    exportRequest: VisualExportRequest | TabularExportRequest,
): IExportDefinitionRequestPayload => {
    if (isTabularRequest(exportRequest) && exportRequest.format === "PDF") {
        const pdfPageSize = exportRequest.settings?.pdfPageSize;
        return {
            fileName: exportRequest.fileName,
            format: exportRequest.format,
            content: {
                visualizationObject: exportRequest.visualizationObject ?? "",
                filters: (exportRequest.visualizationObjectCustomFilters as IFilter[]) ?? [],
            },
            pdfOptions: {
                orientation:
                    pdfPageSize === "portrait" || pdfPageSize === "landscape" ? pdfPageSize : "portrait",
            },
        };
    } else if (isVisualRequest(exportRequest)) {
        return {
            fileName: exportRequest.fileName,
            format: "PDF",
            content: {
                dashboard: exportRequest.dashboardId,
            },
        };
    } else {
        // to be expanded when more formats are supported
        return {
            fileName: "",
            format: "PDF",
            content: {
                visualizationObject: "",
            },
        };
    }
};

const isTabularRequest = (
    request: VisualExportRequest | TabularExportRequest,
): request is TabularExportRequest => {
    return !isEmpty(request) && typeof (request as TabularExportRequest).visualizationObject === "string";
};

const isVisualRequest = (
    request: VisualExportRequest | TabularExportRequest,
): request is VisualExportRequest => {
    return !isEmpty(request) && typeof (request as VisualExportRequest).dashboardId === "string";
};
