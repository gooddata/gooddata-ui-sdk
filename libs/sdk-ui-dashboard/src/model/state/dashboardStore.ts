// (C) 2021 GoodData Corporation
import React from "react";
import {
    AnyAction,
    combineReducers,
    configureStore,
    Dispatch,
    EnhancedStore,
    getDefaultMiddleware,
    Middleware,
} from "@reduxjs/toolkit";
import createSagaMiddleware, { Saga, Task } from "redux-saga";
import { enableBatching } from "redux-batched-actions";
import { createDispatchHook, createSelectorHook, TypedUseSelectorHook } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { filterContextSliceReducer } from "./filterContext";
import { layoutSliceReducer } from "./layout";
import { loadingSliceReducer } from "./loading";
import { insightsSliceReducer } from "./insights";
import { createRootEventEmitter } from "../eventEmitter/rootEventEmitter";
import { DashboardEventHandler } from "../events/eventHandler";
import { rootCommandHandler } from "../commandHandlers/rootCommandHandler";
import { DashboardContext } from "../types/commonTypes";
import { configSliceReducer } from "./config";
import { dateFilterConfigSliceReducer } from "./dateFilterConfig";
import { permissionsSliceReducer } from "./permissions";
import { alertsSliceReducer } from "./alerts";
import { catalogSliceReducer } from "./catalog";
import { spawn } from "redux-saga/effects";
import { userSliceReducer } from "./user";
import { metaSliceReducer } from "./meta";
import { DashboardState } from "./types";
import { AllQueryServices } from "../queryServices";
import { createQueryProcessingModule } from "./_infra/queryProcessing";
import { IDashboardQueryService } from "./_infra/queryService";
import values from "lodash/values";
import merge from "lodash/merge";
import keyBy from "lodash/keyBy";
import { listedDashboardsSliceReducer } from "./listedDashboards";

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

    /**
     * Optionally specify query service implementations. These will be used to override the default implementations
     * and add new services.
     */
    queryServices?: IDashboardQueryService<any, any>[];
};

function createRootSaga(eventEmitter: Saga, commandHandler: Saga, queryProcessor: Saga) {
    return function* () {
        try {
            yield spawn(eventEmitter);
            yield spawn(commandHandler);
            yield spawn(queryProcessor);
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
 * This middleware ensures that actions which represent the dashboard commands are properly 'stamped' with
 * essential metadata. For now this is just the unique identifier of the command. However going forward we may
 * want to add timing info or other fancy stuff.
 */
const commandStampingMiddleware: Middleware = () => (next) => (action) => {
    if (action.type.startsWith("GDC.DASH/CMD.")) {
        // see: https://www.reddit.com/r/reactjs/comments/7cfgzr/redux_modifying_action_payload_in_middleware/dppknrh?utm_source=share&utm_medium=web2x&context=3
        action.meta = {
            uuid: uuidv4(),
        };
    }

    return next(action);
};

function mergeQueryServices(
    original: IDashboardQueryService<any, any>[],
    extras: IDashboardQueryService<any, any>[] = [],
): IDashboardQueryService<any, any>[] {
    return values(
        merge(
            {},
            keyBy(original, (service) => service.name),
            keyBy(extras, (service) => service.name),
        ),
    );
}

/**
 * Creates a new store for a dashboard.
 *
 * @param config - runtime configuration to apply on the middlewares and the store
 */
export function createDashboardStore(config: DashboardStoreConfig): ReduxedDashboardStore {
    const queryProcessing = createQueryProcessingModule(
        mergeQueryServices(AllQueryServices, config.queryServices),
    );
    const sagaMiddleware = createSagaMiddleware({
        context: {
            dashboardContext: config.sagaContext,
        },
    });

    const middleware = [
        commandStampingMiddleware,
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
                ignoredActions: [
                    "GDC.DASH/EVT.COMMAND.FAILED",
                    "GDC.DASH/EVT.QUERY.FAILED",
                    "@@QUERY.ENVELOPE",
                    // Drill commands & events contain non-serializable dataView
                    "GDC.DASH/CMD.DRILL",
                    "GDC.DASH/EVT.DRILL.TRIGGERED",
                    "GDC.DASH/CMD.DRILL.DRILL_DOWN",
                    "GDC.DASH/EVT.DRILL.DRILL_DOWN.TRIGGERED",
                    "GDC.DASH/CMD.DRILL.DRILL_TO_INSIGHT",
                    "GDC.DASH/EVT.DRILL.DRILL_TO_INSIGHT.TRIGGERED",
                    "GDC.DASH/CMD.DRILL.DRILL_TO_DASHBOARD",
                    "GDC.DASH/EVT.DRILL.DRILL_TO_DASHBOARD.TRIGGERED",
                    "GDC.DASH/CMD.DRILL.DRILL_TO_ATTRIBUTE_URL",
                    "GDC.DASH/EVT.DRILL.DRILL_TO_ATTRIBUTE_URL.TRIGGERED",
                    "GDC.DASH/CMD.DRILL.DRILL_TO_CUSTOM_URL",
                    "GDC.DASH/EVT.DRILL.DRILL_TO_CUSTOM_URL.TRIGGERED",
                ],
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
        listedDashboards: listedDashboardsSliceReducer,
        _queryCache: queryProcessing.queryCacheReducer,
    });

    const store = configureStore({
        reducer: enableBatching(rootReducer),
        middleware,
    });

    const rootEventEmitter = createRootEventEmitter(config.initialEventHandlers);
    const rootSaga = createRootSaga(
        rootEventEmitter.eventEmitterSaga,
        rootCommandHandler as any,
        queryProcessing.rootQueryProcessor,
    );
    const rootSagaTask = sagaMiddleware.run(rootSaga);

    return {
        store,
        registerEventHandler: rootEventEmitter.registerHandler,
        unregisterEventHandler: rootEventEmitter.unregisterHandler,
        rootSagaTask,
    };
}
