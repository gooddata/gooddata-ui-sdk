// (C) 2020-2026 GoodData Corporation

import {
    type JsonApiAnalyticalDashboardOutIncludes,
    type JsonApiComputedAttributeOutIncludes,
    type JsonApiVisualizationObjectOut,
    type JsonApiVisualizationObjectOutDocument,
    type JsonApiVisualizationObjectOutList,
    type JsonApiVisualizationObjectOutWithLinks,
    type VisualizationObjectModelV1,
    type VisualizationObjectModelV2,
} from "@gooddata/api-client-tiger";
import {
    type AccessGranularPermission,
    type IInsight,
    type IInsightDefinition,
    type IUser,
    idRef,
} from "@gooddata/sdk-model";

import { convertCertificationFromBackend } from "./CertificationConverter.js";
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
    certification?: IInsight["insight"]["certification"],
    permissions?: AccessGranularPermission[],
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
            ...(certification ? { certification } : {}),
            ...(permissions ? { permissions } : {}),
        },
    };
};

export const visualizationObjectsItemToInsight = (
    visualizationObject: JsonApiVisualizationObjectOut | JsonApiVisualizationObjectOutWithLinks,
    included: (JsonApiAnalyticalDashboardOutIncludes | JsonApiComputedAttributeOutIncludes)[] = [],
): IInsight => {
    const { id, attributes, relationships = {} } = visualizationObject;
    const { createdBy, modifiedBy, certifiedBy } = relationships;
    const { content, title, description, tags, isHidden, createdAt, modifiedAt } = attributes;
    const links = "links" in visualizationObject ? visualizationObject.links : undefined;

    return insightFromInsightDefinition(
        convertVisualizationObject(
            content as
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
        createdAt ?? undefined,
        modifiedAt ?? undefined,
        convertUserIdentifier(createdBy, included),
        convertUserIdentifier(modifiedBy, included),
        convertCertificationFromBackend(attributes, convertUserIdentifier(certifiedBy, included)),
        visualizationObject.meta?.permissions,
    );
};

/**
 * Converts a single visualization object document. The document carries the object's links,
 * the item itself does not, so the uri comes from the document.
 */
export const visualizationObjectDocumentToInsight = ({
    data,
    links,
    included,
}: JsonApiVisualizationObjectOutDocument): IInsight => {
    const converted = visualizationObjectsItemToInsight(data, included);
    return { insight: { ...converted.insight, uri: links?.self ?? converted.insight.uri } };
};

export const convertVisualizationObjectsToInsights = (
    visualizationObjects: JsonApiVisualizationObjectOutList,
): IInsight[] => {
    return visualizationObjects.data.map((visualizationObject) =>
        visualizationObjectsItemToInsight(visualizationObject, visualizationObjects.included),
    );
};
