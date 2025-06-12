// (C) 2020-2024 GoodData Corporation
import {
    VisualizationObjectModelV1,
    VisualizationObjectModelV2,
    JsonApiVisualizationObjectOutWithLinks,
    JsonApiAnalyticalDashboardOutIncludes,
    JsonApiMetricOutIncludes,
    JsonApiVisualizationObjectOutList,
} from "@gooddata/api-client-tiger";
import { idRef, IInsight, IInsightDefinition, IUser } from "@gooddata/sdk-model";
import { isInheritedObject } from "./ObjectInheritance.js";
import { convertVisualizationObject } from "./visualizationObjects/VisualizationObjectConverter.js";
import { convertUserIdentifier } from "./UsersConverter.js";

export const insightFromInsightDefinition = (
    insight: IInsightDefinition,
    id: string,
    uri: string,
    tags: string[] | undefined,
    isLocked: boolean | undefined,
    created: string | undefined,
    updated: string | undefined,
    createdBy: IUser | undefined,
    updatedBy: IUser | undefined,
): IInsight => {
    return {
        insight: {
            ...insight.insight,
            identifier: id,
            uri,
            ref: idRef(id, "insight"),
            isLocked,
            tags,
            created,
            createdBy,
            updated,
            updatedBy,
        },
    };
};

export const visualizationObjectsItemToInsight = (
    visualizationObject: JsonApiVisualizationObjectOutWithLinks,
    included: (JsonApiAnalyticalDashboardOutIncludes | JsonApiMetricOutIncludes)[] = [],
): IInsight => {
    const { id, attributes, links, relationships = {} } = visualizationObject;
    const { createdBy, modifiedBy } = relationships;
    const { content, title, description, tags, createdAt, modifiedAt } = attributes!;

    return insightFromInsightDefinition(
        convertVisualizationObject(
            content! as
                | VisualizationObjectModelV1.IVisualizationObject
                | VisualizationObjectModelV2.IVisualizationObject,
            title!,
            description!,
            tags,
        ),
        id,
        links!.self,
        tags,
        // TODO: TIGER-HACK: inherited objects must be locked; they are read-only for all
        isInheritedObject(visualizationObject),
        createdAt,
        modifiedAt,
        convertUserIdentifier(createdBy, included),
        convertUserIdentifier(modifiedBy, included),
    );
};

export const convertVisualizationObjectsToInsights = (
    visualizationObjects: JsonApiVisualizationObjectOutList,
): IInsight[] => {
    return visualizationObjects.data.map((visualizationObject) =>
        visualizationObjectsItemToInsight(visualizationObject, visualizationObjects.included),
    );
};
