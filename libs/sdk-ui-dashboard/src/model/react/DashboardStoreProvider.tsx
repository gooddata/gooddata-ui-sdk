// (C) 2021 GoodData Corporation
import React from "react";
import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import { createDispatchHook, createSelectorHook, Provider, TypedUseSelectorHook } from "react-redux";
import { DashboardState } from "../store";
import { DashboardEventsProvider } from "./DashboardEventsContext";
import { useInitializeDashboardStore } from "./useInitializeDashboardStore";
import { IDashboardStoreProviderProps } from "./types";

/**
 * @alpha
 */
export const ReactDashboardContext: any = React.createContext(null);

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
    const { additionalReduxContext } = props;

    if (!dashboardStore) {
        return null;
    }

    if (additionalReduxContext != undefined) {
        /*
         * Setting store into multiple contexts is essential in environments where a dynamically loaded
         * dashboard engine is integrated into an application that adds additional embedded, local plugins
         * which use Redux hooks (useDashboardSelector, useDashboardDispatch)
         *
         * Such local code is typically built against a local version of the sdk-ui-dashboard and has
         * different redux context providers from those used by dynamically loaded engine bundle.
         *
         * When the local code uses redux hooks, it will explode because they look into a different context
         * where the store is unset.
         */
        return (
            <Provider store={dashboardStore.store} context={ReactDashboardContext}>
                <Provider store={dashboardStore.store} context={additionalReduxContext}>
                    <DashboardEventsProvider
                        registerHandler={dashboardStore.registerEventHandler}
                        unregisterHandler={dashboardStore.unregisterEventHandler}
                    >
                        {props.children}
                    </DashboardEventsProvider>
                </Provider>
            </Provider>
        );
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
