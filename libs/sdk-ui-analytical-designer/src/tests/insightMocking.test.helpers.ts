// (C) 2020-2026 GoodData Corporation

import { type IInsight, type InsightModifications, newInsightDefinition, uriRef } from "@gooddata/sdk-model";

export const newInsight = (
    visualizationUrl: string,
    insightIdentifier: string,
    insightUri: string,
    modifications?: InsightModifications,
): IInsight => {
    const definition = newInsightDefinition(visualizationUrl, modifications);
    return {
        insight: {
            ...definition.insight,
            identifier: insightIdentifier,
            uri: insightUri,
            ref: uriRef(insightUri),
        },
    };
};
