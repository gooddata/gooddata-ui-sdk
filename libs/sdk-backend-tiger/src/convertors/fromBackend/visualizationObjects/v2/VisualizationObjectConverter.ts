// (C) 2019-2025 GoodData Corporation
import { VisualizationObjectModelV2 } from "@gooddata/api-client-tiger";
import { IInsightDefinition } from "@gooddata/sdk-model";

import { fixInsightLegacyElementUris } from "../../fixLegacyElementUris.js";
import { cloneWithSanitizedIds } from "../../IdSanitization.js";

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
            ...(visualizationObject.attributeFilterConfigs
                ? {
                      attributeFilterConfigs: cloneWithSanitizedIds(
                          visualizationObject.attributeFilterConfigs,
                      ),
                  }
                : {}),
            sorts: cloneWithSanitizedIds(visualizationObject.sorts) ?? [],
            tags,
        },
    };

    return fixInsightLegacyElementUris(convertedInsight);
}
