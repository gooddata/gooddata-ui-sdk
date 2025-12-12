// (C) 2019-2025 GoodData Corporation

import { type VisualizationObjectModelV2 } from "@gooddata/api-client-tiger";
import { type IInsightDefinition } from "@gooddata/sdk-model";

import { fixInsightLegacyElementUris } from "../../fixLegacyElementUris.js";
import { cloneWithSanitizedIds } from "../../IdSanitization.js";

export function convertVisualizationObject(
    visualizationObject: VisualizationObjectModelV2.IVisualizationObject,
    title: string,
    description: string,
    tags?: string[],
): IInsightDefinition {
    const { version: _, ...data } = visualizationObject;

    const layersProp =
        visualizationObject.layers && visualizationObject.layers.length > 0
            ? {
                  layers: cloneWithSanitizedIds(visualizationObject.layers),
              }
            : {};

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
            ...layersProp,
        },
    };

    return fixInsightLegacyElementUris(convertedInsight);
}
