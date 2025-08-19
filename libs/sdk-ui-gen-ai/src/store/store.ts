// (C) 2024-2025 GoodData Corporation
import { EnhancedStore, configureStore } from "@reduxjs/toolkit";
import { defaultImport } from "default-import";
import defaultReduxSaga from "redux-saga";

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { chatWindowSliceName, chatWindowSliceReducer } from "./chatWindow/chatWindowSlice.js";
import { EventDispatcher } from "./events.js";
import { messagesSliceName, messagesSliceReducer } from "./messages/messagesSlice.js";
import { OptionsDispatcher } from "./options.js";
import { queueMiddleware } from "./queues/queue.newMessage.js";
import { rootSaga } from "./sideEffects/index.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const createSagaMiddleware = defaultImport(defaultReduxSaga);

export const getStore = (
    backend: IAnalyticalBackend,
    workspace: string,
    eventDispatcher: EventDispatcher,
    optionsDispatcher: OptionsDispatcher,
): EnhancedStore => {
    const sagaMiddleware = createSagaMiddleware({
        context: {
            backend,
            workspace,
            eventDispatcher,
            optionsDispatcher,
        },
    });
    const store = configureStore({
        reducer: {
            [messagesSliceName]: messagesSliceReducer,
            [chatWindowSliceName]: chatWindowSliceReducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware()
                .prepend(sagaMiddleware as any)
                .prepend(queueMiddleware),
        devTools: {
            name: "GenAI",
        },
    });

    sagaMiddleware.run(rootSaga);

    return store;
};
