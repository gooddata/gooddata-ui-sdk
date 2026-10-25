// (C) 2022-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

export type ApplicationContextStoreAction = IStoreApiTokenStoreAction | IStoreBackendInitializedAction;

export enum ApplicationContextStoreActionTypeKeys {
    STORE_API_TOKEN = "STORE/API_TOKEN",
    STORE_BACKEND_INITIALIZED = "STORE/BACKEND_INITIALIZED",
}

export const storeApiToken = createAction(
    ApplicationContextStoreActionTypeKeys.STORE_API_TOKEN,
    (token: string, type: string) => ({ payload: { token, type } }),
);

export type IStoreApiTokenStoreAction = ReturnType<typeof storeApiToken>;

export const storeBackendInitialized = createAction(
    ApplicationContextStoreActionTypeKeys.STORE_BACKEND_INITIALIZED,
);

export type IStoreBackendInitializedAction = ReturnType<typeof storeBackendInitialized>;
