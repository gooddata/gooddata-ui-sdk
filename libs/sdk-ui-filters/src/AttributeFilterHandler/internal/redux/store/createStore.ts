// (C) 2022-2023 GoodData Corporation
import { Action, AnyAction, configureStore, Middleware } from "@reduxjs/toolkit";
import defaultReduxSaga from "redux-saga";
import { actions, sliceReducer } from "./slice.js";
import { rootSaga } from "./rootSaga.js";
import { AttributeFilterState, initialState } from "./state.js";
import { AttributeFilterHandlerStore, AttributeFilterHandlerStoreContext } from "./types.js";
import {
    filterAttributeElements,
    filterObjRef,
    isAttributeElementsByValue,
    isNegativeAttributeFilter,
} from "@gooddata/sdk-model";
import { defaultImport } from "default-import";

const nonSerializableActions = [
    actions.loadAttributeError.type,
    actions.loadInitialElementsPageError.type,
    actions.loadNextElementsPageError.type,
    actions.loadCustomElementsError.type,
    actions.initError.type,
];

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const createSagaMiddleware = defaultImport(defaultReduxSaga);

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
export function createAttributeFilterHandlerStore(
    context: AttributeFilterHandlerStoreContext,
): AttributeFilterHandlerStore {
    const sagaMiddleware = createSagaMiddleware({
        context: {
            attributeFilterContext: context,
        },
    });

    const displayFormRef = filterObjRef(context.attributeFilter);
    const elements = filterAttributeElements(context.attributeFilter);
    const elementsForm = isAttributeElementsByValue(elements) ? "values" : "uris";
    const elementKeys = isAttributeElementsByValue(elements) ? elements.values : elements.uris;
    const isInverted = isNegativeAttributeFilter(context.attributeFilter);

    const store = configureStore({
        preloadedState: {
            ...initialState,
            attribute: {
                data: context.attribute,
                status: "success",
            },
            displayFormRef,
            elementsForm,
            selection: {
                commited: {
                    keys: elementKeys,
                    isInverted,
                },
                working: {
                    keys: elementKeys,
                    isInverted,
                },
            },
            config: {
                hiddenElements: context.hiddenElements,
                staticElements: context.staticElements,
            },
        },
        reducer: sliceReducer,
        middleware: (getDefaultMiddleware) => {
            return getDefaultMiddleware({
                thunk: false,
                serializableCheck: {
                    ignoredActions: nonSerializableActions,
                    ignoredPaths: [
                        "initialization.error",
                        "attribute.error",
                        "elements.initialPageLoad.error",
                        "elements.nextPageLoad.error",
                    ],
                },
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
