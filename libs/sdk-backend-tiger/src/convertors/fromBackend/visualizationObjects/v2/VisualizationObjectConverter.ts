// (C) 2019-2022 GoodData Corporation
import { IInsightDefinition } from "@gooddata/sdk-model";
import { VisualizationObjectModelV2 } from "@gooddata/api-client-tiger";
import { cloneWithSanitizedIds } from "../../IdSanitization.js";
import { fixInsightLegacyElementUris } from "../../fixLegacyElementUris.js";

export function convertVisualizationObject(
    visualizationObject: VisualizationObjectModelV2.IVisualizationObject,
    title: string,
    description: string,
    tags?: string[],
): IInsightDefinition {
    const { version: _, ...data } = visualizationObject;

    const convertedInsight: IInsightDefinition = {
        insight: {
            ...data,
            title,
            summary: description,
            buckets: cloneWithSanitizedIds(visualizationObject.buckets) ?? [],
            filters: cloneWithSanitizedIds(visualizationObject.filters) ?? [],
            sorts: cloneWithSanitizedIds(visualizationObject.sorts) ?? [],
            tags,
        },
    };

    return fixInsightLegacyElementUris(convertedInsight);
}
