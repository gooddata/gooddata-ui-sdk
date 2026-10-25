// (C) 2026 GoodData Corporation

import { type IAppState } from "../types.js";

import { type IReportLastSavedObjectState, type OpenReportError } from "./report_state.js";

const reportSavingState = (state: IAppState) => state.report.saving;
const reportSavingAsNewState = (state: IAppState) => state.report.savingAsNew;
const reportOpeningState = (state: IAppState) => state.report.opening;
const reportNowOpenState = (state: IAppState) => state.report.nowOpen;
const reportLoadingErrorState = (state: IAppState) => state.report.loadingError;
const lastSavedObjectState = (state: IAppState) => state.report.lastSavedObject;

export const isReportSaving = (state: IAppState): boolean => reportSavingState(state);

export const isReportSavingAsNew = (state: IAppState): boolean => reportSavingAsNewState(state);

export const isReportOpening = (state: IAppState): boolean => reportOpeningState(state);

export const isReportNowOpen = (state: IAppState): boolean => reportNowOpenState(state);

/**
 * The domain's ONE way to ask for the open-failure error. The slice stores `null` for "no
 * error" (a non-draftable state cannot be undefined — report_state.ts); this accessor converts it
 * back to `undefined`, because the readers test `!== undefined` / `=== undefined` and
 * `null !== undefined` would flip both — an error screen over a perfectly healthy report. Nothing
 * may read the leaf raw.
 */
export const getReportLoadingError = (state: IAppState): OpenReportError | undefined =>
    reportLoadingErrorState(state) ?? undefined;

/**
 * The last saved visualization object (report_state.ts). On the pristine post-reset state the leaf
 * is absent and the initial value answers, so the child reads (`meta.title` = "", `content` = null)
 * are safe there.
 */
export const getLastSavedObject = (state: IAppState): IReportLastSavedObjectState =>
    lastSavedObjectState(state);
