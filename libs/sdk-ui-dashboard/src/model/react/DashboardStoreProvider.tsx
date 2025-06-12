// (C) 2021-2022 GoodData Corporation
import React from "react";
import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import { createDispatchHook, createSelectorHook, Provider, TypedUseSelectorHook } from "react-redux";
import { DashboardState } from "../store/index.js";
import { DashboardEventsProvider } from "./DashboardEventsContext.js";
import { useInitializeDashboardStore } from "./useInitializeDashboardStore.js";
import { IDashboardStoreProviderProps } from "./types.js";

/**
 * @alpha
 */
export const ReactDashboardContext: any = React.createContext(null);

/**
 * @alpha
 */
export const useDashboardDispatch: () => Dispatch<AnyAction> = createDispatchHook(ReactDashboardContext);

/**
 * Hook for retrieving data from the dashboard state.
 *
 * @example
 * Example how to obtain all insights stored on the dashboard:
 *
 * ```tsx
 * import { useDashboardSelector, selectInsights } from "@gooddata/sdk-ui-dashboard";
 *
 * const CustomDashboardWidget = () => {
 *   const insights = useDashboardSelector(selectInsights);
 *
 *   return (
 *      <pre>{JSON.stringify(insights, null, 2)}</pre>
 *   );
 * }
 * ```
 *
 * @public
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

    if (additionalReduxContext != undefined && additionalReduxContext !== ReactDashboardContext) {
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
