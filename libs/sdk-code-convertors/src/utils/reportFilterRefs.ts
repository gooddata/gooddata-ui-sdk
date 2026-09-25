// (C) 2026 GoodData Corporation

import { type ObjectType } from "@gooddata/sdk-model";

/**
 * A report stores its filters as the model holds them, while the convertor that writes and reads
 * them is the dashboard's, which works on what the declarative API sends. The two agree on every
 * field but one: how an object is referenced. The model names it by a type of its own and carries
 * the id beside it, the API nests the two and names the object as the document's prefixes do.
 *
 * Only the references are translated, so a field added to either shape needs nothing here.
 */

const documentTypeOfModelType: Partial<Record<ObjectType, string>> = {
    displayForm: "label",
    dataSet: "dataset",
    measure: "metric",
};

const modelTypeOfDocumentType: Record<string, ObjectType> = {
    label: "displayForm",
    dataset: "dataSet",
    metric: "measure",
};

/** A reference as the model holds it: the id beside the type. */
function isModelReference(value: object): value is { identifier: string; type?: ObjectType } {
    return typeof (value as { identifier?: unknown }).identifier === "string";
}

/** A reference as the declarative API sends it: the id and the type nested under the identifier. */
function isApiReference(value: object): value is { identifier: { id: string; type: string } } {
    const { identifier } = value as { identifier?: { id?: unknown } };
    return typeof identifier === "object" && identifier !== null && typeof identifier.id === "string";
}

function translate<T>(value: T, reference: (node: object) => object | undefined): T {
    if (Array.isArray(value)) {
        return value.map((item) => translate(item, reference)) as T;
    }
    if (value === null || typeof value !== "object") {
        return value;
    }
    const translated = reference(value);
    if (translated !== undefined) {
        return translated as T;
    }
    return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, translate(item, reference)]),
    ) as T;
}

/**
 * Every reference the value holds, named the way the document names the object.
 *
 * @internal
 */
export function referencesAsWritten<T>(value: T): T {
    return translate(value, (node) => {
        if (!isModelReference(node)) {
            return undefined;
        }
        const type = node.type === undefined ? undefined : documentTypeOfModelType[node.type];
        return type === undefined ? undefined : { ...node, type };
    });
}

/**
 * Every reference the value holds, back in the shape and under the type the model stores.
 *
 * @internal
 */
export function referencesAsStored<T>(value: T): T {
    return translate(value, (node) => {
        if (!isApiReference(node)) {
            return undefined;
        }
        const { id, type } = node.identifier;
        return { identifier: id, type: modelTypeOfDocumentType[type] ?? type };
    });
}
