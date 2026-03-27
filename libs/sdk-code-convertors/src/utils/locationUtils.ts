// (C) 2023-2026 GoodData Corporation

import { type AfmObjectIdentifier } from "@gooddata/api-client-tiger";
import type { AttributeField, Dataset } from "@gooddata/sdk-code-schemas/v1";
import { type IAttribute } from "@gooddata/sdk-model";

import { isAttribute, parseReferenceObject } from "./typeGuards.js";
import { type ExportEntities, type FromEntities } from "../types.js";
import { createIdentifier, getIdentifier } from "./yamlUtils.js";

export function remapLocationAttribute(entities: FromEntities, def: IAttribute): IAttribute {
    const id = parseReferenceObject(getIdentifier(def.attribute.displayForm));
    const datasets = entities
        .map((entity) => (entity.type === "dataset" ? (entity.data as Dataset) : null))
        .filter(Boolean) as Dataset[];

    for (const dataset of datasets) {
        const fieldsId = Object.keys(dataset.fields || {});
        for (const fieldId of fieldsId) {
            const field = dataset.fields?.[fieldId];
            if (isAttribute(field) && id && field.labels?.[id.identifier]) {
                const label = field.labels[id.identifier];

                if (label.value_type === "GEO_LATITUDE") {
                    return {
                        ...def,
                        attribute: {
                            ...def.attribute,
                            displayForm: {
                                type: "attribute",
                                identifier: fieldId,
                            },
                        },
                    };
                }
            }
        }
    }

    return def;
}

export function mapLocationLabel(
    entities: ExportEntities,
    field: AttributeField,
): { displayForm: AfmObjectIdentifier | null; longitude?: string; latitude?: string } {
    const displayForm = createIdentifier(field.using);

    const datasets = entities
        .map((entity) => (entity.type === "dataset" ? (entity.data as Dataset) : null))
        .filter(Boolean) as Dataset[];

    for (const dataset of datasets) {
        const fieldsId = Object.keys(dataset.fields || {});
        for (const fieldId of fieldsId) {
            const field = dataset.fields?.[fieldId];
            if (isAttribute(field) && fieldId === displayForm?.identifier.id) {
                const labelIds = Object.keys(field.labels || {});

                let latitude: string | undefined;
                let longitude: string | undefined;
                for (const labelId of labelIds) {
                    const label = field.labels?.[labelId];
                    //latitude
                    if (label?.value_type === "GEO_LATITUDE") {
                        latitude = labelId;
                    }
                    //longitude
                    if (label?.value_type === "GEO_LONGITUDE") {
                        longitude = labelId;
                    }
                }

                if (latitude) {
                    return {
                        displayForm: {
                            identifier: {
                                id: latitude,
                                type: "label",
                            },
                        },
                        latitude,
                        longitude,
                    };
                }
            }
        }
    }

    return {
        displayForm,
    };
}
