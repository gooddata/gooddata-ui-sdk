// (C) 2019-2021 GoodData Corporation
import { IInsight, IInsightDefinition } from "@gooddata/sdk-model";
import { VisualizationObjectModelV2 } from "@gooddata/api-client-tiger";
import { cloneWithSanitizedIds } from "./IdSanitization.js";
import omit from "lodash/omit.js";
import flow from "lodash/flow.js";

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
    const sanitizedInsight: IInsightDefinition = flow(
        removeIdentifiers,
        removeVisualizationPropertiesSortItems,
    )(insight as IInsight);

    return {
        buckets: cloneWithSanitizedIds(sanitizedInsight.insight.buckets),
        filters: cloneWithSanitizedIds(sanitizedInsight.insight.filters),
        sorts: cloneWithSanitizedIds(sanitizedInsight.insight.sorts),
        properties: sanitizedInsight.insight.properties,
        visualizationUrl: sanitizedInsight.insight.visualizationUrl,
        version: "2",
    };
};
