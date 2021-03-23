// (C) 2019-2021 GoodData Corporation
import { IInsightDefinition } from "@gooddata/sdk-model";
import { VisualizationObjectModelV2 } from "@gooddata/api-client-tiger";
import { cloneWithSanitizedIds } from "./IdSanitization";

export const convertInsight = (
    insight: IInsightDefinition,
): VisualizationObjectModelV2.IVisualizationObject => {
    const { title: _, ...insightData } = insight.insight;
    return {
        ...insightData,
        buckets: cloneWithSanitizedIds(insight.insight.buckets),
        filters: cloneWithSanitizedIds(insight.insight.filters),
        sorts: cloneWithSanitizedIds(insight.insight.sorts),
        version: "2",
    };
};
