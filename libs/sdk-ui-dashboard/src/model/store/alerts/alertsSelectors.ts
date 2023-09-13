// (C) 2021-2023 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { alertsAdapter } from "./alertsEntityAdapter.js";
import { DashboardSelector, DashboardState } from "../types.js";
import { ObjRefMap, newMapForObjectWithIdentity } from "../../../_staging/metadata/objRefMap.js";
import compact from "lodash/compact.js";
import memoize from "lodash/memoize.js";
import {
    Identifier,
    ObjRef,
    serializeObjRef,
    IWidgetAlert,
    isIdentifierRef,
    insightId,
    insightUri,
    insightRef,
} from "@gooddata/sdk-model";

import { selectWidgetsMap } from "../layout/layoutSelectors.js";
import { selectInsightsMap } from "../insights/insightsSelectors.js";

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
const selectAlertsMapByWidgetRefs = createSelector(
    selectAlerts,
    selectWidgetsMap,
    selectInsightsMap,
    (alerts, widgetsMap, insightsMap) => {
        const mappedItems = compact(
            alerts.map((alert) => {
                if (isIdentifierRef(alert.widget) && alert.widget.type === "insight") {
                    const insight = insightsMap.get(alert.widget);
                    if (!insight) {
                        //ignore
                        return undefined;
                    }

                    const result: IWidgetAlertMapItem = {
                        identifier: insightId(insight),
                        uri: insightUri(insight),
                        ref: insightRef(insight),
                        alert,
                    };

                    return result;
                }

                const widget = widgetsMap.get(alert.widget);
                if (!widget) {
                    /**
                     * Ignore widgets that are no longer available, this can naturally happen in edit mode when
                     * a KPI widget is deleted by the user: the alerts are not removed from redux in case the edit
                     * mode is cancelled (to avoid having to load the dashboard again from the backend).
                     */
                    return undefined;
                }

                const result: IWidgetAlertMapItem = {
                    identifier: widget.identifier,
                    uri: widget.uri,
                    ref: widget.ref,
                    alert,
                };

                return result;
            }),
        );

        return newMapForObjectWithIdentity(mappedItems);
    },
);

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
export const selectAlertsMap: DashboardSelector<ObjRefMap<IWidgetAlert>> = createSelector(
    selectAlerts,
    (alerts) => {
        return newMapForObjectWithIdentity(alerts);
    },
);

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
