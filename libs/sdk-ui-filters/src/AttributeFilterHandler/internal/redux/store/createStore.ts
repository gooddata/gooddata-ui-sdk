// (C) 2022-2025 GoodData Corporation

import { type Action, type AnyAction, type Middleware, configureStore } from "@reduxjs/toolkit";
import { defaultImport } from "default-import";
import defaultReduxSaga from "redux-saga";

import {
    filterAttributeElements,
    filterLocalIdentifier,
    filterObjRef,
    isAttributeElementsByValue,
    isNegativeAttributeFilter,
    objRefToString,
} from "@gooddata/sdk-model";

import { rootSaga } from "./rootSaga.js";
import { actions, sliceReducer } from "./slice.js";
import { type AttributeFilterState, initialState } from "./state.js";
import { type AttributeFilterHandlerStore, type AttributeFilterHandlerStoreContext } from "./types.js";

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
        const result = next(action) as Action;
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
    const localIdentifier = filterLocalIdentifier(context.attributeFilter);
    const elements = filterAttributeElements(context.attributeFilter);
    const elementsForm = isAttributeElementsByValue(elements) ? "values" : "uris";
    const elementKeys = isAttributeElementsByValue(elements) ? elements.values : elements.uris;
    const isInverted = isNegativeAttributeFilter(context.attributeFilter);

    // Note: We use type assertion here because Redux Toolkit has complex generic type inference
    // that doesn't work well with strict TypeScript mode. The types are correct at runtime.
    const store = configureStore({
        preloadedState: {
            ...initialState,
            localIdentifier,
            displayFormRef,
            displayAsLabelRef: context.displayAsLabel,
            elementsForm,
            selection: {
                commited: {
                    keys: elementKeys,
                    isInverted,
                    irrelevantKeys: [],
                },
                working: {
                    keys: elementKeys,
                    isInverted,
                    irrelevantKeys: [],
                },
            },
            config: {
                hiddenElements: context.hiddenElements,
                staticElements: context.staticElements,
                withoutApply: context.withoutApply,
            },
            originalFilter: context.attributeFilter,
        },
        reducer: sliceReducer as any,
        middleware: (getDefaultMiddleware: any) => {
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
                    warnAfter: 4096,
                },
                immutableCheck: {
                    warnAfter: 4096,
                },
            }).concat([sagaMiddleware, eventListeningMiddleware(context.eventListener)]);
        },
        devTools: {
            name: `AttributeFilter state: ${objRefToString(displayFormRef)}`,
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
            return selector(store.getState() as AttributeFilterState);
        },
    };
}
