// (C) 2021 GoodData Corporation
import React, { useReducer } from "react";
import noop from "lodash/noop";
import { IWidgetAlert } from "@gooddata/sdk-backend-spi";
import { areObjRefsEqual } from "@gooddata/sdk-model";

/**
 * @internal
 */
export interface IDashboardAlertsContextValue {
    alerts: IWidgetAlert[];
    addAlert: (alert: IWidgetAlert) => void;
    removeAlert: (alert: IWidgetAlert) => void;
    updateAlert: (alert: IWidgetAlert) => void;
}

const DashboardAlertsContext = React.createContext<IDashboardAlertsContextValue>({
    alerts: [],
    addAlert: noop,
    removeAlert: noop,
    updateAlert: noop,
});
DashboardAlertsContext.displayName = "DashboardAlertsContext";

interface IAddAlertAction {
    type: "add";
    payload: IWidgetAlert;
}

interface IRemoveAlertAction {
    type: "remove";
    payload: IWidgetAlert;
}

interface IUpdateAlertAction {
    type: "update";
    payload: IWidgetAlert;
}

type AlertAction = IAddAlertAction | IRemoveAlertAction | IUpdateAlertAction;

interface IAlertsState {
    alerts: IWidgetAlert[];
}

function reducer(state: IAlertsState, action: AlertAction): IAlertsState {
    switch (action.type) {
        case "add":
            return {
                ...state,
                alerts: [...(state.alerts ?? []), action.payload],
            };
        case "remove":
            return {
                ...state,
                alerts: state.alerts?.filter((alert) => alert !== action.payload),
            };
        case "update": {
            const index = state.alerts?.findIndex((alert) => areObjRefsEqual(alert.ref, action.payload.ref));
            return {
                ...state,
                alerts: [...state.alerts.slice(0, index), action.payload, ...state.alerts.slice(index + 1)],
            };
        }
    }
}

interface IDashboardAlertsProviderProps {
    alerts: IWidgetAlert[];
}

/**
 * @internal
 */
export const DashboardAlertsProvider: React.FC<IDashboardAlertsProviderProps> = ({ children, alerts }) => {
    const [state, dispatch] = useReducer(reducer, { alerts });

    const contextValue: IDashboardAlertsContextValue = {
        alerts: state.alerts,
        addAlert: (alert: IWidgetAlert) => dispatch({ type: "add", payload: alert }),
        removeAlert: (alert: IWidgetAlert) => dispatch({ type: "remove", payload: alert }),
        updateAlert: (alert: IWidgetAlert) => dispatch({ type: "update", payload: alert }),
    };

    return <DashboardAlertsContext.Provider value={contextValue}>{children}</DashboardAlertsContext.Provider>;
};

/**
 * @internal
 */
export const useAlerts = (): IDashboardAlertsContextValue => {
    return React.useContext(DashboardAlertsContext);
};
