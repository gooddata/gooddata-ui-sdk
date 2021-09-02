// (C) 2021 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { alertsAdapter } from "./alertsEntityAdapter";
import { DashboardState } from "../types";
import { newMapForObjectWithIdentity } from "../../../_staging/metadata/objRefMap";
import memoize from "lodash/memoize";
import { Identifier, ObjRef, serializeObjRef } from "@gooddata/sdk-model";

import { selectWidgetsMap } from "../layout/layoutSelectors";
import { IWidgetAlert } from "@gooddata/sdk-backend-spi";
import invariant from "ts-invariant";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.alerts,
);

const adapterSelectors = alertsAdapter.getSelectors(selectSelf);

/**
 * Selects all alerts used on the dashboard.
 *
 * @alpha
 */
export const selectAlerts = adapterSelectors.selectAll;

interface IWidgetAlertMapItem {
    identifier: Identifier;
    uri: string;
    ref: ObjRef;
    alert?: IWidgetAlert;
}

/**
 * Selects all alerts and returns them in a mapping of widget obj ref to the alert object.
 *
 * @internal
 */
const selectAlertsMapByWidgetRefs = createSelector(selectAlerts, selectWidgetsMap, (alerts, widgetsMap) => {
    const mappedItems = alerts.map((alert) => {
        const widget = widgetsMap.get(alert.widget);

        invariant(widget, "Alert widget is missing in state widgets");

        const result: IWidgetAlertMapItem = {
            identifier: widget.identifier,
            uri: widget.uri,
            ref: widget.ref,
            alert,
        };

        return result;
    });

    return newMapForObjectWithIdentity(mappedItems);
});

/**
 * Selects alert or undefined by widget ref
 *
 * @alpha
 */
export const selectAlertByWidgetRef = memoize(
    (widgetRef: ObjRef): ((state: DashboardState) => IWidgetAlert | undefined) => {
        return createSelector(selectAlertsMapByWidgetRefs, (alerts) => {
            const alert = alerts.get(widgetRef);
            if (alert) {
                return alert.alert;
            }
        });
    },
    serializeObjRef,
);

/**
 * Selects dashboard alerts in mapping an obj ref to widget map.
 *
 * @internal
 */
export const selectAlertsMap = createSelector(selectAlerts, (alerts) => {
    return newMapForObjectWithIdentity(alerts);
});

/**
 * Selects alert or undefined by alert ref
 *
 * @alpha
 */
export const selectAlertByRef = memoize(
    (ref: ObjRef): ((state: DashboardState) => IWidgetAlert | undefined) => {
        return createSelector(selectAlertsMap, (alerts) => {
            return alerts.get(ref);
        });
    },
    serializeObjRef,
);
