// (C) 2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type IVisualizationPropertiesChangeResult } from "./properties_operation.js";

/**
 * THE SEMANTIC EVENT OF THE PROPERTIES FAMILY — the same contract as
 * `buckets_operation_events.ts`: the payload is the operation's RESULT, carried unconditionally,
 * with unchanged values arriving by reference so every consuming case short-circuits.
 *
 * NOT to be confused with `actions/properties_actions.ts#visualizationPropertiesChanged`, the
 * frozen UI trigger (`UI_VIS_PROPERTIES_CHANGED`) a pluggable visualization dispatches and time
 * travel snapshots on. That one REPORTS a change; this one COMMITS the computed application of it.
 * The type string lives in its own namespace, exactly like the buckets events': only the owning
 * reducers (the properties/buckets/referencePoint slices and the ERP/md-flag leaves) consume it, so
 * keeping it out of `ActionTypeKeys` is what keeps "which strings are frozen behavior" answerable.
 * Deliberately NOT undoable — time travel keys on the UI trigger.
 */
export enum PropertiesOperationActionTypeKeys {
    STORE_VISUALIZATION_PROPERTIES_CHANGED = "STORE/PROPERTIES/VISUALIZATION_PROPERTIES_CHANGED",
}

/**
 * A pluggable visualization's properties push was applied (`STORE_VIS_PROPERTIES_CHANGED`): the
 * stored properties minus the `totals`/`bucketType` riders, the extended reference point's mirror
 * of them, the bucket totals the riders carried — and, only when those landed, the re-synced
 * reference point and the cleared md-object flag (see `properties_operation.ts` for why that is
 * conditional).
 */
export const visualizationPropertiesChanged = createAction(
    PropertiesOperationActionTypeKeys.STORE_VISUALIZATION_PROPERTIES_CHANGED,
    (payload: IVisualizationPropertiesChangeResult) => ({ payload }),
);
