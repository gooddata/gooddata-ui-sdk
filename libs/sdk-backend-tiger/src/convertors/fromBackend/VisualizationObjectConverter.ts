// (C) 2019-2021 GoodData Corporation
import invariant from "ts-invariant";
import { IInsightDefinition } from "@gooddata/sdk-model";
import { VisualizationObjectModelV1, VisualizationObjectModelV2 } from "@gooddata/api-client-tiger";
import { cloneWithSanitizedIds } from "./IdSanitization";

export const convertVisualizationObject = (
    visualizationObject:
        | VisualizationObjectModelV1.IVisualizationObject
        | VisualizationObjectModelV2.IVisualizationObject,
    title: string,
): IInsightDefinition => {
    if (VisualizationObjectModelV1.isVisualizationObject(visualizationObject)) {
        return convertVisualizationObjectV1(visualizationObject);
    }

    if (VisualizationObjectModelV2.isVisualizationObject(visualizationObject)) {
        return convertVisualizationObjectV2(visualizationObject, title);
    }
    invariant(false, "Unknown visualization object version");
};

function convertVisualizationObjectV1(
    visualizationObject: VisualizationObjectModelV1.IVisualizationObject,
): IInsightDefinition {
    return {
        insight: {
            ...visualizationObject.visualizationObject,
            buckets: cloneWithSanitizedIds(visualizationObject.visualizationObject.buckets) ?? [],
            filters: cloneWithSanitizedIds(visualizationObject.visualizationObject.filters) ?? [],
            sorts: cloneWithSanitizedIds(visualizationObject.visualizationObject.sorts) ?? [],
        },
    };
}

function convertVisualizationObjectV2(
    visualizationObject: VisualizationObjectModelV2.IVisualizationObject,
    title: string,
): IInsightDefinition {
    const { version: _, ...data } = visualizationObject;
    return {
        insight: {
            ...data,
            title,
            buckets: cloneWithSanitizedIds(visualizationObject.buckets) ?? [],
            filters: cloneWithSanitizedIds(visualizationObject.filters) ?? [],
            sorts: cloneWithSanitizedIds(visualizationObject.sorts) ?? [],
        },
    };
}
