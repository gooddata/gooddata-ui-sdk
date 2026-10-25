// (C) 2007-2026 GoodData Corporation

import { type Action } from "redux";

import { ActionTypeKeys } from "../constants/actions.js";
import { type RootReducer, withTimeTravel } from "../store/_infra/time_travel.js";
import { type IAppState } from "../store/types.js";

import { combinedRootReducer } from "./combined_root_reducer.js";

/**
 * The root reducer: the strictly-combined core (combined_root_reducer.ts) wrapped by the TWO
 * sanctioned pieces of whole-root infrastructure — the time-travel higher-order reducer (a
 * snapshot is by definition a projection of the whole root) and the pluggable-mount reset below
 * (a fresh pristine root is by definition not any slice's business). Everything else owns
 * exactly one key inside the core.
 *
 * TIME TRAVEL stays outermost and runs its transition FIRST (store/_infra/time_travel.ts): a
 * snapshot is the state as it was BEFORE the edit landed, and an undo hands the restored state
 * down to the combined core.
 */
const withPluggableMountReset =
    (inner: RootReducer): RootReducer =>
    (state: IAppState | undefined, action: Action): IAppState => {
        if (state === undefined || action.type === ActionTypeKeys.RESET_FOR_PLUGGABLE_MOUNT) {
            // a FRESH pristine state per store init and per pluggable reset: the combined core
            // self-initializes every owned key (including an empty `timeTravel` history), and the
            // root must never be a shared singleton — one mount's mutation would leak into the next
            return inner(undefined, action);
        }
        return inner(state, action);
    };

export const rootReducer: RootReducer = withTimeTravel(withPluggableMountReset(combinedRootReducer));
