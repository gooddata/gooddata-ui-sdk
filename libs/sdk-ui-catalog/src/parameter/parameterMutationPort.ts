// (C) 2026 GoodData Corporation

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IParameterMetadataObjectDefinition, idRef } from "@gooddata/sdk-model";

import type { IAsCodeMutationPort } from "../asCode/descriptor.js";
import { convertParameterToCatalogItem } from "../catalogItem/converter.js";
import {
    createParameterCatalogItem,
    deleteParameterCatalogItem,
    updateParameterCatalogItem,
} from "../catalogItem/query.js";
import type { ICatalogItemParameter } from "../catalogItem/types.js";

/**
 * A parameter's YAML round-trips 1:1 to its definition, so the editor works directly off the catalog
 * item (see the descriptor's `editSeed`) — there is no `load`.
 * @internal
 */
export type IParameterMutationPort = IAsCodeMutationPort<
    IParameterMetadataObjectDefinition,
    ICatalogItemParameter
>;

/** Titles of objects that depend on a parameter (metrics, computed attributes, insights, dashboards). @internal */
export async function listParameterReferences(
    backend: IAnalyticalBackend,
    workspace: string,
    item: ICatalogItemParameter,
): Promise<string[]> {
    const { nodes } = await backend
        .workspace(workspace)
        .references()
        .getReferences(idRef(item.identifier, "parameter"), { direction: "up" });
    return nodes.filter((node) => !node.isRoot).map((node) => node.title);
}

/**
 * @internal
 */
export function createParameterMutationAdapter(
    backend: IAnalyticalBackend,
    workspace: string,
): IParameterMutationPort {
    return {
        async create(definition) {
            const savedParameter = await createParameterCatalogItem(backend, workspace, definition);
            return convertParameterToCatalogItem(savedParameter);
        },
        async update(base, definition) {
            // Identity is authoritative from the base the editor started from, never from the editable
            // YAML — a hand-edited `id` must not retarget the update to a different parameter.
            const identity = base.id;
            if (identity === undefined) {
                throw new Error("Cannot update a parameter without an identity.");
            }
            if (definition.id !== undefined && definition.id !== identity) {
                throw new Error("A parameter's identity cannot be changed during an update.");
            }
            // The parsed definition is the complete new state (1:1 round-trip); only its identity is pinned.
            const savedParameter = await updateParameterCatalogItem(backend, workspace, {
                ...definition,
                id: identity,
            });
            return convertParameterToCatalogItem(savedParameter);
        },
        async delete(ref) {
            await deleteParameterCatalogItem(backend, workspace, ref);
        },
    };
}
