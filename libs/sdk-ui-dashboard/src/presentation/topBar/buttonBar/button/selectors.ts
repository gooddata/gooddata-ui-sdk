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
    selectCanManageWorkspace,
    selectCanManageAnalyticalDashboard,
    selectSupportsHierarchicalWorkspacesCapability,
} from "../../../../model";

/**
 * Decide whether the user has the right to edit dashboard.
 * If dashboard permissions are enabled then use them, otherwise fallback to workspace permissions
 *
 * @internal
 */
export const hasEditDashboardPermission = createSelector(
    selectEnableAnalyticalDashboardPermissions,
    selectCanEditDashboardPermission,
    selectCanManageAnalyticalDashboard,
    (dashboardPermissionsEnabled, canEditDashboardPermission, canManageAnalyticalDashboard) => {
        if (dashboardPermissionsEnabled) {
            return canEditDashboardPermission;
        }
        return canManageAnalyticalDashboard;
    },
);

/**
 * Decide whether the user has the right to edit locked dashboard.
 * If dashboard permissions are enabled then use them, otherwise fallback to workspace permissions
 *
 * @internal
 */
export const hasEditLockedDashboardPermission = createSelector(
    selectEnableAnalyticalDashboardPermissions,
    selectCanEditLockedDashboardPermission,
    selectCanManageWorkspace,
    selectSupportsHierarchicalWorkspacesCapability,
    (
        dashboardPermissionsEnabled,
        canEditLockedDashboardPermission,
        canManageWorkspace,
        hierarchicalWorkspacesSupported,
    ) => {
        if (dashboardPermissionsEnabled) {
            return canEditLockedDashboardPermission;
        }
        // editing locked dashboard is always disabled when hierarchical workspaces are supported (Tiger)
        return canManageWorkspace && !hierarchicalWorkspacesSupported;
    },
);

/**
 * @internal
 */
export const selectCanEnterEditMode = createSelector(
    selectDashboardEditModeDevRollout,
    hasEditDashboardPermission,
    hasEditLockedDashboardPermission,
    selectDashboardLockStatus,
    selectIsReadOnly,
    (isEditModeEnabled, hasEditDashboardPermission, hasEditLockedDashboardPermission, isLocked, isReadOnly) =>
        isEditModeEnabled &&
        !isReadOnly &&
        hasEditDashboardPermission &&
        (!isLocked || hasEditLockedDashboardPermission),
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
