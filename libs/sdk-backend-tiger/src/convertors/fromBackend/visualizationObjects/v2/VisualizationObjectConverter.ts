// (C) 2019-2021 GoodData Corporation
import { IInsightDefinition } from "@gooddata/sdk-model";
import { VisualizationObjectModelV2 } from "@gooddata/api-client-tiger";
import { cloneWithSanitizedIds } from "../../IdSanitization";

export function convertVisualizationObject(
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
