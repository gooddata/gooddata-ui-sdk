// (C) 2019-2021 GoodData Corporation
import { IInsight, IInsightDefinition } from "@gooddata/sdk-model";
import { VisualizationObjectModelV2 } from "@gooddata/api-client-tiger";
import { cloneWithSanitizedIds } from "./IdSanitization";
import omit from "lodash/omit";
import flow from "lodash/flow";

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
    const sanitizedInsight = flow(
        removeIdentifiers,
        removeVisualizationPropertiesSortItems,
    )(insight as IInsight);

    const { title: _, ...insightData } = sanitizedInsight.insight;

    return {
        ...insightData,
        buckets: cloneWithSanitizedIds(sanitizedInsight.insight.buckets),
        filters: cloneWithSanitizedIds(sanitizedInsight.insight.filters),
        sorts: cloneWithSanitizedIds(sanitizedInsight.insight.sorts),
        version: "2",
    };
};
