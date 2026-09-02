// (C) 2026 GoodData Corporation

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    type IMeasureMetadataObject,
    type IMeasureMetadataObjectDefinition,
    type ISettings,
    idRef,
    insightTitle,
    isMeasureMetadataObject,
} from "@gooddata/sdk-model";

import type { IAsCodeMutationPort } from "../asCode/descriptor.js";
import type { ServerIdentity } from "../asCode/serverIdentity.js";
import { convertMeasureToCatalogItem } from "../catalogItem/converter.js";
import {
    createMeasureCatalogItem,
    deleteMeasureCatalogItem,
    getMeasureCatalogItem,
    getMeasureReferencingObjectsCatalogItem,
    updateMeasureCatalogItem,
} from "../catalogItem/query.js";
import type { ICatalogItemMeasure } from "../catalogItem/types.js";

/**
 * @internal
 */
export type IMetricMutationPort = IAsCodeMutationPort<IMeasureMetadataObjectDefinition, ICatalogItemMeasure>;

// `id` is definition-expressible yet server-owned: the update targets by it, so a hand-edited id must not retarget it.
function pickMetricIdentity(
    measure: IMeasureMetadataObject,
): ServerIdentity<IMeasureMetadataObject, IMeasureMetadataObjectDefinition> &
    Pick<IMeasureMetadataObject, "id"> {
    const { id, ref, uri, created, updated, createdBy, updatedBy, certification } = measure;
    return { id, ref, uri, created, updated, createdBy, updatedBy, certification };
}

/** Fetches the full measure for editing (the catalog item carries no MAQL). @internal */
export function loadMetric(
    backend: IAnalyticalBackend,
    workspace: string,
    item: ICatalogItemMeasure,
): Promise<IMeasureMetadataObjectDefinition> {
    return getMeasureCatalogItem(backend, workspace, idRef(item.identifier, "measure"));
}

/** Titles of the insights and measures referencing a measure. @internal */
export async function listMetricReferences(
    backend: IAnalyticalBackend,
    workspace: string,
    item: ICatalogItemMeasure,
): Promise<string[]> {
    const referencing = await getMeasureReferencingObjectsCatalogItem(
        backend,
        workspace,
        idRef(item.identifier, "measure"),
    );
    return [
        ...(referencing.insights ?? []).map((insight) => insightTitle(insight)),
        ...(referencing.measures ?? []).map((measure) => measure.title),
    ];
}

/**
 * @internal
 */
export function createMetricMutationAdapter(
    backend: IAnalyticalBackend,
    workspace: string,
    settings?: ISettings,
): IMetricMutationPort {
    const loadPermissions = Boolean(settings?.enableMetricPermissions);

    return {
        async create(definition) {
            // create is the only write that can return permissions, and the new metric is opened
            // straight from its result
            const savedMeasure = await createMeasureCatalogItem(
                backend,
                workspace,
                definition,
                loadPermissions,
            );
            return convertMeasureToCatalogItem(savedMeasure);
        },
        async update(base, definition) {
            if (!isMeasureMetadataObject(base)) {
                throw new Error("Metric update requires the loaded measure as base, not a bare definition.");
            }
            // Definition is authoritative (already reconciled); base fills only non-definition fields, and the server-identity pick wins.
            const savedMeasure = await updateMeasureCatalogItem(backend, workspace, {
                ...base,
                ...definition,
                ...pickMetricIdentity(base),
            });
            return convertMeasureToCatalogItem(savedMeasure);
        },
        async delete(ref) {
            await deleteMeasureCatalogItem(backend, workspace, idRef(ref.identifier, "measure"));
        },
    };
}
