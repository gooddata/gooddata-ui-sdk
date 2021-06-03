// (C) 2021 GoodData Corporation
import React from "react";
import {
    AnyAction,
    combineReducers,
    configureStore,
    Dispatch,
    EnhancedStore,
    EntityState,
    getDefaultMiddleware,
    Middleware,
} from "@reduxjs/toolkit";
import createSagaMiddleware, { Saga, Task } from "redux-saga";
import { enableBatching } from "redux-batched-actions";
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
import { spawn } from "redux-saga/effects";
import { UserState } from "./user/userState";
import { userSliceReducer } from "./user";
import { DashboardMetaState } from "./meta/metaState";
import { metaSliceReducer } from "./meta/index";

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
    user: UserState;
    meta: DashboardMetaState;
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
     * Optionally specify redux middleware to register into the store.
     */
    additionalMiddleware?: Middleware<any>;

    /**
     * Optionally specify event handlers to register during the initialization.
     */
    initialEventHandlers?: DashboardEventHandler[];
};

function createRootSaga(eventEmitter: Saga, commandHandler: Saga) {
    return function* () {
        try {
            yield spawn(eventEmitter);
            yield spawn(commandHandler);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error("Root saga failed", e);
        }
    };
}

/**
 * Fully configured and initialized dashboard store realized by redux and with redux-sagas.
 */
export type ReduxedDashboardStore = {
    store: DashboardStore;
    registerEventHandler: (handler: DashboardEventHandler) => void;
    unregisterEventHandler: (handler: DashboardEventHandler) => void;
    rootSagaTask: Task;
};

/**
 * Creates a new store for a dashboard.
 *
 * @param config - runtime configuration to apply on the middlewares and the store
 */
export function createDashboardStore(config: DashboardStoreConfig): ReduxedDashboardStore {
    const sagaMiddleware = createSagaMiddleware({
        context: {
            dashboardContext: config.sagaContext,
        },
    });

    const middleware = [
        ...getDefaultMiddleware({
            thunk: false,
            /*
             * All events that fly through the store have the dashboard context in the `ctx` prop. This is
             * for the receiver of the event (who may be well off redux).
             *
             * Additionally, some events - namely those reporting on error scenarios may include the actual
             * error instance in them.
             */
            serializableCheck: {
                ignoredActions: ["GDC.DASH/EVT.COMMAND.FAILED"],
                ignoredActionPaths: ["ctx"],
            },
        }),
        ...(config.additionalMiddleware ? [config.additionalMiddleware] : []),
        sagaMiddleware,
    ];

    const rootReducer = combineReducers({
        loading: loadingSliceReducer,
        config: configSliceReducer,
        permissions: permissionsSliceReducer,
        filterContext: filterContextSliceReducer,
        layout: layoutSliceReducer,
        dateFilterConfig: dateFilterConfigSliceReducer,
        insights: insightsSliceReducer,
        alerts: alertsSliceReducer,
        catalog: catalogSliceReducer,
        user: userSliceReducer,
        meta: metaSliceReducer,
    });

    const store = configureStore({
        reducer: enableBatching(rootReducer),
        middleware,
    });

    const rootEventEmitter = createRootEventEmitter(config.initialEventHandlers);
    const rootSaga = createRootSaga(rootEventEmitter.eventEmitterSaga, rootCommandHandler as any);
    const rootSagaTask = sagaMiddleware.run(rootSaga);

    return {
        store,
        registerEventHandler: rootEventEmitter.registerHandler,
        unregisterEventHandler: rootEventEmitter.unregisterHandler,
        rootSagaTask,
    };
}
