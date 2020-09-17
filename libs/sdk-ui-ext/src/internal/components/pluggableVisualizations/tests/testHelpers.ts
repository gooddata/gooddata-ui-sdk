// (C) 2020 GoodData Corporation
import { IImplicitDrillDown } from "../../../interfaces/Visualization";
import { IDrillEvent, IDrillEventIntersectionElement, VisType } from "@gooddata/sdk-ui";
import { IAttribute, IInsight, IInsightDefinition, uriRef } from "@gooddata/sdk-model";

export function createDrillDefinition(fromAttribute: IAttribute, targetUri: string): IImplicitDrillDown {
    return {
        implicitDrillDown: {
            from: {
                drillFromAttribute: { localIdentifier: fromAttribute.attribute.localIdentifier },
            },
            drillDownStep: {
                drillToAttribute: {
                    attributeDisplayForm: uriRef(targetUri),
                },
            },
        },
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
