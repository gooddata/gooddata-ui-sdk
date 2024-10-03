// (C) 2024 GoodData Corporation
import { configureStore } from "@reduxjs/toolkit";
import defaultReduxSaga from "redux-saga";
import { defaultImport } from "default-import";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { messagesSliceName, messagesSliceReducer, setMessages } from "./messages/messagesSlice.js";
import { agentSliceName, agentSliceReducer } from "./agent/agentSlice.js";
import { rootSaga } from "./sideEffects/index.js";
import { Message } from "../model.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const createSagaMiddleware = defaultImport(defaultReduxSaga);

export const getStore = (backend: IAnalyticalBackend, workspace: string, initialHistory?: Message[]) => {
    const sagaMiddleware = createSagaMiddleware({
        context: {
            backend,
            workspace,
        },
    });
    const store = configureStore({
        reducer: {
            [messagesSliceName]: messagesSliceReducer,
            [agentSliceName]: agentSliceReducer,
        },
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(sagaMiddleware),
        devTools: {
            name: "GenAI",
        },
    });

    sagaMiddleware.run(rootSaga);

    if (initialHistory?.length) {
        // Set the initial history in store
        store.dispatch(setMessages(initialHistory));
    }

    return store;
};
