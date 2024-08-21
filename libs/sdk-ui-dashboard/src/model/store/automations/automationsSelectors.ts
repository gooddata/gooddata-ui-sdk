// (C) 2024 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import { DashboardSelector, DashboardState } from "../types.js";
import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { selectDashboardId } from "../meta/metaSelectors.js";
import { selectCurrentUser } from "../user/userSelectors.js";
import { createMemoizedSelector } from "../_infra/selectors.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.automations,
);

/**
 * Returns workspace automations.
 *
 * @alpha
 */
export const selectAutomations: DashboardSelector<IAutomationMetadataObject[]> = createSelector(
    selectSelf,
    (state) => {
        return state.automations;
    },
);

/**
 * Returns workspace automations count.
 *
 * @alpha
 */
export const selectAutomationsCount: DashboardSelector<number> = createSelector(selectSelf, (state) => {
    return state.automations.length;
});

/**
 * Returns workspace alerts.
 *
 * @alpha
 */
export const selectAutomationsAlerts: DashboardSelector<IAutomationMetadataObject[]> = createSelector(
    selectSelf,
    (state) => {
        return state.automations.filter((automation) => !!automation.alert);
    },
);

/**
 * Returns workspace schedules.
 *
 * @alpha
 */
export const selectAutomationsSchedules: DashboardSelector<IAutomationMetadataObject[]> = createSelector(
    selectSelf,
    (state) => {
        return state.automations.filter((automation) => !!automation.schedule);
    },
);

/**
 * Returns workspace alerts for current dashboard, widget and user context.
 *
 * @alpha
 */
export const selectAutomationsAlertsInContext: (
    widgetLocalIdentifier: string | undefined,
) => DashboardSelector<IAutomationMetadataObject[]> = createMemoizedSelector(
    (widgetLocalIdentifier: string | undefined) =>
        createSelector(
            selectAutomationsAlerts,
            selectDashboardId,
            selectCurrentUser,
            (alerts, dashboardId, currentUser) => {
                return alerts.filter(
                    (alert) =>
                        alert.dashboard === dashboardId &&
                        alert.createdBy?.login === currentUser.login &&
                        alert.metadata?.widget === widgetLocalIdentifier,
                );
            },
        ),
);

/**
 * Returns workspace schedules for current dashboard and user context.
 *
 * @alpha
 */
export const selectAutomationsSchedulesInContext: DashboardSelector<IAutomationMetadataObject[]> =
    createSelector(
        selectAutomationsSchedules,
        selectDashboardId,
        selectCurrentUser,
        (schedules, dashboardId, currentUser) => {
            return schedules.filter(
                (schedule) =>
                    schedule.dashboard === dashboardId && schedule.createdBy?.login === currentUser.login,
            );
        },
    );

/**
 * Returns workspace automations loading
 *
 * @alpha
 */
export const selectAutomationsIsLoading: DashboardSelector<boolean> = createSelector(selectSelf, (state) => {
    return state.loading;
});

/**
 * Returns organization automations error
 *
 * @alpha
 */
export const selectAutomationsError: DashboardSelector<GoodDataSdkError | undefined> = createSelector(
    selectSelf,
    (state) => {
        return state.error;
    },
);

/**
 * Returns organization automations error
 *
 * @alpha
 */
export const selectAutomationsFingerprint: DashboardSelector<string> = createSelector(selectSelf, (state) => {
    return state.fingerprint;
});
