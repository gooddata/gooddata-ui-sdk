// (C) 2022-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

export enum ApplicationContextActionsTypeKeys {
    SAGA_BACKEND_INITIALIZED = "SAGA/BACKEND_INITIALIZED",
}

export const backendInitialized = createAction(ApplicationContextActionsTypeKeys.SAGA_BACKEND_INITIALIZED);
