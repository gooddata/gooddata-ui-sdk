// (C) 2020-2022 GoodData Corporation
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
            ref: idRef(id, "insight"),
            // TODO: TIGER-HACK: inherited objects must be locked; they are read-only for all
            isLocked: isInheritedObject(id),
            tags,
        },
    };
};

export const visualizationObjectsItemToInsight = (
    visualizationObject: JsonApiVisualizationObjectOutWithLinks,
): IInsight => {
    const { id, attributes, links } = visualizationObject;
    const { content, title, description, tags } = attributes!;

    return insightFromInsightDefinition(
        convertVisualizationObject(
            content! as
                | VisualizationObjectModelV1.IVisualizationObject
                | VisualizationObjectModelV2.IVisualizationObject,
            title!,
            description!,
            tags,
        ),
        id,
        links!.self,
        tags,
    );
};
