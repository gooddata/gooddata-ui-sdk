// (C) 2020-2024 GoodData Corporation
import {
    VisualizationObjectModelV1,
    VisualizationObjectModelV2,
    JsonApiVisualizationObjectOutWithLinks,
    JsonApiAnalyticalDashboardOutIncludes,
    JsonApiMetricOutIncludes,
    JsonApiVisualizationObjectOutList,
    JsonApiExportDefinitionOutWithLinks,
    JsonApiExportDefinitionOutList,
    JsonApiExportDefinitionOutIncludes,
} from "@gooddata/api-client-tiger";
import {
    idRef,
    IExportDefinition,
    IExportDefinitionRequestPayload,
    IInsight,
    IInsightDefinition,
    IUser,
} from "@gooddata/sdk-model";
import { isInheritedObject } from "./ObjectInheritance.js";
import { convertVisualizationObject } from "./visualizationObjects/VisualizationObjectConverter.js";
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

export const convertVisualizationObjectsToInsights = (
    exportDefinitions: JsonApiExportDefinitionOutList,
): IExportDefinition[] => {
    return exportDefinitions.data.map((visualizationObject) =>
        exportDefinitionOutToExportDefinition(visualizationObject, exportDefinitions.included),
    );
};
