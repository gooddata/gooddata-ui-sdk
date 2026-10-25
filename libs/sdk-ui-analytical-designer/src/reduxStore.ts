// (C) 2023-2026 GoodData Corporation

import { createStore } from "./create_store.js";

// Use this wisely as this allows you to modify or query redux store directly when imported.
// TODO FET-1260 The constants usage should be replaced by "getStore" hook from react-redux when redux is
//  upgraded. The store is created in separate file from app.tsx where it was created before to not have
//  circular dependencies between the files.
// Sagas are not auto-started; caller invokes startSagas() when ready.
export const { store, sagaMiddleware, startSagas, subscribeControls } = createStore();
