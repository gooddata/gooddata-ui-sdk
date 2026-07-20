// (C) 2026 GoodData Corporation

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IMeasureMetadataObjectDefinition, idRef, isMeasureMetadataObject } from "@gooddata/sdk-model";

import type { IAsCodeMutationPort } from "../asCode/descriptor.js";
import { convertMeasureToCatalogItem } from "../catalogItem/converter.js";
import {
    createMeasureCatalogItem,
    deleteMeasureCatalogItem,
    getMeasureCatalogItem,
    getMeasureReferencingObjectsCatalogItem,
    updateMeasureCatalogItem,
} from "../catalogItem/query.js";
import type { ICatalogItemMeasure } from "../catalogItem/types.js";

import { overlayMetricYamlFields } from "./metricConverter.js";

/**
 * A metric loads its full measure before editing (the catalog item carries no MAQL) and always
 * supports the optional `load`/`getReferencingObjectsCount` capabilities — hence `Required`.
 * @internal
 */
export type IMetricMutationPort = Required<
    IAsCodeMutationPort<IMeasureMetadataObjectDefinition, ICatalogItemMeasure>
>;

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
        async update(base, definition) {
            // The measures endpoint is a full replace, so overlay the YAML-owned fields onto the loaded
            // measure to carry over what the YAML cannot express (metricType, isHiddenFromKda, identity).
            // `base` must be the persisted measure `load` returned — a bare definition (no server-managed
            // `ref`) would silently drop those fields, so reject it loudly rather than corrupt the update.
            if (!isMeasureMetadataObject(base)) {
                throw new Error("Metric update requires the loaded measure as base, not a bare definition.");
            }
            const savedMeasure = await updateMeasureCatalogItem(
                backend,
                workspace,
                overlayMetricYamlFields(base, definition),
            );
            return convertMeasureToCatalogItem(savedMeasure);
        },
        async delete(ref) {
            await deleteMeasureCatalogItem(backend, workspace, idRef(ref.identifier, "measure"));
        },
        async load(item) {
            return getMeasureCatalogItem(backend, workspace, idRef(item.identifier, "measure"));
        },
        async getReferencingObjectsCount(item) {
            const referencing = await getMeasureReferencingObjectsCatalogItem(
                backend,
                workspace,
                idRef(item.identifier, "measure"),
            );
            return (referencing.insights?.length ?? 0) + (referencing.measures?.length ?? 0);
        },
    };
}
