// (C) 2019-2025 GoodData Corporation

import { omit } from "lodash-es";

import { VisualizationObjectModelV2 } from "@gooddata/api-client-tiger";
import { IInsight, IInsightDefinition, insightLayers } from "@gooddata/sdk-model";

import { cloneWithSanitizedIds } from "./IdSanitization.js";

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
                  layers: cloneWithSanitizedIds(layers),
              }
            : {};

    return {
        buckets: cloneWithSanitizedIds(sanitizedInsight.insight.buckets),
        filters: cloneWithSanitizedIds(sanitizedInsight.insight.filters),
        ...(sanitizedInsight.insight.attributeFilterConfigs
            ? {
                  attributeFilterConfigs: cloneWithSanitizedIds(
                      sanitizedInsight.insight.attributeFilterConfigs,
                  ),
              }
            : {}),
        sorts: cloneWithSanitizedIds(sanitizedInsight.insight.sorts),
        properties: sanitizedInsight.insight.properties,
        visualizationUrl: sanitizedInsight.insight.visualizationUrl,
        version: "2",
        ...layersProp,
    };
};
