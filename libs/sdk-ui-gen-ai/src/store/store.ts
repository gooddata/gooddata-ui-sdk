// (C) 2024-2025 GoodData Corporation
import { configureStore } from "@reduxjs/toolkit";
import defaultReduxSaga from "redux-saga";
import { defaultImport } from "default-import";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IColorPalette } from "@gooddata/sdk-model";
import { messagesSliceName, messagesSliceReducer } from "./messages/messagesSlice.js";
import { chatWindowSliceName, chatWindowSliceReducer } from "./chatWindow/chatWindowSlice.js";
import { rootSaga } from "./sideEffects/index.js";
import { EventDispatcher } from "./events.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const createSagaMiddleware = defaultImport(defaultReduxSaga);

export const getStore = (
    backend: IAnalyticalBackend,
    workspace: string,
    eventDispatcher: EventDispatcher,
    opts: {
        colorPalette?: IColorPalette;
    },
) => {
    const { colorPalette } = opts;

    const sagaMiddleware = createSagaMiddleware({
        context: {
            backend,
            workspace,
            eventDispatcher,
        },
    });
    const store = configureStore({
        reducer: {
            [messagesSliceName]: messagesSliceReducer,
            [chatWindowSliceName]: chatWindowSliceReducer,
        },
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(sagaMiddleware),
        devTools: {
            name: "GenAI",
        },
    });

    sagaMiddleware.run(rootSaga, { colorPalette });

    return store;
};
