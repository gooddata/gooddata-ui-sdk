// (C) 2022 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import {
    DashboardState,
    selectCanManageACL,
    selectCanManageAnalyticalDashboard,
    selectCanManageWorkspace,
    selectDashboardLockStatus,
    selectDashboardRef,
    selectIsExport,
    selectIsLayoutEmpty,
    selectIsReadOnly,
    selectListedDashboardsMap,
} from "../../../../model";
import {
    selectDashboardEditModeDevRollout,
    selectEnableAnalyticalDashboardPermissions,
} from "../../../../model/store/config/configSelectors";
import { selectIsDashboardLoading } from "../../../../model/store/loading/loadingSelectors";
import {
    selectIsDashboardDirty,
    selectIsDashboardPrivate,
    selectIsNewDashboard,
} from "../../../../model/store/meta/metaSelectors";
import {
    selectSupportsAccessControlCapability,
    selectSupportsHierarchicalWorkspacesCapability,
} from "../../../../model/store/backendCapabilities/backendCapabilitiesSelectors";
import { selectIsInEditMode } from "../../../../model/store/ui/uiSelectors";

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
    selectCanManageAnalyticalDashboard,
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
export const selectShouldHideControlButtons = createSelector(
    selectCanEnterEditModeAndIsLoaded,
    selectIsExport,
    (canEnterEditModeAndIsLoaded, isExport) => !canEnterEditModeAndIsLoaded || isExport,
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
    selectCanManageACL,
    (arePermissionsEnabled, supportsAccessControl, canManageACL) =>
        arePermissionsEnabled && supportsAccessControl && canManageACL,
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
    (isAdmin, hasPermission, isCurrentDashboardVisibleInList, isLocked, isReadOnly, isInEditMode) =>
        hasPermission &&
        isCurrentDashboardVisibleInList &&
        (!isLocked || isAdmin) &&
        !isReadOnly &&
        !isInEditMode,
);
