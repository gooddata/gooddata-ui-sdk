// (C) 2007-2026 GoodData Corporation

import { put, select, take, takeEvery } from "redux-saga/effects";

import { ActionTypeKeys } from "../../constants/actions.js";
import { extendedReferencePointApplied } from "../buckets/buckets_operation_events.js";

import { getPostponedAction } from "./postponed_action_selectors.js";

/**
 * Replays the shortcut a metric drop PARKED (store/shortcuts/shortcuts_apply_reducer.ts): applying
 * a metric shortcut on a non-column visualization first switches the chart type and waits for the
 * pluggable visualization to answer with an extended reference point, then adds the item.
 *
 * The parked value IS the action, so this re-puts it VERBATIM — the replayed handler must see
 * exactly what a real drag would hand it. The parked action is cleared by the handler that consumes
 * it.
 */
export function* dispatchPostponedAction() {
    const postponedAction: ReturnType<typeof getPostponedAction> = yield select(getPostponedAction);
    if (postponedAction) {
        // THE REPLAY GOES ON TOP OF THE APPLIED REFERENCE POINT, and that has to be said
        // out loud. `EXTENDED_REFERENCE_POINT_CHANGED` is an operation, so its answer is
        // already in `data.buckets` by the time any saga saw the action; now it is an operation that
        // commits `extendedReferencePointApplied` in a LATER dispatch, and that event OVERWRITES the
        // buckets with the value the plug viz computed — which does not contain the item this replay is
        // about to add. Putting the replay first therefore added the item and then threw it away (the
        // single-metric and metric-over-time canvas shortcuts added nothing at all).
        //
        // Waiting for the commit makes the dependency local and independent of watcher registration
        // order. `handleExtendedReferencePointChanged` has no bail-out branch, so the event always comes.
        yield take(extendedReferencePointApplied.type);

        yield put(postponedAction);
    }
}

export function* watchDispatchPostponedAction() {
    yield takeEvery(ActionTypeKeys.EXTENDED_REFERENCE_POINT_CHANGED, dispatchPostponedAction);
}
