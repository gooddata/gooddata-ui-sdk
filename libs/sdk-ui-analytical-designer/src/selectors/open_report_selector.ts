// (C) 2007-2026 GoodData Corporation

import { createSelector } from "reselect";

import { isReportOpening, isReportSaving } from "../store/report/report_selectors.js";
import { type IAppState } from "../store/types.js";

export const isReportOpeningSelector = (state: IAppState): boolean => isReportOpening(state);

export const isReportSavingSelector = (state: IAppState): boolean => isReportSaving(state);

export const canOpenReport = createSelector(
    isReportOpeningSelector,
    isReportSavingSelector,

    (isReportOpening, isReportSaving) => !isReportOpening && !isReportSaving,
);
