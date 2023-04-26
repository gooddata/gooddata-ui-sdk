// (C) 2022-2023 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";

import {
    DashboardState,
    selectDashboardEditModeDevRollout,
    selectDashboardLockStatus,
    selectDashboardRef,
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
    DashboardSelector,
} from "../../../../model";

/**
 * Decide whether the user has the right to edit dashboard.
 * If dashboard permissions are enabled then use them, otherwise fallback to workspace permissions
 *
 * @internal
 */
export const hasEditDashboardPermission: DashboardSelector<boolean> = selectCanEditDashboardPermission;

/**
 * @internal
 */
export const selectCanEnterEditMode: DashboardSelector<boolean> = createSelector(
    selectDashboardEditModeDevRollout,
    selectCanEditDashboardPermission,
    selectCanEditLockedDashboardPermission,
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
export const selectIsShareButtonVisible: DashboardSelector<boolean> = createSelector(
    selectCanShareDashboardPermission,
    selectCanShareLockedDashboardPermission,
    selectDashboardLockStatus,
    selectIsCurrentDashboardVisibleInList,
    selectIsReadOnly,
    selectIsInEditMode,
    selectIsShareButtonHidden,
    (
        canShareDashboardPermission,
        canShareLockedDashboardPermission,
        isLocked,
        isCurrentDashboardVisibleInList,
        isReadOnly,
        isInEditMode,
        isShareButtonHidden,
    ) =>
        canShareDashboardPermission &&
        (!isLocked || canShareLockedDashboardPermission) &&
        isCurrentDashboardVisibleInList &&
        !isReadOnly &&
        !isInEditMode &&
        !isShareButtonHidden,
);
