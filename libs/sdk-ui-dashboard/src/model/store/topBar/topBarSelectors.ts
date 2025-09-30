// (C) 2021-2025 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import { selectSupportsCrossFiltering } from "../backendCapabilities/backendCapabilitiesSelectors.js";
import {
    selectEnableAutomationManagement,
    selectEnableDashboardShareDialogLink,
    selectEnableFilterViews,
    selectEnableKDCrossFiltering,
    selectEnableKPIDashboardExportPDF,
    selectEnableKPIDashboardSaveAsNew,
    selectEnableSlideshowExports,
    selectIsExport,
    selectIsReadOnly,
    selectIsSaveAsNewButtonHidden,
    selectIsShareButtonHidden,
    selectIsWhiteLabeled,
} from "../config/configSelectors.js";
import {
    selectCanEditDashboardPermission,
    selectCanEditLockedDashboardPermission,
    selectCanShareDashboardPermission,
    selectCanShareLockedDashboardPermission,
} from "../dashboardPermissions/dashboardPermissionsSelectors.js";
import { selectEntitlementExportPdf } from "../entitlements/entitlementsSelectors.js";
import { selectIsLayoutEmpty } from "../layout/layoutSelectors.js";
import { selectListedDashboardsMap } from "../listedDashboards/listedDashboardsSelectors.js";
import { selectIsDashboardLoading } from "../loading/loadingSelectors.js";
import {
    selectDashboardLockStatus,
    selectDashboardRef,
    selectDisableFilterViews,
    selectIsDashboardDirty,
    selectIsDashboardPrivate,
    selectIsNewDashboard,
} from "../meta/metaSelectors.js";
import {
    selectCanCreateAnalyticalDashboard,
    selectCanExportPdf,
} from "../permissions/permissionsSelectors.js";
import { selectIsInEditMode, selectIsInViewMode } from "../renderMode/renderModeSelectors.js";
import { DashboardSelector, DashboardState } from "../types.js";
import { selectMenuButtonItemsVisibility } from "../ui/uiSelectors.js";

/**
 * @internal
 */
export const selectCanEnterEditMode: DashboardSelector<boolean> = createSelector(
    selectCanEditDashboardPermission,
    selectCanEditLockedDashboardPermission,
    selectDashboardLockStatus,
    selectIsReadOnly,
    (canEditDashboardPermission, hasEditLockedDashboardPermission, isLocked, isReadOnly) =>
        !isReadOnly && canEditDashboardPermission && (!isLocked || hasEditLockedDashboardPermission),
);

/**
 * @internal
 */
export const selectCanEnterEditModeAndIsLoaded: DashboardSelector<boolean> = createSelector(
    selectIsDashboardLoading,
    selectCanEnterEditMode,
    (isLoading, canEnterEditMode) => !isLoading && canEnterEditMode,
);

/**
 * @internal
 */
export const selectIsPrivateDashboard: DashboardSelector<boolean> = createSelector(
    selectIsDashboardPrivate,
    selectIsNewDashboard,
    (isPrivate, isCreatingNewDashboard) => isCreatingNewDashboard || isPrivate,
);

/**
 * @internal
 */
export function selectCanSaveDashboard(state: DashboardState) {
    return selectIsNewDashboard(state) ? !selectIsLayoutEmpty(state) : selectIsDashboardDirty(state);
}

/**
 * @internal
 */
export const selectIsCurrentDashboardVisibleInList: DashboardSelector<boolean> = createSelector(
    selectDashboardRef,
    selectListedDashboardsMap,
    (currentDashboardRef, dashboardsList) =>
        Boolean(currentDashboardRef && dashboardsList.has(currentDashboardRef)),
);

/**
 * @internal
 */
export const selectCrossFilteringEnabledAndSupported: DashboardSelector<boolean> = createSelector(
    selectIsInEditMode,
    selectEnableKDCrossFiltering,
    selectSupportsCrossFiltering,
    (isEdit, enableCrossFiltering, supportsCrossFiltering) => {
        return isEdit && enableCrossFiltering && supportsCrossFiltering;
    },
);

export const selectHasSharePermissions: DashboardSelector<boolean> = createSelector(
    selectCanShareDashboardPermission,
    selectCanShareLockedDashboardPermission,
    selectDashboardLockStatus,
    (canShareDashboardPermission, canShareLockedDashboardPermission, isLocked) =>
        canShareDashboardPermission && (!isLocked || canShareLockedDashboardPermission),
);

/**
 *
 * @internal
 */
export const selectIsShareGrantVisible: DashboardSelector<boolean> = createSelector(
    selectEnableDashboardShareDialogLink,
    selectHasSharePermissions,
    (enableDashboardShareDialogLink, hasSharePermissions) =>
        // If dashboardShareDialogLink feature is disabled always show grant options.
        // Otherwise decide based on user share permissions
        !enableDashboardShareDialogLink || hasSharePermissions,
);

/**
 *
 * @internal
 */
export const selectIsDashboardShareLinkVisible: DashboardSelector<boolean> = createSelector(
    selectEnableDashboardShareDialogLink,
    selectIsWhiteLabeled,
    (enableDashboardShareDialogLink, isWhiteLabeled) => enableDashboardShareDialogLink && !isWhiteLabeled,
);

/**
 * @internal
 */
export const selectIsShareButtonVisible: DashboardSelector<boolean> = createSelector(
    selectHasSharePermissions,
    selectIsCurrentDashboardVisibleInList,
    selectIsReadOnly,
    selectIsInEditMode,
    selectIsShareButtonHidden,
    selectEnableDashboardShareDialogLink,
    selectIsWhiteLabeled,
    (
        hasSharePermissions,
        isCurrentDashboardVisibleInList,
        isReadOnly,
        isInEditMode,
        isShareButtonHidden,
        enableDashboardShareDialogLink,
        isWhiteLabeled,
    ) =>
        // If dashboardShareDialogLink feature is enabled, show share button regardless of user share permissions
        ((enableDashboardShareDialogLink && !isWhiteLabeled) || hasSharePermissions) &&
        isCurrentDashboardVisibleInList &&
        !isReadOnly &&
        !isInEditMode &&
        !isShareButtonHidden,
);

