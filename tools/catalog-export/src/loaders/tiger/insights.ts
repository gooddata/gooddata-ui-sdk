// (C) 2007-2020 GoodData Corporation

// @ts-ignore
import { ObjectMeta } from "../../base/types";
import { DefaultGetOptions } from "./client";
import { ITigerClient } from "@gooddata/gd-tiger-client";
import { convertTags, createTagMap } from "./common";

/**
 * Load insights that are stored in workspace's metadata so that their links can be included
 * in the generated output for easy embedding access.
 *
 * @param _projectId - project id, ignored for now as tiger is single-workspace
 * @param tigerClient - tiger client to use for communication
 */
export async function loadInsights(_projectId: string, tigerClient: ITigerClient): Promise<ObjectMeta[]> {
    const result = await tigerClient.metadata.visualizationObjectsGet(DefaultGetOptions);

    const tagsMap = createTagMap(result.data.included);

    return result.data.data.map(vis => {
        const tags = convertTags(vis.relationships, tagsMap);

        return {
            title: vis.attributes.title ?? vis.id,
            identifier: vis.id,
            tags,
        };
    });
}
