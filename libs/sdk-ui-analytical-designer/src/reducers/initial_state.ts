// (C) 2007-2026 GoodData Corporation

import { type IAppState } from "../store/types.js";

import { combinedRootReducer } from "./combined_root_reducer.js";

/**
 * The pristine seeds live in the reducers' own initial states — the combined root
 * (combined_root_reducer.ts) self-initializes every owned key, so the pristine state IS the
 * reducer's own default build and there is no separate hand-maintained literal to drift from it.
 * This module remains as the read-only accessor the tests know.
 */
export function buildInitialState(): IAppState {
    return combinedRootReducer(undefined, { type: "@@INIT" });
}

/** Freezes the containers — a mutation of the shared pristine seed must fail loudly. */
function deepFreezePlain<T>(value: T): T {
    if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
        return value;
    }
    Object.freeze(value);
    for (const child of Object.values(value)) {
        deepFreezePlain(child);
    }
    return value;
}

/**
 * READ-ONLY pristine seed — frozen, shared. For reading initial values in tests; never hand it
 * to a live store — that is what {@link buildInitialState} (or simply dispatching into a fresh
 * store) is for.
 */
export const initialState: IAppState = deepFreezePlain(buildInitialState());
