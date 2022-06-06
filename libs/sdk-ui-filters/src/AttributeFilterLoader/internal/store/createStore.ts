// (C) 2022 GoodData Corporation
import { Action, AnyAction, configureStore, Middleware } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { sliceReducer } from "./slice";
import { rootSaga } from "./rootSaga";
import { AttributeFilterState, initialState } from "./state";
import { AttributeFilterStore, AttributeFilterStoreContext } from "./types";

// We cannot handle event listeners inside saga, as once the root saga is canceled,
// take effects are not working anymore, but we may want to listen for actions,
// that can be fired even during the "cleanup" phase, after the cancelation.
const eventListeningMiddleware =
    (
        eventListener: (
            action: Action,
            selectFromNextState: <T>(selector: (state: AttributeFilterState) => T) => T,
        ) => void,
    ): Middleware =>
    (store) =>
    (next) =>
    (action) => {
        // First dispatch the action, so we have already updated store in the event listeners.
        const result = next(action);
        eventListener(result, (selector) => selector(store.getState()));
        return result;
    };

/**
 * @internal
 */
export function createAttributeFilterStore(context: AttributeFilterStoreContext): AttributeFilterStore {
    const sagaMiddleware = createSagaMiddleware({
        context: {
            attributeFilterContext: context,
        },
    });

    const store = configureStore({
        preloadedState: {
            ...initialState,
        },
        reducer: sliceReducer,
        middleware: (getDefaultMiddleware) => {
            return getDefaultMiddleware({
                thunk: false,
            }).concat([sagaMiddleware, eventListeningMiddleware(context.eventListener)]);
        },
    });

    const rootSagaTask = sagaMiddleware.run(rootSaga);

    return {
        context,
        cancelRootSaga: () => {
            rootSagaTask.cancel();
        },
        dispatch: (action: AnyAction) => {
            store.dispatch(action);
        },
        select: (selector) => {
            return selector(store.getState());
        },
    };
}
