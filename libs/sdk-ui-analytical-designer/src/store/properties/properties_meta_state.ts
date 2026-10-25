// (C) 2026 GoodData Corporation

/**
 * `data.propertiesMeta` — the flag bag a pluggable visualization pushes back about the
 * properties it just applied. Fully plain.
 *
 * The keys are open-ended by design: they come from `pushData({ propertiesMeta })` in
 * sdk-ui-ext, and AD only reads a handful of them (`undoApplied`,
 * `stackToPercentDisabledByNegativeValues`, `isGeoSegmentConflictRecommended`,
 * `isFilteringRecommended`).
 *
 * `undoApplied` is NOT written by this slice: the time-travel wrapper (store/_infra/time_travel.ts)
 * sets it on every undo/redo.
 *
 * The two other external writers are the open-report case (which clears the bag when an insight is
 * opened) and the application resets — both slice cases.
 */
export interface IPropertiesMetaState {
    undoApplied?: boolean;
    stackToPercentDisabledByNegativeValues?: boolean;
    isGeoSegmentConflictRecommended?: boolean;
    isFilteringRecommended?: boolean;
    [key: string]: unknown;
}

export const propertiesMetaInitialState: IPropertiesMetaState = {};
