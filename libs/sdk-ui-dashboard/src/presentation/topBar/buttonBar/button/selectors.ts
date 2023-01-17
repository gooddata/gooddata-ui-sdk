// (C) 2022-2023 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";

import {
    DashboardState,
    selectCanManageWorkspace,
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
    selectSupportsAccessControlCapability,
    selectSupportsHierarchicalWorkspacesCapability,
    selectIsShareButtonHidden,
    selectCanEditDashboardPermission,
    selectCanShareDashboardPermission,
} from "../../../../model";

export const selectIsEditModeEnable = createSelector(
    selectDashboardEditModeDevRollout,
    selectIsReadOnly,
    (isDevRollout, isReadOnly) => isDevRollout && !isReadOnly,
);

/**
 * @internal
 */
export const selectCanEditLockedDashboard = createSelector(
    selectDashboardLockStatus,
    selectSupportsHierarchicalWorkspacesCapability,
    selectCanManageWorkspace,
    (isLocked, supportsHierarchicalWorkspaces, canManageWorkspace) =>
        isLocked && !supportsHierarchicalWorkspaces && canManageWorkspace,
);

/**
 * @internal
 */
export const selectCanEnterEditMode = createSelector(
    selectIsEditModeEnable,
    selectCanEditDashboardPermission,
    selectDashboardLockStatus,
    selectCanEditLockedDashboard,
    (isEditModeEnable, canManageAnalyticalDashboard, isLocked, canEditLockedDashboard) =>
        isEditModeEnable && canManageAnalyticalDashboard && (!isLocked || canEditLockedDashboard),
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
export const selectHasPermissionsForShare = createSelector(
    selectEnableAnalyticalDashboardPermissions,
    selectSupportsAccessControlCapability,
    selectCanShareDashboardPermission,
    (arePermissionsEnabled, supportsAccessControl, canShareDashboard) =>
        arePermissionsEnabled && supportsAccessControl && canShareDashboard,
);

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
    selectCanManageWorkspace,
    selectHasPermissionsForShare,
    selectIsCurrentDashboardVisibleInList,
    selectDashboardLockStatus,
    selectIsReadOnly,
    selectIsInEditMode,
    selectIsShareButtonHidden,
    (
        isAdmin,
        hasPermission,
        isCurrentDashboardVisibleInList,
        isLocked,
        isReadOnly,
        isInEditMode,
        isShareButtonHidden,
    ) =>
        hasPermission &&
        isCurrentDashboardVisibleInList &&
        (!isLocked || isAdmin) &&
        !isReadOnly &&
        !isInEditMode &&
        !isShareButtonHidden,
);
