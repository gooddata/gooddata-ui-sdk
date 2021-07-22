// (C) 2020-2021 GoodData Corporation
import {
    VisualizationObjectModelV1,
    VisualizationObjectModelV2,
    JsonApiVisualizationObjectOutWithLinks,
} from "@gooddata/api-client-tiger";
import { idRef, IInsight, IInsightDefinition } from "@gooddata/sdk-model";
import { isInheritedObject } from "./utils";
import { convertVisualizationObject } from "./visualizationObjects/VisualizationObjectConverter";

export const insightFromInsightDefinition = (
    insight: IInsightDefinition,
    id: string,
    uri: string,
    tags: string[] | undefined,
): IInsight => {
    return {
        insight: {
            ...insight.insight,
            identifier: id,
            uri,
            ref: idRef(id, "visualizationObject"),
            // TODO: TIGER-HACK: inherited objects must be locked; they are read-only for all
            isLocked: isInheritedObject(id),
            tags,
        },
    };
};

export const visualizationObjectsItemToInsight = (
    visualizationObject: JsonApiVisualizationObjectOutWithLinks,
): IInsight => {
    return insightFromInsightDefinition(
        convertVisualizationObject(
            visualizationObject!.attributes!.content! as
                | VisualizationObjectModelV1.IVisualizationObject
                | VisualizationObjectModelV2.IVisualizationObject,
            visualizationObject.attributes!.title!,
        ),
        visualizationObject.id,
        visualizationObject.links!.self,
        visualizationObject.attributes!.tags,
    );
};
