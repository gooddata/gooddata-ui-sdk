// (C) 2019-2022 GoodData Corporation
import { invariant } from "ts-invariant";
import { IInsightDefinition } from "@gooddata/sdk-model";
import { VisualizationObjectModelV1, VisualizationObjectModelV2 } from "@gooddata/api-client-tiger";
import { convertVisualizationObject as convertVisualizationObjectV1 } from "./v1/VisualizationObjectConverter.js";
import { convertVisualizationObject as convertVisualizationObjectV2 } from "./v2/VisualizationObjectConverter.js";

export const convertVisualizationObject = (
    visualizationObject:
        | VisualizationObjectModelV1.IVisualizationObject
        | VisualizationObjectModelV2.IVisualizationObject,
    title: string,
    description: string,
    tags: string[] | undefined,
): IInsightDefinition => {
    if (VisualizationObjectModelV1.isVisualizationObject(visualizationObject)) {
        return convertVisualizationObjectV1(visualizationObject);
    }

    if (VisualizationObjectModelV2.isVisualizationObject(visualizationObject)) {
        return convertVisualizationObjectV2(visualizationObject, title, description, tags);
    }

    invariant(false, "Unknown visualization object version");
};
