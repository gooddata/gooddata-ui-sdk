// (C) 2026 GoodData Corporation

/**
 * `filterBarAutoOpen` — the local identifier of the filter whose picker the filter bar opens right
 * after the user added it, or `null` when no such hand-over is pending.
 *
 * A ONE-SHOT UI reaction to a single add gesture: the add saga writes it, the filter bar list clears
 * it as soon as the filter's item has taken it over. It is `null` rather than `undefined` because
 * createSlice cannot self-initialize from undefined; the selector boundary
 * (selectors/filter_bar_auto_open_selector.ts) converts back to undefined.
 *
 * Deliberately NON-UNDOABLE (store/_infra/time_travel.ts NON_UNDOABLE_ROOT_KEYS): the add's
 * snapshot must not carry a pending hand-over back into an undone state, and a redo that re-adds
 * the filter must not reopen its picker.
 */
export type IFilterBarAutoOpenState = string | null;

export const filterBarAutoOpenInitialState: IFilterBarAutoOpenState = null;
