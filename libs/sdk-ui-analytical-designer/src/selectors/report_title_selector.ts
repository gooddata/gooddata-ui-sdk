// (C) 2007-2026 GoodData Corporation

import { createSelector } from "reselect";

import { getIsReadOnlyMode } from "../store/embedding/embedding_selectors.js";
import { getInsightSummary, getInsightTitle } from "../store/insight/insight_selectors.js";
import { type IAppState } from "../store/types.js";

import { isEnabledInsightUsageOnDashboards, isReportLockedSelector } from "./report_selector.js";
import { isSaveDisabledSelector } from "./save_report_selector.js";

export const currentReportTitle = (state: IAppState): string => getInsightTitle(state);
export const currentReportDescription = (state: IAppState): string => getInsightSummary(state);
export const hasDefinedTitle = (state: IAppState): boolean => getInsightTitle(state) !== "";

export const reportTitleSelector = createSelector(
    currentReportTitle,
    currentReportDescription,
    hasDefinedTitle,
    isReportLockedSelector,
    isEnabledInsightUsageOnDashboards,
    isSaveDisabledSelector,
    getIsReadOnlyMode,
    (
        currentTitle,
        currentDescription,
        isTitleDefined,
        isReportLocked,
        isEnabledUsages,
        isSaveDisabled,
        isReadOnlyMode,
    ) => ({
        currentTitle,
        currentDescription,
        isTitleDefined,
        isReportLocked,
        canEditTitle: !isReadOnlyMode && !isReportLocked,
        isEnabledUsages,
        isSaveDisabled: isReadOnlyMode || isSaveDisabled,
    }),
);
