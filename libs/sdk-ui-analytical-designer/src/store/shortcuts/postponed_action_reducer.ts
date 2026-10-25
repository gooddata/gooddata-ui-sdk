// (C) 2026 GoodData Corporation

import { type Action } from "redux";

import { type IPostponedActionState } from "./postponed_action_state.js";
import {
    metricOverTimeShortcutApplied,
    metricShortcutApplied,
    shortcutPostponed,
} from "./shortcuts_operation_events.js";

/**
 * `data.postponedAction` — the READY-MADE replay action a canvas metric drop parks while the chart
 * switches to a column (store/shortcuts/postponed_action_state.ts).
 *
 * Hand-written rather than `createSlice`, for the same reason as the extended-reference-point leaf
 * (buckets_operation_leaves.ts): the parked value IS an action the replay saga re-puts verbatim
 * into `dispatch`, and immer's development-build deep freeze on a drafted return would turn any
 * in-place write downstream of that dispatch into a hard throw.
 *
 * `undefined` means nothing is parked; both applies CLEAR it. The combined root mounts the leaf
 * through `nullableLeaf`, which stores that as `null` and hands `undefined` back in.
 */
export function postponedActionLeafReducer(
    state: IPostponedActionState | undefined,
    action: Action,
): IPostponedActionState | undefined {
    if (shortcutPostponed.match(action)) {
        return action.payload.postponedAction;
    }
    if (metricShortcutApplied.match(action)) {
        return action.payload.postponedAction;
    }
    if (metricOverTimeShortcutApplied.match(action)) {
        return action.payload.postponedAction;
    }

    return state;
}
