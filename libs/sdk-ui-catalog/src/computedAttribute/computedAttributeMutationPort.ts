// (C) 2026 GoodData Corporation

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    type IComputedAttributeMetadataObject,
    type IComputedAttributeMetadataObjectDefinition,
    idRef,
    insightTitle,
    isComputedAttributeMetadataObject,
} from "@gooddata/sdk-model";

import type { IAsCodeMutationPort } from "../asCode/descriptor.js";
import type { ServerIdentity } from "../asCode/serverIdentity.js";
import { convertComputedAttributeToCatalogItem } from "../catalogItem/converter.js";
import type { ICatalogItemComputedAttribute } from "../catalogItem/types.js";

/**
 * @internal
 */
export type IComputedAttributeMutationPort = IAsCodeMutationPort<
    IComputedAttributeMetadataObjectDefinition,
    ICatalogItemComputedAttribute
>;

// `id` is definition-expressible yet server-owned: the update targets by it, so a hand-edited id must not retarget it.
function pickComputedAttributeIdentity(
    computedAttribute: IComputedAttributeMetadataObject,
): ServerIdentity<IComputedAttributeMetadataObject, IComputedAttributeMetadataObjectDefinition> &
    Pick<IComputedAttributeMetadataObject, "id"> {
    const { id, ref, uri, created, updated, createdBy, updatedBy, certification, displayForms } =
        computedAttribute;
    return { id, ref, uri, created, updated, createdBy, updatedBy, certification, displayForms };
}

/** Fetches the full computed attribute for editing (the catalog item carries no MAQL). @internal */
export function loadComputedAttribute(
    backend: IAnalyticalBackend,
    workspace: string,
    item: ICatalogItemComputedAttribute,
): Promise<IComputedAttributeMetadataObjectDefinition> {
    return backend
        .workspace(workspace)
        .computedAttributes()
        .getComputedAttribute(idRef(item.identifier, "computedAttribute"));
}

/** Titles of the insights and metrics referencing a computed attribute. @internal */
export async function listComputedAttributeReferences(
    backend: IAnalyticalBackend,
    workspace: string,
    item: ICatalogItemComputedAttribute,
): Promise<string[]> {
    const referencing = await backend
        .workspace(workspace)
        .computedAttributes()
        .getComputedAttributeReferencingObjects(idRef(item.identifier, "computedAttribute"));
    return [
        ...(referencing.insights ?? []).map((insight) => insightTitle(insight)),
        ...(referencing.measures ?? []).map((measure) => measure.title),
    ];
}

/**
 * @internal
 */
export function createComputedAttributeMutationAdapter(
    backend: IAnalyticalBackend,
    workspace: string,
): IComputedAttributeMutationPort {
    const computedAttributes = () => backend.workspace(workspace).computedAttributes();
    return {
        async create(definition) {
            const saved = await computedAttributes().createComputedAttribute(definition);
            return convertComputedAttributeToCatalogItem(saved);
        },
        async update(base, definition) {
            if (!isComputedAttributeMetadataObject(base)) {
                throw new Error(
                    "Computed attribute update requires the loaded object as base, not a bare definition.",
                );
            }
            // Definition is authoritative (already reconciled); base fills only non-definition fields, and the server-identity pick wins.
            const saved = await computedAttributes().updateComputedAttribute({
                ...base,
                ...definition,
                ...pickComputedAttributeIdentity(base),
            });
            return convertComputedAttributeToCatalogItem(saved);
        },
        async delete(ref) {
            await computedAttributes().deleteComputedAttribute(idRef(ref.identifier, "computedAttribute"));
        },
    };
}
