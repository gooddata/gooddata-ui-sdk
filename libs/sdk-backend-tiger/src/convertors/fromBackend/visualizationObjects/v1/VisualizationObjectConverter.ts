// (C) 2019-2025 GoodData Corporation
import { type VisualizationObjectModelV1 } from "@gooddata/api-client-tiger";
import { type IInsightDefinition } from "@gooddata/sdk-model";

import { fixInsightLegacyElementUris } from "../../fixLegacyElementUris.js";
import { cloneWithSanitizedIds } from "../../IdSanitization.js";

export function convertVisualizationObject(
    visualizationObject: VisualizationObjectModelV1.IVisualizationObject,
): IInsightDefinition {
    const convertedInsight: IInsightDefinition = {
        insight: {
            ...visualizationObject.visualizationObject,
            buckets: cloneWithSanitizedIds(visualizationObject.visualizationObject.buckets) ?? [],
            filters: cloneWithSanitizedIds(visualizationObject.visualizationObject.filters) ?? [],
            sorts: cloneWithSanitizedIds(visualizationObject.visualizationObject.sorts) ?? [],
        },
    };

    return fixInsightLegacyElementUris(convertedInsight);
}