/**
 * @internal
 */
export function selectIsAutomationDialogSecondaryTitleVisible(state: DashboardState) {
    return selectEnableAutomationManagement(state);
}

/**
 * @internal
 */
export const selectIsSaveAsNewButtonVisible: DashboardSelector<boolean> = createSelector(
    selectEnableKPIDashboardSaveAsNew,
    selectIsSaveAsNewButtonHidden,
    selectCanEnterEditModeAndIsLoaded,
    selectCanCreateAnalyticalDashboard,
    selectIsExport,
    selectIsReadOnly,
    (
        isSaveAsNewEnabled,
        isSaveAsButtonHidden,
        isDashboardEditable,
        canCreateDashboard,
        isExport,
        isReadOnly,
    ) => {
        /*
         * The reasoning behind this condition is as follows. Do not show separate Save As button if:
         *
         *
         * 1.  The feature is not enabled or
         * 2.  If is disabled by config
         * 3.  If the dashboard can be edited; in this case, the save as option is part of the dropdown menu;
         *     it is somewhat more hidden
         * 4.  dashboard is not in export mode
         * 5.  If the user cannot create dashboards - e.g. does not have permissions to do so (is viewer for example).
         * 6.  If the dashboard is in read-only mode.
         */
        return (
            isSaveAsNewEnabled &&
            !isSaveAsButtonHidden &&
            !isDashboardEditable &&
            !isExport &&
            canCreateDashboard &&
            !isReadOnly
        );
    },
);

/**
 * Selects whether the common export is available.
 *
 * @internal
 */
export const selectCommonExportAvailable: DashboardSelector<boolean> = createSelector(
    selectIsInViewMode,
    selectCanExportPdf,
    (isInViewMode, canExport) => {
        return isInViewMode && canExport;
    },
);

/**
 * Selects whether the slideshow export is available.
 *
 * @internal
 */
export const selectSlideShowExportAvailable: DashboardSelector<boolean> = createSelector(
    selectCommonExportAvailable,
    selectEnableSlideshowExports,
    (canExport, isSlideshowExportsEnabled) => {
        return canExport && isSlideshowExportsEnabled;
    },
);

/**
 * Selects whether the slideshow export is visible.
 *
 * @internal
 */
export const selectSlideShowExportVisible: DashboardSelector<boolean> = createSelector(
    selectSlideShowExportAvailable,
    selectMenuButtonItemsVisibility,
    (isSlideshowExportsAvailable, menuButtonItemsVisibility) => {
        return (
            isSlideshowExportsAvailable &&
            (menuButtonItemsVisibility.pdfExportButton ??
                menuButtonItemsVisibility.excelExportButton ??
                menuButtonItemsVisibility.powerPointExportButton ??
                true)
        );
    },
);

/**
 * Selects whether the PDF export is visible.
 *
 * @internal
 */
export const selectPdfExportVisible: DashboardSelector<boolean> = createSelector(
    selectCommonExportAvailable,
    selectEnableKPIDashboardExportPDF,
    selectEntitlementExportPdf,
    selectMenuButtonItemsVisibility,
    (canExport, isKPIDashboardExportPDFEnabled, isExportPdfEntitlementPresent, menuButtonItemsVisibility) => {
        return (
            canExport &&
            !!isKPIDashboardExportPDFEnabled &&
            !!isExportPdfEntitlementPresent &&
            (menuButtonItemsVisibility.pdfExportButton ?? true)
        );
    },
);

/**
 * Selects whether the save as new button is visible.
 *
 * @internal
 */
export const selectSaveAsVisible: DashboardSelector<boolean> = createSelector(
    selectIsSaveAsNewButtonVisible,
    selectCanCreateAnalyticalDashboard,
    selectIsSaveAsNewButtonHidden,
    selectMenuButtonItemsVisibility,
    (
        isStandaloneSaveAsNewButtonVisible,
        canCreateDashboard,
        isSaveAsNewHidden,
        menuButtonItemsVisibility,
    ) => {
        return (
            !isStandaloneSaveAsNewButtonVisible &&
            canCreateDashboard &&
            !isSaveAsNewHidden &&
            (menuButtonItemsVisibility.saveAsNewButton ?? true)
        );
    },
);

/**
 * Selects whether the settings button is visible.
 *
 * @internal
 */
export const selectSettingsVisible: DashboardSelector<boolean> = createSelector(
    selectIsInEditMode,
    selectMenuButtonItemsVisibility,
    (isInEditMode, menuButtonItemsVisibility) => {
        return isInEditMode && (menuButtonItemsVisibility.settingsButton ?? true);
    },
);

/**
 * Selects whether the delete button is visible.
 *
 * @internal
 */
export const selectDeleteVisible: DashboardSelector<boolean> = createSelector(
    selectIsInEditMode,
    selectMenuButtonItemsVisibility,
    (isInEditMode, menuButtonItemsVisibility) => {
        return isInEditMode && (menuButtonItemsVisibility.deleteButton ?? true);
    },
);

/**
 * Selects whether the filter views are visible.
 *
 * @internal
 */
export const selectFilterViewsVisible: DashboardSelector<boolean> = createSelector(
    selectEnableFilterViews,
    selectDisableFilterViews,
    (enableFilterViews, disableFilterViews) => {
        return enableFilterViews && !disableFilterViews;
    },
);
