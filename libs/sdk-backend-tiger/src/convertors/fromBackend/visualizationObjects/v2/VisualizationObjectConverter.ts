// (C) 2019-2026 GoodData Corporation

import {
    type ITigerAttributeFilterConfigs,
    type ITigerBucket,
    type ITigerInsightLayerDefinition,
    type ITigerSortItem,
    type ITigerVisualizationProperties,
    type VisualizationObjectModelV2,
} from "@gooddata/api-client-tiger";
import {
    type IAttributeFilterConfigs,
    type IBucket,
    type IInsightDefinition,
    type IInsightLayerDefinition,
    type ISortItem,
    type VisualizationProperties,
} from "@gooddata/sdk-model";

import { convertTigerToSdkFilters } from "../../../shared/storedFilterConverter.js";
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
                  layers: visualizationObject.layers.map((layer) => {
                      const convertedLayer = cloneWithSanitizedIdsTyped<
                          ITigerInsightLayerDefinition,
                          IInsightLayerDefinition
                      >(layer);

                      const layerFilters = convertTigerToSdkFilters(layer.filters);

                      return {
                          ...convertedLayer,
                          ...(layerFilters ? { filters: layerFilters } : {}),
                      };
                  }),
              }
            : {};

    const convertedInsight: IInsightDefinition = {
        insight: {
            visualizationUrl: visualizationObject.visualizationUrl,
            title,
            summary: description,
            buckets: cloneWithSanitizedIdsTyped<ITigerBucket[], IBucket[]>(visualizationObject.buckets) ?? [],
            filters: convertTigerToSdkFilters(visualizationObject.filters) ?? [],
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
