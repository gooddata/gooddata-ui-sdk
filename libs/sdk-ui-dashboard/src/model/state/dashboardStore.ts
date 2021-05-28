// (C) 2021 GoodData Corporation
import React from "react";
import {
    AnyAction,
    configureStore,
    Dispatch,
    EnhancedStore,
    EntityState,
    getDefaultMiddleware,
} from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { createDispatchHook, createSelectorHook, TypedUseSelectorHook } from "react-redux";
import { filterContextSliceReducer } from "./filterContext";
import { layoutSliceReducer } from "./layout";
import { loadingSliceReducer } from "./loading";
import { IInsight } from "@gooddata/sdk-model";
import { LoadingState } from "./loading/loadingState";
import { FilterContextState } from "./filterContext/filterContextState";
import { LayoutState } from "./layout/layoutState";
import { insightsSliceReducer } from "./insights";
import { createRootEventEmitter } from "../eventEmitter/rootEventEmitter";
import { DashboardEventHandler } from "../events/eventHandler";
import { rootCommandHandler } from "../commandHandlers/rootCommandHandler";
import { DashboardContext } from "../types/commonTypes";
import { ConfigState } from "./config/configState";
import { configSliceReducer } from "./config";
import { DateFilterConfigState } from "./dateFilterConfig/dateFilterConfigState";
import { dateFilterConfigSliceReducer } from "./dateFilterConfig";
import { PermissionsState } from "./permissions/permissionsState";
import { permissionsSliceReducer } from "./permissions";
import { IWidgetAlert } from "@gooddata/sdk-backend-spi";
import { alertsSliceReducer } from "./alerts/index";
import { CatalogState } from "./catalog/catalogState";
import { catalogSliceReducer } from "./catalog";

/**
 * TODO: unfortunate. normally the typings get inferred from store. However since this code creates store
 *  dynamically such thing is not possible. Beware.. even if we get the inference working, the api-extractor
 *  will have problems if just the type gets exported unless the value from which it is inferred is exported
 *  as well.
 *
 * @internal
 */
export type DashboardState = {
    loading: LoadingState;
    config: ConfigState;
    permissions: PermissionsState;
    filterContext: FilterContextState;
    layout: LayoutState;
    dateFilterConfig: DateFilterConfigState;
    catalog: CatalogState;
    // Entities
    insights: EntityState<IInsight>;
    alerts: EntityState<IWidgetAlert>;
};

/**
 * TODO: unfortunate. normally the typings get inferred from store. However since this code creates store
 *  dynamically such thing is not possible. Beware.. even if we get the inference working, the api-extractor
 *  will have problems if just the type gets exported unless the value from which it is inferred is exported
 *  as well.
 *
 * @internal
 */
export type DashboardDispatch = Dispatch<AnyAction>;

/**
 * @internal
 */
export type DashboardStore = EnhancedStore<DashboardState>;

/**
 * @internal
 */
export const ReactDashboardContext: any = React.createContext(null);

/**
 * @internal
 */
export const useDashboardDispatch = createDispatchHook(ReactDashboardContext);

/**
 * @internal
 */
export const useDashboardSelector: TypedUseSelectorHook<DashboardState> =
    createSelectorHook(ReactDashboardContext);

export type DashboardStoreConfig = {
    /**
     * Specifies context that will be hammered into the saga middleware. All sagas can then access the values
     * from the context.
     */
    sagaContext: DashboardContext;

    /**
     *
     */
    initialEventHandlers?: DashboardEventHandler[];
};

/**
 * Creates a new store for a dashboard.
 *
 * @param config - runtime configuration to apply on the middlewares and the store
 */
export function createDashboardStore(
    config: DashboardStoreConfig,
): [DashboardStore, (handler: DashboardEventHandler) => void] {
    const sagaMiddleware = createSagaMiddleware({
        context: {
            dashboardContext: config.sagaContext,
        },
    });

    const middleware = [
        ...getDefaultMiddleware({
            thunk: false,
            /*
             * TODO: events that fly through contain dashboard context which has some non-serializable data
             */
            serializableCheck: {
                ignoredActionPaths: ["ctx"],
            },
        }),
        sagaMiddleware,
    ];

    const store = configureStore({
        reducer: {
            loading: loadingSliceReducer,
            config: configSliceReducer,
            permissions: permissionsSliceReducer,
            filterContext: filterContextSliceReducer,
            layout: layoutSliceReducer,
            dateFilterConfig: dateFilterConfigSliceReducer,
            insights: insightsSliceReducer,
            alerts: alertsSliceReducer,
            catalog: catalogSliceReducer,
        },
        middleware,
    });

    const rootEventEmitter = createRootEventEmitter(config.initialEventHandlers);

    sagaMiddleware.run(rootEventEmitter.eventEmitterSaga);
    sagaMiddleware.run(rootCommandHandler as any);

    return [store, rootEventEmitter.registerHandler];
}
