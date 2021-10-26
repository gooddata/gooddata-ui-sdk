// (C) 2021 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import { ObjRef } from "@gooddata/sdk-model";
import { selectAlertsMap } from "../alerts/alertsSelectors";
import { DashboardState } from "../types";
import { createMemoizedSelector } from "../_infra/selectors";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.ui,
);

/**
 * @alpha
 */
export const selectIsScheduleEmailDialogOpen = createSelector(
    selectSelf,
    (state) => state.scheduleEmailDialog.open,
);

/**
 * @alpha
 */
export const selectIsSaveAsDialogOpen = createSelector(selectSelf, (state) => state.saveAsDialog.open);

/**
 * @internal
 */
export const selectFilterBarHeight = createSelector(selectSelf, (state) => state.filterBar.height);

/**
 * @alpha
 */
export const selectFilterBarExpanded = createSelector(selectSelf, (state) => state.filterBar.expanded);

const selectHighlightedKpiAlertRef = createSelector(
    selectSelf,
    (state) => state.kpiAlerts.highlightedAlertRef,
);

const selectOpenedKpiAlertRef = createSelector(selectSelf, (state) => state.kpiAlerts.openedAlertRef);

/**
 * @alpha
 */
export const selectIsKpiAlertOpenedByAlertRef = createMemoizedSelector(
    (ref: ObjRef | undefined): ((state: DashboardState) => boolean) => {
        return createSelector(selectAlertsMap, selectOpenedKpiAlertRef, (alerts, openedAlertRef) => {
            if (!ref) {
                return false;
            }
            const openedAlert = openedAlertRef && alerts.get(openedAlertRef);
            if (!openedAlert) {
                return false;
            }
            const targetAlert = alerts.get(ref);
            if (!targetAlert) {
                return false;
            }

            return targetAlert.identifier === openedAlert.identifier;
        });
    },
);

/**
 * @alpha
 */
export const selectIsKpiAlertHighlightedByAlertRef = createMemoizedSelector(
    (ref: ObjRef | undefined): ((state: DashboardState) => boolean) => {
        return createSelector(
            selectAlertsMap,
            selectHighlightedKpiAlertRef,
            (alerts, highlightedAlertRef) => {
                if (!ref) {
                    return false;
                }
                const highlightedAlert = highlightedAlertRef && alerts.get(highlightedAlertRef);
                if (!highlightedAlert) {
                    return false;
                }
                const targetAlert = alerts.get(ref);
                if (!targetAlert) {
                    return false;
                }

                return targetAlert.identifier === highlightedAlert.identifier;
            },
        );
    },
);
