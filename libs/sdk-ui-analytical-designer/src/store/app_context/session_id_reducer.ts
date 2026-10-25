// (C) 2026 GoodData Corporation

import { type Action } from "redux";

import {
    type IBootstrapDataAction,
    type IRefreshSessionIdAction,
} from "../../actions/app_context_actions.js";
import { ActionTypeKeys } from "../../constants/actions.js";

import { insightContentResetCarrierOf, isInsightContentResetEvent } from "./application_reset_events.js";

/**
 * `appState.sessionId` — THE SINGLE OWNER of the key.
 *
 * Every fresh id is generated at the DISPATCH BOUNDARY and arrives on the action — the
 * `bootstrapData`/`refreshSessionId` prepare callbacks and the reset carriers
 * (application_reset_events.ts) all carry one — so this reducer stays pure (no in-reducer
 * `uuid()`).
 *
 * `undefined` means "no bootstrap yet". The combined root mounts the leaf through
 * `nullableLeaf`, which stores that as `null`; `getAppSessionId` converts back to `undefined`,
 * the shape every consumer reads.
 *
 * The two action cases are wired by their frozen enum STRING with type-only creator imports on
 * purpose: a value import of actions/app_context_actions.js would drag jquery (a window read at
 * import time) into the reducer graph and break node-env consumers (the app_context_slices rule).
 */
export function sessionIdLeafReducer(state: string | undefined, action: Action): string | undefined {
    switch (action.type) {
        case ActionTypeKeys.BOOTSTRAP_DATA:
            return (action as IBootstrapDataAction).payload.sessionId;
        case ActionTypeKeys.STORE_REFRESH_SESSION_ID:
            return (action as IRefreshSessionIdAction).payload.sessionId;
        default:
            break;
    }

    if (isInsightContentResetEvent(action)) {
        return insightContentResetCarrierOf(action).sessionId;
    }

    return state;
}
