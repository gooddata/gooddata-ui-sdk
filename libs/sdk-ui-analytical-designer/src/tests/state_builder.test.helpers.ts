// (C) 2026 GoodData Corporation

import { type IAppState } from "../store/types.js";

/**
 * TYPED root-state patching for test fixtures.
 *
 * A fixture needs to say "the pristine state, but with these buckets", and these helpers are the
 * whole surface for it — each one a single spread:
 *
 * ```ts
 * withData(getInitializedState(), { buckets, bucketsMeta })
 * withReport(state, { saving: true })
 * ```
 *
 * `Partial<...>` over the REAL branch type, so an unknown key and a wrong-typed value are both
 * compile errors and a renamed branch key breaks every fixture that writes it. There is no
 * addressing: the branch is chosen by which function you call, and no `any` anywhere in the
 * signature.
 *
 * TEST-ONLY, and named so — production writes go through the owning slice.
 *
 * For a write BELOW a branch's leaf — inside a bucket, inside a bucket item — compose with the
 * value-level builders, which patch a DOMAIN VALUE and know nothing about the root
 * (`buckets_builder.test.helpers.ts`, `extended_reference_point_builder.test.helpers.ts`,
 * `report_builder.test.helpers.ts`):
 *
 * ```ts
 * withData(state, { buckets: withBucketItems(state.data.buckets, 0, items) })
 * ```
 */

/**
 * IDENTITY is preserved: a patch whose every value is already the identical reference returns the
 * SAME state. Not an optimization — the suites assert `expect(write(state)).toBe(state)`, and a
 * patcher that rebuilt the object unconditionally would make every no-op look like a write.
 */
const unchanged = <T extends object>(current: T, patch: Partial<T>): boolean =>
    (Object.keys(patch) as (keyof T)[]).every((k) => current[k] === patch[k]);

export const withRoot = (state: IAppState, patch: Partial<IAppState>): IAppState =>
    unchanged(state, patch) ? state : { ...state, ...patch };

export const withAppState = (state: IAppState, patch: Partial<IAppState["appState"]>): IAppState =>
    unchanged(state.appState, patch) ? state : { ...state, appState: { ...state.appState, ...patch } };

/** `appState.meta` — the shared embedded-context container. */
export const withMeta = (state: IAppState, patch: Partial<IAppState["appState"]["meta"]>): IAppState =>
    unchanged(state.appState.meta, patch)
        ? state
        : { ...state, appState: { ...state.appState, meta: { ...state.appState.meta, ...patch } } };

export const withData = (state: IAppState, patch: Partial<IAppState["data"]>): IAppState =>
    unchanged(state.data, patch) ? state : { ...state, data: { ...state.data, ...patch } };

/** `data.shortcut` — the shortcut date datasets plus the parked dropped item. */
export const withShortcut = (state: IAppState, patch: Partial<IAppState["data"]["shortcut"]>): IAppState =>
    unchanged(state.data.shortcut, patch)
        ? state
        : { ...state, data: { ...state.data, shortcut: { ...state.data.shortcut, ...patch } } };

export const withReport = (state: IAppState, patch: Partial<IAppState["report"]>): IAppState =>
    unchanged(state.report, patch) ? state : { ...state, report: { ...state.report, ...patch } };
