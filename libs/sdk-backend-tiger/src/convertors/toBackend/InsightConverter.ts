// (C) 2019-2020 GoodData Corporation
import { IInsightDefinition } from "@gooddata/sdk-model";
import { VisualizationObject } from "@gooddata/api-client-tiger";
import { cloneWithSanitizedIds } from "./IdSanitization";

export const convertInsight = (insight: IInsightDefinition): VisualizationObject.IVisualizationObject => {
    return {
        visualizationObject: {
            ...insight.insight,
            buckets: cloneWithSanitizedIds(insight.insight.buckets),
            filters: cloneWithSanitizedIds(insight.insight.filters),
            sorts: cloneWithSanitizedIds(insight.insight.sorts),
        },
    };
};
