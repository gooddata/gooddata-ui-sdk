// (C) 2007-2020 GoodData Corporation
import {
    AttributesItem,
    DatasetsItem,
    LabelsItem,
    RelationshipToOne,
    SuccessIncluded,
} from "@gooddata/api-client-tiger";
import keyBy from "lodash/keyBy";
import { Attribute, DisplayForm } from "../../base/types";

export type LabelMap = { [id: string]: LabelsItem };
export type DatasetMap = { [id: string]: DatasetsItem };

export function createLabelMap(included: SuccessIncluded[] | undefined): LabelMap {
    if (!included) {
        return {};
    }

    const labels: LabelsItem[] = included
        .map((include) => {
            if (include.type !== "label") {
                return null;
            }

            return include as LabelsItem;
        })
        .filter((include): include is LabelsItem => include !== null);

    return keyBy(labels, (t) => t.id);
}

export function createDatasetMap(included: SuccessIncluded[] | undefined): DatasetMap {
    if (!included) {
        return {};
    }

    const datasets: DatasetsItem[] = included
        .map((include) => {
            if (include.type !== "dataset") {
                return null;
            }

            return include as DatasetsItem;
        })
        .filter((include): include is DatasetsItem => include !== null);

    return keyBy(datasets, (t) => t.id);
}

export function getReferencedDataset(
    relationships: object | undefined,
    datasetsMap: DatasetMap,
): DatasetsItem | undefined {
    if (!relationships) {
        return;
    }

    const datasetsRef: DatasetsItem = (relationships as any)?.dataset?.data;

    if (!datasetsRef) {
        return;
    }

    return datasetsMap[datasetsRef.id];
}

export function convertLabels(attribute: AttributesItem, labelsMap: LabelMap): DisplayForm[] {
    const labelsRefs = attribute.relationships?.labels?.data;
    let labelsArray: RelationshipToOne[] = [];
    if (Array.isArray(labelsRefs)) {
        labelsArray = (labelsRefs as unknown) as RelationshipToOne[];
    } else if (typeof labelsRefs === "object" && Object.keys(labelsRefs).length > 0) {
        // FIXME else branch can be deleted when BE return always array according to types
        // @ts-expect-error despite type, labelsRefs can be object
        labelsArray.push({ id: labelsRefs.id, type: labelsRefs.type });
    }
    return labelsArray
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

export function convertAttribute(attribute: AttributesItem, labels: LabelMap): Attribute | undefined {
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
