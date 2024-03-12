// (C) 2020-2024 GoodData Corporation
import {
    JsonApiExportDefinitionInDocument,
    JsonApiExportDefinitionOutDocument,
    JsonApiExportDefinitionOutIncludes,
    JsonApiExportDefinitionOutList,
    JsonApiExportDefinitionOutWithLinks,
    JsonApiExportDefinitionOutWithLinksTypeEnum,
} from "@gooddata/api-client-tiger";
import { idRef, IExportDefinition, IExportDefinitionRequestPayload } from "@gooddata/sdk-model";
import { convertUserIdentifier } from "./UsersConverter.js";

export const exportDefinitionOutToExportDefinition = (
    exportDefinitionOut: JsonApiExportDefinitionOutWithLinks,
    included: JsonApiExportDefinitionOutIncludes[] = [],
): IExportDefinition => {
    const { id, attributes, links, relationships = {} } = exportDefinitionOut;
    const { createdBy, modifiedBy } = relationships;
    const { title = "", description = "", tags = [], requestPayload, createdAt, modifiedAt } = attributes;

    return {
        type: "exportDefinition",
        id,
        uri: links!.self,
        ref: idRef(id, "exportDefinition"),
        title,
        description,
        tags,
        requestPayload: requestPayload as IExportDefinitionRequestPayload,
        created: createdAt,
        updated: modifiedAt,
        createdBy: convertUserIdentifier(createdBy, included),
        updatedBy: convertUserIdentifier(modifiedBy, included),
        production: true,
        deprecated: false,
        unlisted: false,
    };
};

export const exportDefinitionOutDocumentToExportDefitionOutWithLinks = (
    exportDefinitionDocument: JsonApiExportDefinitionOutDocument,
): JsonApiExportDefinitionOutWithLinks => {
    const { data: exportDefinitionOut, ...restExportDefinitionOut } = exportDefinitionDocument;

    return { ...exportDefinitionOut, ...restExportDefinitionOut };
};

export const exportDefinitionOutDocumentToExportDefinition = (
    exportDefinitionDocument: JsonApiExportDefinitionOutDocument,
): IExportDefinition => {
    const exportDefinitionOut =
        exportDefinitionOutDocumentToExportDefitionOutWithLinks(exportDefinitionDocument);

    return exportDefinitionOutToExportDefinition(exportDefinitionOut);
};

export const exportDefinitionsOutListToExportDefinitions = (
    exportDefinitions: JsonApiExportDefinitionOutList,
): IExportDefinition[] => {
    return exportDefinitions.data.map((visualizationObject) =>
        exportDefinitionOutToExportDefinition(visualizationObject, exportDefinitions.included),
    );
};

export const exportDefinitionToExportDefinitionInDocument = (
    exportDefinition: IExportDefinition,
): JsonApiExportDefinitionInDocument => {
    const { title, description, tags, requestPayload, id } = exportDefinition;

    return {
        data: {
            type: JsonApiExportDefinitionOutWithLinksTypeEnum.EXPORT_DEFINITION,
            id,
            attributes: {
                title,
                description,
                tags,
                requestPayload,
            },
        },
    };
};
