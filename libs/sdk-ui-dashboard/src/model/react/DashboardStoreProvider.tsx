// (C) 2021 GoodData Corporation
import React from "react";
import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import { createDispatchHook, createSelectorHook, Provider, TypedUseSelectorHook } from "react-redux";
import { DashboardState } from "../store";
import { DashboardEventsProvider } from "./DashboardEventsContext";
import { useInitializeDashboardStore } from "./useInitializeDashboardStore";
import { IDashboardStoreProviderProps } from "./types";

/**
 * @internal
 */
const ReactDashboardContext: any = React.createContext(null);

/**
 * @alpha
 */
export const useDashboardDispatch: () => Dispatch<AnyAction> = createDispatchHook(ReactDashboardContext);

/**
 * @alpha
 */
export const useDashboardSelector: TypedUseSelectorHook<DashboardState> =
    createSelectorHook(ReactDashboardContext);

/**
 * @internal
 */
export const DashboardStoreProvider: React.FC<IDashboardStoreProviderProps> = (props) => {
    const dashboardStore = useInitializeDashboardStore(props);

    if (!dashboardStore) {
        return null;
    }

    return (
        <Provider store={dashboardStore.store} context={ReactDashboardContext}>
            <DashboardEventsProvider
                registerHandler={dashboardStore.registerEventHandler}
                unregisterHandler={dashboardStore.unregisterEventHandler}
            >
                {props.children}
            </DashboardEventsProvider>
        </Provider>
    );
};
