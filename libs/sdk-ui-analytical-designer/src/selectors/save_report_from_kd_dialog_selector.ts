// (C) 2020-2026 GoodData Corporation

import { createSelector } from "reselect";

import { getDialogsState } from "../store/dialogs/dialogs_selectors.js";
import { getInsightTitle } from "../store/insight/insight_selectors.js";
import { getInsightUsageOnDashboardsSelector } from "../store/insight_usage/insight_usage_selectors.js";
import { type IAppState } from "../store/types.js";

import { canCreateNewVisualization, canManageProject } from "./permissions_selector.js";
import { getLastSavedReportTitle, isReportLockedSelector } from "./report_selector.js";
import { getSourceDashboardId, isAllowedDashboardLinks } from "./route_selector.js";
import { analyticalDashboardUriFactorySelector } from "./uri_selector.js";

const getOpenSaveReportFromKDDialog = createSelector(
    getDialogsState,
    (dialogs) => dialogs.openSaveReportFromKD.active,
);

const getEditingReportTitle = (state: IAppState) => {
    const currentTitle = getInsightTitle(state);
    const originalTitle = getLastSavedReportTitle(state);
    return currentTitle || originalTitle;
};

export const dashboardItemSelector = createSelector(
    getSourceDashboardId,
    isAllowedDashboardLinks,
    analyticalDashboardUriFactorySelector,
    (sourceDashboardId, isAllowLinkToDashboard, analyticalDashboardUriFactory) => ({
        sourceDashboardId,
        isAllowLinkToDashboard,
        analyticalDashboardUriFactory,
    }),
);

export const saveReportFromKDDialogSelector = createSelector(
    getInsightUsageOnDashboardsSelector,
    getOpenSaveReportFromKDDialog,
    getEditingReportTitle,
    isReportLockedSelector,
    canManageProject,
    canCreateNewVisualization,

    (
        insightUsedOnDashboards,
        openSaveReportFromKD,
        editingReportTitle,
        isReportLocked,
        canManageProject,
        canCreateCopy,
    ) => ({
        insightUsedOnDashboards,
        openSaveReportFromKD,
        editingReportTitle,
        canCreateCopy,
        // locked reports are inherited from parent workspace and cannot be modified by anyone
        isSaveAsNewReportOnly: isReportLocked || (!canManageProject && isReportLocked),
    }),
);
