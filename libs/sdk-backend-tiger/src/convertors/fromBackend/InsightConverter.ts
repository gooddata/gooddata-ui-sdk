// (C) 2020-2021 GoodData Corporation
import { VisualizationObjectModel, JsonApiVisualizationObjectOutWithLinks } from "@gooddata/api-client-tiger";
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
            // TODO: TIGER-HACK: vis objects inherited from parent must be read-only. However there is no
            //  first-class way to discover this at the moment through the API. This hack relies on Tiger behavior
            //  where objects inherited from parent workspace have their id's in format `some_workspace_id:object_id`.
            //  Nothing else to do but to check for the colon. Luckily, the colon character cannot be used by clients.
            isLocked: id.indexOf(":") > -1,
        },
    };
};

export const visualizationObjectsItemToInsight = (
    visualizationObject: JsonApiVisualizationObjectOutWithLinks,
): IInsight => {
    return insightFromInsightDefinition(
        convertVisualizationObject(
            visualizationObject!.attributes!.content! as VisualizationObjectModel.IVisualizationObject,
        ),
        visualizationObject.id,
        visualizationObject.links!.self,
    );
};
