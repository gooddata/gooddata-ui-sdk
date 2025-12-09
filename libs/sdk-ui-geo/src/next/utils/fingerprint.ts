// (C) 2025 GoodData Corporation

import type { DataViewFacade } from "@gooddata/sdk-ui";

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
