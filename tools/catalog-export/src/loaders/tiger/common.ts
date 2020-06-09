// (C) 2007-2020 GoodData Corporation
import { SuccessIncluded, TagResourceReference, TagResourceSchema } from "@gooddata/gd-tiger-client";
import { keyBy } from "lodash";

export type TagMap = { [id: string]: TagResourceSchema };

/**
 * Create tag id -> tag object map from sideloaded entities section of JSON-API response.
 *
 * @param included - sideloaded responses.
 */
export function createTagMap(included: SuccessIncluded[] | undefined): TagMap {
    if (!included) {
        return {};
    }

    const tags: TagResourceSchema[] = included
        .map(include => {
            if (include.type !== "tag") {
                return null;
            }

            return include as TagResourceSchema;
        })
        .filter((include): include is TagResourceSchema => include !== null);

    return keyBy(tags, t => t.id);
}

/**
 * Given relationships included in an JSON API entity, convert tag relationships to a string of
 * comma-separated tag titles.
 *
 * @param relationships - relationships object in JSON API response
 * @param tagsMap - mapping of tag id -> tag object
 */
export function convertTags(relationships: object | undefined, tagsMap: TagMap): string {
    if (!relationships) {
        return "";
    }

    const tagRefs: TagResourceReference[] = (relationships as any)?.tags?.data ?? [];

    return tagRefs
        .map(ref => {
            const tag = tagsMap[ref.id];

            if (!tag) {
                return;
            }

            return tag.attributes.title ?? ref.id;
        })
        .filter(tag => typeof tag === "string")
        .join(",");
}
