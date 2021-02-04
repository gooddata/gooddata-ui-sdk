// (C) 2020-2021 GoodData Corporation
import { VisualizationObjectModel, JsonApiVisualizationObjectWithLinks } from "@gooddata/api-client-tiger";
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

export const visualizationObjectsItemToInsight = (
    visualizationObject: JsonApiVisualizationObjectWithLinks,
) => {
    return insightFromInsightDefinition(
        convertVisualizationObject(
            visualizationObject!.attributes!.content! as VisualizationObjectModel.IVisualizationObject,
        ),
        visualizationObject.id,
        visualizationObject.links!.self,
    );
};
