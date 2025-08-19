// (C) 2024-2025 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import {
    IAutomationMetadataObject,
    isExportDefinitionVisualizationObjectRequestPayload,
} from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

import { createMemoizedSelector } from "../_infra/selectors.js";
import { DashboardSelector, DashboardState } from "../types.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.automations,
);

/**
 * Returns workspace automations.
 *
 * @alpha
 */
export const selectDashboardUserAutomations: DashboardSelector<IAutomationMetadataObject[]> = createSelector(
    selectSelf,
    (state) => {
        return state.userAutomations;
    },
);

/**
 * Returns workspace automations count.
 *
 * @alpha
 */
export const selectAllAutomationsCount: DashboardSelector<number> = createSelector(selectSelf, (state) => {
    return state.allAutomationsCount;
});

/**
 * Returns workspace alerts.
 *
 * @alpha
 */
export const selectDashboardUserAutomationAlerts: DashboardSelector<IAutomationMetadataObject[]> =
    createSelector(selectSelf, (state) => {
        return state.userAutomations.filter((automation) => !!automation.alert);
    });

/**
 * Returns workspace schedules.
 *
 * @alpha
 */
export const selectDashboardUserAutomationSchedules: DashboardSelector<IAutomationMetadataObject[]> =
    createSelector(selectSelf, (state) => {
        return state.userAutomations.filter((automation) => !!automation.schedule && !automation.alert);
    });

/**
 * Returns workspace alerts for current dashboard, widget and user context.
 *
 * @alpha
 */
export const selectDashboardUserAutomationAlertsInContext: (
    widgetLocalIdentifier: string | undefined,
) => DashboardSelector<IAutomationMetadataObject[]> = createMemoizedSelector(
    (widgetLocalIdentifier: string | undefined) =>
        createSelector(selectDashboardUserAutomationAlerts, (alerts) => {
            return alerts.filter(
                (alert) => alert.metadata?.widget === widgetLocalIdentifier || !widgetLocalIdentifier,
            );
        }),
);

/**
 * Returns workspace schedules for current dashboard, widget and user context.
 *
 * @alpha
 */
export const selectDashboardUserAutomationSchedulesInContext: (
    widgetLocalIdentifier: string | undefined,
) => DashboardSelector<IAutomationMetadataObject[]> = createMemoizedSelector(
    (widgetLocalIdentifier: string | undefined) =>
        createSelector(selectDashboardUserAutomationSchedules, (schedules) => {
            return schedules.filter((schedule) => {
                const isTiedToWidget = schedule.exportDefinitions?.some((exportDefinition) => {
                    const requestPayload = exportDefinition.requestPayload;
                    return (
                        isExportDefinitionVisualizationObjectRequestPayload(requestPayload) &&
                        requestPayload.content.widget === widgetLocalIdentifier
                    );
                });

                return isTiedToWidget || !widgetLocalIdentifier;
            });
        }),
);

/**
 * Returns workspace automations loading
 *
 * @alpha
 */
export const selectAutomationsIsLoading: DashboardSelector<boolean> = createSelector(selectSelf, (state) => {
    return state.isLoading;
});

/**
 * Returns workspace automations loading
 *
 * @alpha
 */
export const selectAutomationsIsInitialized: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => {
        return state.isInitialized;
    },
);

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
