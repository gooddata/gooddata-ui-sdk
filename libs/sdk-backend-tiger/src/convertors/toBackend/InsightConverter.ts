// (C) 2019-2026 GoodData Corporation

import { omit } from "lodash-es";

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
    type IInsight,
    type IInsightDefinition,
    type IInsightLayerDefinition,
    type ISortItem,
    type VisualizationProperties,
    insightLayers,
} from "@gooddata/sdk-model";

import { cloneWithSanitizedIdsTyped } from "./IdSanitization.js";

function removeIdentifiers(insight: IInsight): IInsightDefinition {
    const insightData = omit(insight.insight, ["ref", "uri", "identifier"]);

    return {
        ...insight,
        insight: insightData,
    };
}

function removeVisualizationPropertiesSortItems(insight: IInsight): IInsightDefinition {
    return {
        ...insight,
        insight: {
            ...insight.insight,
            properties: omit(insight.insight.properties, ["sortItems"]),
        },
    };
}

/**
 * Converts platform-agnostic insight definition to Tiger-specific visualization object.
 *
 * @param insight - Platform-agnostic insight definition (uses IBucket[], IFilter[], etc.)
 * @returns Tiger visualization object (uses ITigerBucket[], ITigerFilter[], etc.)
 */
export const convertInsight = (
    insight: IInsightDefinition,
): VisualizationObjectModelV2.IVisualizationObject => {
    const sanitizedInsight: IInsightDefinition = removeVisualizationPropertiesSortItems(
        removeIdentifiers(insight as IInsight) as IInsight,
    );

    const layers = insightLayers(insight);
    const layersProp =
        layers && layers.length > 0
            ? {
                  layers: cloneWithSanitizedIdsTyped<
                      IInsightLayerDefinition[],
                      ITigerInsightLayerDefinition[]
                  >(layers),
              }
            : {};

    return {
        buckets: cloneWithSanitizedIdsTyped<IBucket[], ITigerBucket[]>(sanitizedInsight.insight.buckets),
        filters: cloneWithSanitizedIdsTyped<IFilter[], ITigerFilter[]>(sanitizedInsight.insight.filters),
        ...(sanitizedInsight.insight.attributeFilterConfigs
            ? {
                  attributeFilterConfigs: cloneWithSanitizedIdsTyped<
                      IAttributeFilterConfigs,
                      ITigerAttributeFilterConfigs
                  >(sanitizedInsight.insight.attributeFilterConfigs),
              }
            : {}),
        sorts: cloneWithSanitizedIdsTyped<ISortItem[], ITigerSortItem[]>(sanitizedInsight.insight.sorts),
        properties: cloneWithSanitizedIdsTyped<VisualizationProperties, ITigerVisualizationProperties>(
            sanitizedInsight.insight.properties,
        ),
        visualizationUrl: sanitizedInsight.insight.visualizationUrl,
        version: "2",
        ...layersProp,
    };
};
