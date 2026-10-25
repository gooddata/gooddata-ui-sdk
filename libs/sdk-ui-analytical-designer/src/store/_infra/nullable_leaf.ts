// (C) 2026 GoodData Corporation

import { type Action } from "redux";

/**
 * Mounts a reducer over a value that is genuinely OPTIONAL — a parked item, the extended
 * reference point before a pluggable visualization answers, the route before the first
 * navigation — under redux's strict `combineReducers`, which rejects `undefined` as a reducer
 * return.
 *
 * The domain reducer keeps its natural contract: `undefined` means "not there", and several of
 * its writers carry an optional payload field with exactly that meaning. At rest the store holds
 * `null` instead, and the domain's input selector converts back (`?? undefined`), so no consumer
 * ever sees the difference. Doing the conversion here — one choke point per mount — is what makes
 * "never `undefined` in the store" structural: a new case in the domain reducer cannot forget it.
 *
 * Identity is preserved both ways: an unchanged value comes back by reference, and `null` stays
 * `null`, so the combiner's change detection sees a no-op as a no-op.
 */
export function nullableLeaf<S, A extends Action>(
    reducer: (state: S | undefined, action: A) => S | undefined,
): (state: S | null | undefined, action: A) => S | null {
    return (state, action) => reducer(state ?? undefined, action) ?? null;
}
