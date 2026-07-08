// (C) 2026 GoodData Corporation

import type { IAnalyticalBackend, IMeasureReferencing } from "@gooddata/sdk-backend-spi";
import {
    type IMeasureMetadataObject,
    type IMeasureMetadataObjectDefinition,
    idRef,
} from "@gooddata/sdk-model";

import { convertMeasureToCatalogItem } from "../catalogItem/converter.js";
import {
    createMeasureCatalogItem,
    deleteMeasureCatalogItem,
    getMeasureCatalogItem,
    getMeasureReferencingObjectsCatalogItem,
    updateMeasureCatalogItem,
} from "../catalogItem/query.js";
import type { ICatalogItemMeasure, ICatalogItemRef } from "../catalogItem/types.js";

import { overlayMetricYamlFields } from "./metricConverter.js";

/**
 * @internal
 */
export interface IMetricMutationPort {
    create(definition: IMeasureMetadataObjectDefinition): Promise<ICatalogItemMeasure>;
    update(
        existing: IMeasureMetadataObject,
        definition: IMeasureMetadataObjectDefinition,
    ): Promise<ICatalogItemMeasure>;
    delete(ref: ICatalogItemRef): Promise<void>;
    load(ref: ICatalogItemRef): Promise<IMeasureMetadataObject>;
    getReferencingObjects(ref: ICatalogItemRef): Promise<IMeasureReferencing>;
}

/**
 * @internal
 */
export function createMetricMutationAdapter(
    backend: IAnalyticalBackend,
    workspace: string,
): IMetricMutationPort {
    return {
        async create(definition) {
            const savedMeasure = await createMeasureCatalogItem(backend, workspace, definition);
            return convertMeasureToCatalogItem(savedMeasure);
        },
        async update(existing, definition) {
            const savedMeasure = await updateMeasureCatalogItem(
                backend,
                workspace,
                mergeMeasureDefinition(existing, definition),
            );
            return convertMeasureToCatalogItem(savedMeasure);
        },
        async delete(ref) {
            await deleteMeasureCatalogItem(backend, workspace, idRef(ref.identifier, "measure"));
        },
        async load(ref) {
            return getMeasureCatalogItem(backend, workspace, idRef(ref.identifier, "measure"));
        },
        async getReferencingObjects(ref) {
            return getMeasureReferencingObjectsCatalogItem(
                backend,
                workspace,
                idRef(ref.identifier, "measure"),
            );
        },
    };
}

/**
 * Overlays the fields the as-code YAML owns onto the loaded metric.
 *
 * The measures update endpoint is a full replace, so fields absent from the YAML
 * (`metricType`, `isHiddenFromKda`, identity, ...) must be carried over from the loaded metric to
 * avoid wiping them; `overlayMetricYamlFields` preserves them via the base spread.
 */
function mergeMeasureDefinition(
    existing: IMeasureMetadataObject,
    definition: IMeasureMetadataObjectDefinition,
): IMeasureMetadataObject {
    return overlayMetricYamlFields(existing, definition);
}
