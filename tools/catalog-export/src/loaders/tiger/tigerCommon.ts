// (C) 2007-2020 GoodData Corporation
import {
    DatasetResourceReference,
    DatasetResourceSchema,
    LabelResourceSchema,
    SuccessIncluded,
    TagResourceReference,
    TagResourceSchema,
    LabelResourceReference,
    AttributeResourceSchema,
} from "@gooddata/gd-tiger-client";
import { keyBy } from "lodash";
import { Attribute, DisplayForm } from "../../base/types";

export type TagMap = { [id: string]: TagResourceSchema };
export type LabelMap = { [id: string]: LabelResourceSchema };
export type DatasetMap = { [id: string]: DatasetResourceSchema };

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

export function createLabelMap(included: SuccessIncluded[] | undefined): LabelMap {
    if (!included) {
        return {};
    }

    const labels: LabelResourceSchema[] = included
        .map(include => {
            if (include.type !== "label") {
                return null;
            }

            return include as LabelResourceSchema;
        })
        .filter((include): include is LabelResourceSchema => include !== null);

    return keyBy(labels, t => t.id);
}

export function createDatasetMap(included: SuccessIncluded[] | undefined): DatasetMap {
    if (!included) {
        return {};
    }

    const labels: DatasetResourceSchema[] = included
        .map(include => {
            if (include.type !== "dataset") {
                return null;
            }

            return include as DatasetResourceSchema;
        })
        .filter((include): include is DatasetResourceSchema => include !== null);

    return keyBy(labels, t => t.id);
}

export function getReferencedDataset(
    relationships: object | undefined,
    datasetsMap: DatasetMap,
): DatasetResourceSchema | undefined {
    if (!relationships) {
        return;
    }

    const datasetsRef: DatasetResourceReference = (relationships as any)?.dataset?.data;

    if (!datasetsRef) {
        return;
    }

    return datasetsMap[datasetsRef.id];
}

export function convertLabels(
    attribute: AttributeResourceSchema,
    labelsMap: LabelMap,
    tagsMap: TagMap,
): DisplayForm[] {
    const labelRefs: LabelResourceReference[] = (attribute.relationships as any)?.labels?.data ?? [];

    return labelRefs
        .map(ref => {
            const label = labelsMap[ref.id];

            if (!label) {
                return;
            }

            return {
                meta: {
                    identifier: ref.id,
                    title: label.attributes.title ?? ref.id,
                    tags: convertTags(label.relationships, tagsMap),
                },
            };
        })
        .filter((df): df is DisplayForm => df !== undefined);
}

export function convertAttribute(
    attribute: AttributeResourceSchema,
    labels: LabelMap,
    tags: TagMap,
): Attribute | undefined {
    return {
        attribute: {
            content: {
                displayForms: convertLabels(attribute, labels, tags),
            },
            meta: {
                identifier: attribute.id,
                title: attribute.attributes.title ?? attribute.id,
                tags: convertTags(attribute.relationships, tags),
            },
        },
    };
}
