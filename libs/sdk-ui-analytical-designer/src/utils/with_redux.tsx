// (C) 2007-2026 GoodData Corporation

import { type ComponentType } from "react";

import { Provider } from "react-redux";
import { type UnknownAction } from "redux";

import { createStore } from "../create_store.js";
import { rootReducer } from "../reducers/root_reducer.js";
import { type IAppState } from "../store/types.js";

export function withRedux<T>(
    WrappedComponent: ComponentType<T>,
    reducer: (state: IAppState, action: UnknownAction) => IAppState = (v) => v,
): ComponentType<T> {
    const { store } = createStore((state: IAppState, action: UnknownAction) => {
        const initialState = rootReducer(state, { type: "@@INIT" });
        return reducer(initialState, action);
    });

    function ReduxWrapper(props: T) {
        return (
            <Provider store={store}>
                <WrappedComponent {...props} />
            </Provider>
        );
    }

    return ReduxWrapper;
}
