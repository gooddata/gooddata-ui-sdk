// (C) 2026 GoodData Corporation

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { IParameterMetadataObjectDefinition } from "@gooddata/sdk-model";

import { convertParameterToCatalogItem } from "../catalogItem/converter.js";
import {
    createParameterCatalogItem,
    deleteParameterCatalogItem,
    updateParameterCatalogItem,
} from "../catalogItem/query.js";
import type { ICatalogItemParameter, ICatalogItemRef } from "../catalogItem/types.js";

/**
 * @internal
 */
export interface IParameterMutationPort {
    create(definition: IParameterMetadataObjectDefinition): Promise<ICatalogItemParameter>;
    update(item: ICatalogItemParameter): Promise<ICatalogItemParameter>;
    delete(ref: ICatalogItemRef): Promise<void>;
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
        async update(item) {
            const savedParameter = await updateParameterCatalogItem(backend, workspace, item);
            return convertParameterToCatalogItem(savedParameter);
        },
        async delete(ref) {
            await deleteParameterCatalogItem(backend, workspace, ref);
        },
    };
}
