// (C) 2019-2020 GoodData Corporation
import { IInsight, newInsightDefinition, IInsightDefinition } from "@gooddata/sdk-model";

const visualizationTypes = [
    "local:scatter",
    "local:donut",
    "local:area",
    "local:table",
    "local:headline",
    "local:column",
    "local:line",
    "local:treemap",
    "local:heatmap",
    "local:bubble",
    "local:pie",
    "local:bar",
    "local:combo",
];

export const appendIdAndUri = (insight: IInsightDefinition, id: string): IInsight => {
    const insightWithIdAndUri: IInsight = {
        insight: {
            ...insight.insight,
            identifier: id,
            uri: `workspaceId/insights/${id}`,
        },
    };

    return insightWithIdAndUri;
};

export const insights: IInsight[] = visualizationTypes.map(type =>
    appendIdAndUri(
        newInsightDefinition(type, i => i.title(`Insight ${type}`)),
        type,
    ),
);
