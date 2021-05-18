// (C) 2021 GoodData Corporation
import { combineReducers, configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { filterContextSliceReducer } from "./filterContextSlice";
import { layoutSliceReducer } from "./layoutSlice";
import createSagaMiddleware from "redux-saga";

const reducers = combineReducers({
    filterContext: filterContextSliceReducer,
    layout: layoutSliceReducer,
});

const sagaMiddleware = createSagaMiddleware();
const middleware = [...getDefaultMiddleware({ thunk: false }), sagaMiddleware];

export const store = configureStore({
    reducer: reducers,
    middleware,
});

export type RootState = ReturnType<typeof store.getState>;
