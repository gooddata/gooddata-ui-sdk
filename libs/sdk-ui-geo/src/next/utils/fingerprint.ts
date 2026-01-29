// (C) 2025-2026 GoodData Corporation

import type { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import type { IBucket } from "@gooddata/sdk-model";
import type { DataViewFacade } from "@gooddata/sdk-ui";

import type { ILayerExecutionRecord } from "../types/props/geoChart/internal.js";

/**
 * Sentinel value indicating data is not ready for fingerprinting.
 *
 * @internal
 */
export const NOT_READY_FINGERPRINT = "__not_ready__";

/**
 * Creates a fingerprint from a Map of layer IDs to DataViewFacades.
 *
 * @remarks
 * Used to create stable dependency keys for hooks that need to re-run
 * when data view contents change.
 *
 * @param layerDataViews - Map of layer IDs to DataViewFacade instances
 * @param isReady - Whether the data is ready (returns sentinel if false)
 * @returns A stable string fingerprint
 *
 * @internal
 */
export function createDataViewsFingerprint(
    layerDataViews: Map<string, DataViewFacade>,
    isReady: boolean,
): string {
    if (!isReady) {
        return NOT_READY_FINGERPRINT;
    }

    return Array.from(layerDataViews.entries())
        .map(([id, dv]) => `${id}:${dv.fingerprint()}`)
        .join("|");
}

/**
 * Creates a fingerprint from an array of layer executions.
 *
 * @remarks
 * Used to create stable dependency keys for hooks that need to re-run
 * when execution definitions change.
 *
 * @param layerExecutions - Array of objects with execution.fingerprint() method
 * @returns A stable string fingerprint
 *
 * @internal
 */
export function createExecutionsFingerprint(
    layerExecutions: Array<{ execution: { fingerprint(): string } }>,
): string {
    return layerExecutions.map((le) => le.execution.fingerprint()).join("|");
}

/**
 * Creates a fingerprint from a bucket's structure.
 *
 * @remarks
 * Captures the bucket's localIdentifier and the localIdentifiers of its items.
 * This detects when items are moved between buckets (e.g., measure from COLOR to SIZE).
 *
 * @param bucket - The bucket to fingerprint
 * @returns A string representing the bucket's structure
 *
 * @internal
 */
function bucketStructureFingerprint(bucket: IBucket): string {
    const itemIds = bucket.items.map((item) => {
        if ("measure" in item) {
            return `m:${item.measure.localIdentifier}`;
        }
        if ("attribute" in item) {
            return `a:${item.attribute.localIdentifier}`;
        }
        return "unknown";
    });
    return `${bucket.localIdentifier}[${itemIds.join(",")}]`;
}

/**
 * Creates a fingerprint from a single prepared execution's bucket structure.
 *
 * @remarks
 * This is useful when you need a stable dependency key that captures bucket meaning,
 * even in situations where `execution.fingerprint()` might not fully reflect bucket structure.
 *
 * @internal
 */
export function createExecutionBucketsFingerprint(execution: IPreparedExecution): string {
    return execution.definition.buckets.map(bucketStructureFingerprint).join(";");
}

/**
 * Creates a fingerprint from layer execution records that captures bucket structure.
 *
 * @remarks
 * Unlike `createExecutionsFingerprint` which uses the execution fingerprint (based on
 * measures, dimensions, filters), this function captures the bucket structure.
 *
 * This is needed because moving a measure between buckets (e.g., from COLOR to SIZE)
 * doesn't change the execution fingerprint (same measures, same dimensions), but
 * it does change how the data should be interpreted and rendered.
 *
 * @param layerExecutions - Array of layer execution records
 * @returns A stable string fingerprint based on bucket structure
 *
 * @internal
 */
export function createLayersStructureFingerprint(layerExecutions: ILayerExecutionRecord[]): string {
    return layerExecutions
        .map((le) => {
            const buckets = le.execution.definition.buckets;
            const bucketFingerprints = buckets.map(bucketStructureFingerprint).join(";");
            return `${le.layerId}:{${bucketFingerprints}}`;
        })
        .join("|");
}
