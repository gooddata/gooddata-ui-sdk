// (C) 2007-2021 GoodData Corporation
import {
    JsonApiAttribute,
    JsonApiDataset,
    JsonApiLabel,
    JsonApiAttributeRelationships,
    JsonApiLinkage,
} from "@gooddata/api-client-tiger";
import keyBy from "lodash/keyBy";
import { Attribute, DisplayForm } from "../../base/types";

export type LabelMap = { [id: string]: JsonApiLabel };
export type DatasetMap = { [id: string]: JsonApiDataset };

export function createLabelMap(included: any[] | undefined): LabelMap {
    if (!included) {
        return {};
    }

    const labels: JsonApiLabel[] = included
        .map((include) => {
            if ((include as JsonApiLinkage).type !== "label") {
                return null;
            }

            return include as JsonApiLabel;
        })
        .filter((include): include is JsonApiLabel => include !== null);

    return keyBy(labels, (t) => t.id);
}

export function createDatasetMap(included: any[] | undefined): DatasetMap {
    if (!included) {
        return {};
    }

    const datasets: JsonApiDataset[] = included
        .map((include) => {
            if ((include as JsonApiLinkage).type !== "dataset") {
                return null;
            }

            return include as JsonApiDataset;
        })
        .filter((include): include is JsonApiDataset => include !== null);

    return keyBy(datasets, (t) => t.id);
}

export function getReferencedDataset(
    relationships: object | undefined,
    datasetsMap: DatasetMap,
): JsonApiDataset | undefined {
    if (!relationships) {
        return;
    }

    const datasetsRef: JsonApiLinkage = (relationships as JsonApiAttributeRelationships)?.dataset
        ?.data as JsonApiLinkage;

    if (!datasetsRef) {
        return;
    }

    return datasetsMap[datasetsRef.id];
}

export function convertLabels(attribute: JsonApiAttribute, labelsMap: LabelMap): DisplayForm[] {
    const labelsRefs = attribute.relationships?.labels?.data as JsonApiLinkage[];
    return labelsRefs
        .map((ref) => {
            const label = labelsMap[ref.id];

            if (!label) {
                return;
            }

            return {
                meta: {
                    identifier: ref.id,
                    title: label.attributes?.title ?? ref.id,
                    tags: label.attributes?.tags?.join(",") ?? "",
                },
            };
        })
        .filter((df): df is DisplayForm => df !== undefined);
}

export function convertAttribute(attribute: JsonApiAttribute, labels: LabelMap): Attribute | undefined {
    return {
        attribute: {
            content: {
                displayForms: convertLabels(attribute, labels),
            },
            meta: {
                identifier: attribute.id,
                title: attribute.attributes?.title ?? attribute.id,
                tags: attribute.attributes?.tags?.join(",") ?? "",
            },
        },
    };
}
