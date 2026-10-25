// (C) 2026 GoodData Corporation

import { type IReport } from "../../typings/report.js";

/**
 * The report domain owns the report-lifecycle leaves of the `report` branch: the four flags
 * (`saving`, `savingAsNew`, `opening`, `nowOpen`), the open-failure `loadingError` and the
 * `lastSavedObject` the save button compares against.
 *
 * `report` is a SHARED container with the execution slice (`report.execution`), so each leaf is its
 * own entry of the report-level combineReducers.
 *
 * External writers:
 * - the application resets, matcher cases on the slices (application_reset_events.ts), write
 *   `nowOpen`, `opening` and `lastSavedObject`;
 * - the execution coordination event closes a just-opened report (`nowOpen = false`) when the
 *   finished result belongs to the CURRENT execution — the guard reads `report.execution.id`, which
 *   a mini-slice holding one boolean cannot see.
 *
 * Time travel is NOT one of them: the undo history does not capture the `report` branch at all, so
 * `lastSavedObject` is never restored (store/_infra/time_travel_state.ts).
 */

export type IReportSavingState = boolean;
export const reportSavingInitialState: IReportSavingState = false;

export type IReportSavingAsNewState = boolean;
export const reportSavingAsNewInitialState: IReportSavingAsNewState = false;

export type IReportOpeningState = boolean;
export const reportOpeningInitialState: IReportOpeningState = false;

export type IReportNowOpenState = boolean;
export const reportNowOpenInitialState: IReportNowOpenState = false;

/**
 * `null` when there is no error: a slice cannot return undefined for a non-draftable state.
 * `getReportLoadingError` converts the null back to undefined, so the `!== undefined` readers are
 * unaffected — nothing may read this leaf raw.
 */
/**
 * Why the loading-error VALUE type lives here rather than on the action that carries it: the root
 * type (store/types.ts) names every domain state, so a state module must be a LEAF. While
 * `OpenReportError` was declared in `actions/open_actions.ts`, this module imported the whole action
 * module and closed `store/types -> report_state -> open_actions -> ... -> selectors -> store/types`
 * — a reducer-module import cycle, which `rushx validate` (dependency-cruise) rejects. The action
 * imports the type from here.
 */
export type OpenReportError = "incorrectMetadata";

export type IReportLoadingErrorState = OpenReportError | null;
export const reportLoadingErrorInitialState: IReportLoadingErrorState = null;

/**
 * The save/compare currency of the MD-object family (`models/metadata.ts`, `prepareForComparison`,
 * `getNewReportMDObject`). The slice reducers guard the write with an explicit deep-equality check
 * (report_slices.ts), so an identical re-save does not dirty the branch.
 */
export type IReportLastSavedObjectState = IReport;
export const lastSavedObjectInitialState: IReportLastSavedObjectState = {
    visualizationObject: {
        meta: {
            title: "",
            category: "visualizationObject",
            summary: "",
        },
        content: null,
    },
};
