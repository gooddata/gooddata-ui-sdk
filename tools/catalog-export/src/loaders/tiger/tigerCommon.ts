// (C) 2007-2022 GoodData Corporation
import {
    JsonApiDatasetOut,
    JsonApiLabelOut,
    JsonApiAttributeOutRelationships,
    JsonApiLabelLinkage,
    DatasetReferenceIdentifier,
    JsonApiAttributeOutWithLinks,
    JsonApiDatasetToOneLinkage,
} from "@gooddata/api-client-tiger";
import keyBy from "lodash/keyBy";
import { Attribute, DisplayForm } from "../../base/types";

export type LabelMap = { [id: string]: JsonApiLabelOut };
export type DatasetMap = { [id: string]: JsonApiDatasetOut };

export function createLabelMap(included: any[] | undefined): LabelMap {
    if (!included) {
        return {};
    }

    const labels: JsonApiLabelOut[] = included
        .map((include) => {
            if ((include as JsonApiLabelLinkage).type !== "label") {
                return null;
            }

            return include as JsonApiLabelOut;
        })
        .filter((include): include is JsonApiLabelOut => include !== null);

    return keyBy(labels, (t) => t.id);
}

export function createDatasetMap(included: any[] | undefined): DatasetMap {
    if (!included) {
        return {};
    }

    const datasets: JsonApiDatasetOut[] = included
        .map((include) => {
            if ((include as DatasetReferenceIdentifier).type !== "dataset") {
                return null;
            }

            return include as JsonApiDatasetOut;
        })
        .filter((include): include is JsonApiDatasetOut => include !== null);

    return keyBy(datasets, (t) => t.id);
}

export function getReferencedDataset(
    relationships: object | undefined,
    datasetsMap: DatasetMap,
): JsonApiDatasetOut | undefined {
    if (!relationships) {
        return;
    }

    const datasetsRef: JsonApiDatasetToOneLinkage = (relationships as JsonApiAttributeOutRelationships)
        ?.dataset?.data as JsonApiDatasetToOneLinkage;

    if (!datasetsRef) {
        return;
    }

    return datasetsMap[datasetsRef.id];
}

export function convertLabels(
    attribute: JsonApiAttributeOutWithLinks,
    labelsMap: LabelMap,
    workspaceId: string,
): DisplayForm[] {
    const labelsRefs = attribute.relationships?.labels?.data as JsonApiLabelLinkage[];
    return labelsRefs
        .map((ref) => {
            const label = labelsMap[ref.id];

            if (!label) {
                return;
            }

            return {
                meta: {
                    identifier: toFullyQualifiedId(ref.id, workspaceId),
                    title: label.attributes?.title ?? ref.id,
                    tags: label.attributes?.tags?.join(",") ?? "",
                },
            };
        })
        .filter((df): df is DisplayForm => df !== undefined);
}

export function convertAttribute(
    attribute: JsonApiAttributeOutWithLinks,
    labels: LabelMap,
    workspaceId: string,
): Attribute | undefined {
    return {
        attribute: {
            content: {
                displayForms: convertLabels(attribute, labels, workspaceId),
            },
            meta: {
                identifier: toFullyQualifiedId(attribute.id, workspaceId),
                title: attribute.attributes?.title ?? attribute.id,
                tags: attribute.attributes?.tags?.join(",") ?? "",
            },
        },
    };
}

const WORKSPACE_PREFIX_SEPARATOR = ":";

/**
 * To make sure ids are as portable as possible, prefix every non-prefixed id with the current workspace.
 * This makes sure that things created in that workspace will keep working even in child workspaces
 * (e.g. dashboard plugins created for a parent workspace should keep working in child workspaces as well
 * and for that to happen, all the ids must be prefixed with the parent workspace id).
 *
 * @param id - the id to convert
 * @param workspaceId - the id of the workspace the catalog is being exported for
 * @internal
 */
export function toFullyQualifiedId(id: string, workspaceId: string): string {
    const isAlreadyPrefixed = id.includes(WORKSPACE_PREFIX_SEPARATOR);
    return isAlreadyPrefixed ? id : [workspaceId, id].join(WORKSPACE_PREFIX_SEPARATOR);
}
