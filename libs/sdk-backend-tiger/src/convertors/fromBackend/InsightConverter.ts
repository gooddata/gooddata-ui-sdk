// (C) 2020-2025 GoodData Corporation

import {
    type JsonApiAnalyticalDashboardOutIncludes,
    type JsonApiMetricOutIncludes,
    type JsonApiVisualizationObjectOut,
    type JsonApiVisualizationObjectOutList,
    type JsonApiVisualizationObjectOutWithLinks,
    type VisualizationObjectModelV1,
    type VisualizationObjectModelV2,
} from "@gooddata/api-client-tiger";
import { type IInsight, type IInsightDefinition, type IUser, idRef } from "@gooddata/sdk-model";

import { isInheritedObject } from "./ObjectInheritance.js";
import { convertUserIdentifier } from "./UsersConverter.js";
import { convertVisualizationObject } from "./visualizationObjects/VisualizationObjectConverter.js";

export const insightFromInsightDefinition = (
    insight: IInsightDefinition,
    id: string,
    uri: string,
    tags: string[] | undefined,
    isLocked: boolean | undefined,
    isHidden: boolean | undefined,
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
            isHidden,
            tags,
            created,
            createdBy,
            updated,
            updatedBy,
        },
    };
};

export const visualizationObjectsItemToInsight = (
    visualizationObject: JsonApiVisualizationObjectOut | JsonApiVisualizationObjectOutWithLinks,
    included: (JsonApiAnalyticalDashboardOutIncludes | JsonApiMetricOutIncludes)[] = [],
): IInsight => {
    const { id, attributes, relationships = {} } = visualizationObject;
    const { createdBy, modifiedBy } = relationships;
    const { content, title, description, tags, isHidden, createdAt, modifiedAt } = attributes!;
    const links = "links" in visualizationObject ? visualizationObject.links : undefined;

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
        links?.self ?? "",
        tags,
        // TODO: TIGER-HACK: inherited objects must be locked; they are read-only for all
        isInheritedObject(visualizationObject),
        isHidden,
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
