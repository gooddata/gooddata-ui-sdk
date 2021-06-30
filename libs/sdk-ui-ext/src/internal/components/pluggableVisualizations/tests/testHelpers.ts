// (C) 2020-2021 GoodData Corporation
import { IDrillEvent, IDrillEventIntersectionElement, VisType } from "@gooddata/sdk-ui";
import { IAttribute, IInsight, IInsightDefinition, localIdRef, uriRef } from "@gooddata/sdk-model";
import { IDrillDownDefinition } from "../../../interfaces/Visualization";

export function createDrillDefinition(fromAttribute: IAttribute, targetUri: string): IDrillDownDefinition {
    return {
        type: "drillDown",
        origin: localIdRef(fromAttribute.attribute.localIdentifier),
        target: uriRef(targetUri),
    };
}

export function insightDefinitionToInsight(
    insightDefinition: IInsightDefinition,
    uri: string,
    identifier: string,
): IInsight {
    return {
        ...insightDefinition,
        insight: {
            ...insightDefinition.insight,
            identifier,
            uri,
            ref: uriRef(uri),
        },
    };
}

export function createDrillEvent(type: VisType, intersection: IDrillEventIntersectionElement[]): IDrillEvent {
    return {
        dataView: null,
        drillContext: {
            type,
            intersection,
            element: null,
        },
    };
}
