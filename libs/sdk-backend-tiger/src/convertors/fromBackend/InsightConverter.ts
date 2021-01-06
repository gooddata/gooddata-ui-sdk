// (C) 2020 GoodData Corporation
import { VisualizationObjectModel, VisualizationObjectsItem } from "@gooddata/api-client-tiger";
import { idRef, IInsight, IInsightDefinition } from "@gooddata/sdk-model";
import { convertVisualizationObject } from "./VisualizationObjectConverter";

export const insightFromInsightDefinition = (
    insight: IInsightDefinition,
    id: string,
    uri: string,
): IInsight => {
    return {
        insight: {
            ...insight.insight,
            identifier: id,
            uri,
            ref: idRef(id, "visualizationObject"),
        },
    };
};

export const visualizationObjectsItemToInsight = (visualizationObjectsItem: VisualizationObjectsItem) => {
    return insightFromInsightDefinition(
        convertVisualizationObject(
            visualizationObjectsItem!.attributes!.content! as VisualizationObjectModel.IVisualizationObject,
        ),
        visualizationObjectsItem.id,
        visualizationObjectsItem.links?.self ||
            `https://staging.anywhere.gooddata.com/api/workspaces/demo/model/visualizationObjects/${visualizationObjectsItem.id}`, // FIXME we always need links, but it is not defined in included
    );
};
