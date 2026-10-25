// (C) 2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import {
    type IMetricOverTimeShortcutApplyResult,
    type IMetricShortcutApplyResult,
    type IShortcutPostponedResult,
} from "./shortcuts_operations.js";

/**
 * THE SEMANTIC EVENTS OF THE SHORTCUTS FAMILY — same contract as
 * `buckets_operation_events.ts`: the payload is the operation's RESULT, carried unconditionally,
 * unchanged values arriving by reference. The type strings are NEW and stay out of the
 * frozen `ActionTypeKeys`; deliberately NOT undoable — time travel keys on the
 * `SHORTCUT_APPLY_*` triggers, which still reach the store first.
 */
export enum ShortcutsOperationActionTypeKeys {
    STORE_METRIC_SHORTCUT_APPLIED = "STORE/SHORTCUTS/METRIC_SHORTCUT_APPLIED",
    STORE_METRIC_OVER_TIME_SHORTCUT_APPLIED = "STORE/SHORTCUTS/METRIC_OVER_TIME_SHORTCUT_APPLIED",
    STORE_SHORTCUT_POSTPONED = "STORE/SHORTCUTS/SHORTCUT_POSTPONED",
}

/**
 * A metric drop landed in MEASURES — the direct drop on a column chart and the postponed replay
 * (`SHORTCUT_APPLY_METRIC`, `SHORTCUT_APPLY_METRIC_POSTPONED`), which are two triggers over one
 * operation. Clears the dropped item and the parked action.
 */
export const metricShortcutApplied = createAction(
    ShortcutsOperationActionTypeKeys.STORE_METRIC_SHORTCUT_APPLIED,
    (payload: IMetricShortcutApplyResult) => ({ payload }),
);

/**
 * A metric-over-time drop landed (`SHORTCUT_APPLY_METRIC_OVER_TIME`, `..._POSTPONED`): VIEW emptied,
 * the metric in MEASURES, the shortcut date datasets copied across into `data.dateDatasets`, a date
 * item ensured in the trend bucket at the default granularity, and the date filter on the default
 * preset.
 */
export const metricOverTimeShortcutApplied = createAction(
    ShortcutsOperationActionTypeKeys.STORE_METRIC_OVER_TIME_SHORTCUT_APPLIED,
    (payload: IMetricOverTimeShortcutApplyResult) => ({ payload }),
);

/**
 * A metric drop on a non-column chart PARKED its replay action and switched the chart to the
 * workspace's column class — the postpone branch of both shortcuts. The buckets are untouched; the
 * replay saga re-puts the parked action once the pluggable visualization has answered for the new
 * type (postponed_action_sagas.ts).
 */
export const shortcutPostponed = createAction(
    ShortcutsOperationActionTypeKeys.STORE_SHORTCUT_POSTPONED,
    (payload: IShortcutPostponedResult) => ({ payload }),
);
