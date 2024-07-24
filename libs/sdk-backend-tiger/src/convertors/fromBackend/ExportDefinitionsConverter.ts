// (C) 2020-2024 GoodData Corporation
import {
    JsonApiExportDefinitionOutIncludes,
    JsonApiExportDefinitionOutWithLinks,
    TabularExportRequest,
    VisualExportRequest,
} from "@gooddata/api-client-tiger";
import {
    FilterContextItem,
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
    if (isTabularRequest(exportRequest)) {
        const { mergeHeaders, pdfPageSize } = exportRequest.settings ?? {};
        const orientation =
            pdfPageSize === "portrait" || pdfPageSize === "landscape" ? pdfPageSize : "portrait";
        const { widget, dashboard } =
            (exportRequest.metadata as { widget?: string; dashboard?: string }) ?? {};

        return {
            type: "visualizationObject",
            fileName: exportRequest.fileName,
            format: exportRequest.format,
            content: {
                visualizationObject: exportRequest.visualizationObject ?? "",
                filters: exportRequest.visualizationObjectCustomFilters as IFilter[],
                widget,
                dashboard,
            },
            settings: {
                ...(exportRequest.format === "PDF" ? { orientation } : {}),
                ...(mergeHeaders ? { mergeHeaders } : {}),
            },
        };
    } else {
        return {
            type: "dashboard",
            fileName: exportRequest.fileName,
            format: "PDF",
            content: {
                dashboard: exportRequest.dashboardId,
                filters: (exportRequest.metadata as any)?.filters as FilterContextItem[],
            },
        };
    }
};

const isTabularRequest = (
    request: VisualExportRequest | TabularExportRequest,
): request is TabularExportRequest => {
    return !isEmpty(request) && typeof (request as TabularExportRequest).visualizationObject === "string";
};
