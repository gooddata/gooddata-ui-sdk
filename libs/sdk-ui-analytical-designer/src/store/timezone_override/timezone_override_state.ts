// (C) 2026 GoodData Corporation

/**
 * `timezoneOverride` — the session-only ad-hoc timezone override root leaf.
 *
 * A concrete IANA timezone ID, or `null` when no override is set (the workspace/organization
 * default applies). It is `null` rather than `undefined` because createSlice cannot self-initialize
 * from undefined; the selector boundary (selectors/timezone_override_selectors.ts) converts back to
 * undefined for the readers.
 *
 * Deliberately NON-UNDOABLE (store/_infra/time_travel.ts NON_UNDOABLE_ROOT_KEYS): session UI,
 * never part of the insight.
 */
export type ITimezoneOverrideState = string | null;

export const timezoneOverrideInitialState: ITimezoneOverrideState = null;
