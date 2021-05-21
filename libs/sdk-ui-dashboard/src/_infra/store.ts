// (C) 2021 GoodData Corporation
import {
    CombinedState,
    combineReducers,
    configureStore,
    EnhancedStore,
    getDefaultMiddleware,
} from "@reduxjs/toolkit";
import { filterContextSliceReducer, FilterContextState } from "./filterContextSlice";
import { layoutSliceReducer, LayoutState } from "./layoutSlice";
import createSagaMiddleware from "redux-saga";

export type DashboardState = CombinedState<{ filterContext: FilterContextState; layout: LayoutState }>;
export type DashboardStore = EnhancedStore<DashboardState>;

export function createDashboardStore(): DashboardStore {
    const reducers = combineReducers({
        filterContext: filterContextSliceReducer,
        layout: layoutSliceReducer,
    });

    const sagaMiddleware = createSagaMiddleware();
    const middleware = [...getDefaultMiddleware({ thunk: false }), sagaMiddleware];

    const store = configureStore({
        reducer: reducers,
        middleware,
    });

    return store;
}
