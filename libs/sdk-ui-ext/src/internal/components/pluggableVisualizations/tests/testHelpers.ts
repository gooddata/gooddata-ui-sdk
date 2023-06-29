// (C) 2020-2022 GoodData Corporation
import { IDrillEvent, IDrillEventIntersectionElement, VisType } from "@gooddata/sdk-ui";
import { IAttribute, IInsight, IInsightDefinition, localIdRef, uriRef } from "@gooddata/sdk-model";
import { IDrillDownDefinition } from "../../../interfaces/Visualization.js";
import React from "react";
import { Mock } from "vitest";

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

/**
 * Find the last call to a render function in the mock calls that matches given mounting point
 * This is useful when need to separate between `renderVisualization` and `renderConfigurationPanel`
 * Using second parameter - mounting point - as a differentiator
 * @returns a React element passed to render function
 */
export function getLastRenderEl<T = any>(
    func: Mock,
    element: HTMLElement,
): React.ReactElement<T> | undefined {
    return [...func.mock.calls].reverse().find((call) => call[1] === element)?.[0];
}
