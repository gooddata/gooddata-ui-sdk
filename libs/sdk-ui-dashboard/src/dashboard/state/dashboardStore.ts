// (C) 2021 GoodData Corporation
import {
    AnyAction,
    configureStore,
    Dispatch,
    EnhancedStore,
    EntityState,
    getDefaultMiddleware,
} from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { filterContextSliceReducer } from "./filterContext";
import { layoutSliceReducer } from "./layout";
import { loadingSliceReducer } from "./loading";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IInsight, ObjRef } from "@gooddata/sdk-model";
import { LoadingState } from "./loading/loadingState";
import { FilterContextState } from "./filterContext/filterContextState";
import { LayoutState } from "./layout/layoutState";
import { insightsSliceReducer } from "./insights";

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
    filterContext: FilterContextState;
    layout: LayoutState;
    insights: EntityState<IInsight>;
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
export const useDashboardDispatch = () => useDispatch<DashboardDispatch>();

/**
 * @internal
 */
export const useDashboardSelector: TypedUseSelectorHook<DashboardState> = useSelector;

/**
 * Values in this context will be available to all sagas.
 *
 * @internal
 */
export type DashboardContext = {
    /**
     * Analytical Backend where the dashboard exists.
     */
    backend: IAnalyticalBackend;

    /**
     * Analytical Backend where the dashboard exists.
     */
    workspace: string;

    /**
     * Dashboard that should be loaded into the store.
     */
    dashboardRef?: ObjRef;
};

export type DashboardStoreConfig = {
    /**
     * Specifies context that will be hammered into the saga middleware. All sagas can then access the values
     * from the context.
     */
    sagaContext: DashboardContext;

    /**
     * Specifies root event emitter of the dashboard. This is the saga that will be responsible for sending
     * events to the registered event handlers.
     */
    rootEventEmitter: any;

    /**
     * Specifies root command handler of the dashboard. This is the saga that will be taking all the supported
     * commands and orchestrate their processing.
     */
    rootCommandHandler: any;
};

/**
 * Creates a new store for a dashboard.
 *
 * @param config - runtime configuration to apply on the middlewares and the store
 */
export function createDashboardStore(config: DashboardStoreConfig): DashboardStore {
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
            filterContext: filterContextSliceReducer,
            layout: layoutSliceReducer,
            insights: insightsSliceReducer,
        },
        middleware,
    });

    sagaMiddleware.run(config.rootEventEmitter);
    sagaMiddleware.run(config.rootCommandHandler);

    return store;
}
