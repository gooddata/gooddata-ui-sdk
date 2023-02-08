// (C) 2022-2023 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";

import {
    DashboardState,
    selectDashboardEditModeDevRollout,
    selectDashboardLockStatus,
    selectDashboardRef,
    selectEnableAnalyticalDashboardPermissions,
    selectIsDashboardDirty,
    selectIsDashboardLoading,
    selectIsDashboardPrivate,
    selectIsInEditMode,
    selectIsLayoutEmpty,
    selectIsNewDashboard,
    selectIsReadOnly,
    selectListedDashboardsMap,
    selectIsShareButtonHidden,
    selectCanEditDashboardPermission,
    selectCanEditLockedDashboardPermission,
    selectCanShareDashboardPermission,
    selectCanShareLockedDashboardPermission,
} from "../../../../model";

/**
 * @internal
 */
export const selectCanEnterEditMode = createSelector(
    selectDashboardEditModeDevRollout,
    selectCanEditDashboardPermission,
    selectCanEditLockedDashboardPermission,
    selectDashboardLockStatus,
    (isEditModeEnabled, canEditDashboardPermission, canEditLockedDashboardPermission, isLocked) =>
        isEditModeEnabled && canEditDashboardPermission && (!isLocked || canEditLockedDashboardPermission),
);

/**
 * @internal
 */
export const selectCanEnterEditModeAndIsLoaded = createSelector(
    selectIsDashboardLoading,
    selectCanEnterEditMode,
    (isLoading, canEnterEditMode) => !isLoading && canEnterEditMode,
);

/**
 * @internal
 */
export const selectIsPrivateDashboard = createSelector(
    selectEnableAnalyticalDashboardPermissions,
    selectIsDashboardPrivate,
    selectIsNewDashboard,
    (arePermissionsEnabled, isPrivate, isCreatingNewDashboard) =>
        arePermissionsEnabled && (isCreatingNewDashboard || isPrivate),
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
export const selectIsCurrentDashboardVisibleInList = createSelector(
    selectDashboardRef,
    selectListedDashboardsMap,
    (currentDashboardRef, dashboardsList) =>
        Boolean(currentDashboardRef && dashboardsList.has(currentDashboardRef)),
);

/**
 * @internal
 */
export const selectIsShareButtonVisible = createSelector(
    selectEnableAnalyticalDashboardPermissions,
    selectCanShareDashboardPermission,
    selectCanShareLockedDashboardPermission,
    selectDashboardLockStatus,
    selectIsCurrentDashboardVisibleInList,
    selectIsReadOnly,
    selectIsInEditMode,
    selectIsShareButtonHidden,
    (
        dashboardPermissionsEnabled,
        canShareDashboardPermission,
        canShareLockedDashboardPermission,
        isLocked,
        isCurrentDashboardVisibleInList,
        isReadOnly,
        isInEditMode,
        isShareButtonHidden,
    ) =>
        dashboardPermissionsEnabled &&
        canShareDashboardPermission &&
        (!isLocked || canShareLockedDashboardPermission) &&
        isCurrentDashboardVisibleInList &&
        !isReadOnly &&
        !isInEditMode &&
        !isShareButtonHidden,
);
