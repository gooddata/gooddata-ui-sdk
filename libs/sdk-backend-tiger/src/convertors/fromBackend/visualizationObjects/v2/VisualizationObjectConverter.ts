// (C) 2019-2026 GoodData Corporation

import {
    type ITigerAttributeFilterConfigs,
    type ITigerBucket,
    type ITigerFilter,
    type ITigerInsightLayerDefinition,
    type ITigerSortItem,
    type ITigerVisualizationProperties,
    type VisualizationObjectModelV2,
} from "@gooddata/api-client-tiger";
import {
    type IAttributeFilterConfigs,
    type IBucket,
    type IFilter,
    type IInsightDefinition,
    type IInsightLayerDefinition,
    type ISortItem,
    type VisualizationProperties,
} from "@gooddata/sdk-model";

import { fixInsightLegacyElementUris } from "../../fixLegacyElementUris.js";
import { cloneWithSanitizedIdsTyped } from "../../IdSanitization.js";

/**
 * Converts Tiger-specific visualization object to platform-agnostic insight definition.
 *
 * @param visualizationObject - Tiger visualization object (uses ITigerBucket[], ITigerFilter[], etc.)
 * @param title - Insight title
 * @param description - Insight description
 * @param tags - Optional insight tags
 * @returns Platform-agnostic insight definition (uses IBucket[], IFilter[], etc.)
 */
export function convertVisualizationObject(
    visualizationObject: VisualizationObjectModelV2.IVisualizationObject,
    title: string,
    description: string,
    tags?: string[],
): IInsightDefinition {
    const layersProp =
        visualizationObject.layers && visualizationObject.layers.length > 0
            ? {
                  layers: cloneWithSanitizedIdsTyped<
                      ITigerInsightLayerDefinition[],
                      IInsightLayerDefinition[]
                  >(visualizationObject.layers),
              }
            : {};

    const convertedInsight: IInsightDefinition = {
        insight: {
            visualizationUrl: visualizationObject.visualizationUrl,
            title,
            summary: description,
            buckets: cloneWithSanitizedIdsTyped<ITigerBucket[], IBucket[]>(visualizationObject.buckets) ?? [],
            filters: cloneWithSanitizedIdsTyped<ITigerFilter[], IFilter[]>(visualizationObject.filters) ?? [],
            ...(visualizationObject.attributeFilterConfigs
                ? {
                      attributeFilterConfigs: cloneWithSanitizedIdsTyped<
                          ITigerAttributeFilterConfigs,
                          IAttributeFilterConfigs
                      >(visualizationObject.attributeFilterConfigs),
                  }
                : {}),
            sorts: cloneWithSanitizedIdsTyped<ITigerSortItem[], ISortItem[]>(visualizationObject.sorts) ?? [],
            properties: cloneWithSanitizedIdsTyped<ITigerVisualizationProperties, VisualizationProperties>(
                visualizationObject.properties,
            ),
            tags,
            ...layersProp,
        },
    };

    return fixInsightLegacyElementUris(convertedInsight);
}
