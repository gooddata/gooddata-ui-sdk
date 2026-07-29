// (C) 2019-2025 GoodData Corporation
import { invariant } from "ts-invariant";

import { VisualizationObjectModelV1, VisualizationObjectModelV2 } from "@gooddata/api-client-tiger";
import { type IInsightDefinition } from "@gooddata/sdk-model";

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

/**
 * The title, description and tags of a visualization object — the attributes stored alongside its
 * free-form `content`, not derivable from the content itself.
 *
 * @internal
 */
export interface IVisualizationObjectMetadata {
    title: string;
    description: string;
    tags?: string[];
}

/**
 * Converts the free-form `content` of a stored visualization object into a platform-agnostic insight
 * definition, pairing it with the object's `metadata`. `content` is typed as `object` because that is the
 * visualization object's free-form content field type; internally it must be a V1 or V2 body.
 *
 * @internal
 */
export const convertVisualizationContentToInsight = (
    content: object,
    metadata: IVisualizationObjectMetadata,
): IInsightDefinition =>
    convertVisualizationObject(
        content as
            | VisualizationObjectModelV1.IVisualizationObject
            | VisualizationObjectModelV2.IVisualizationObject,
        metadata.title,
        metadata.description,
        metadata.tags,
    );
