// (C) 2019-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

export enum CatalogSagaActionTypeKeys {
    SAGA_CATALOG_LOAD_REQUESTED = "SAGA/SAGA_CATALOG_LOAD_REQUESTED",
    SAGA_CATALOG_LOAD_FINISHED = "SAGA/SAGA_CATALOG_LOAD_FINISHED",
    SAGA_CATALOG_LOAD_SUCCEEDED = "SAGA/SAGA_CATALOG_LOAD_SUCCEEDED",
}

export const catalogLoadRequested = createAction(CatalogSagaActionTypeKeys.SAGA_CATALOG_LOAD_REQUESTED);

export const catalogLoadFinished = createAction(CatalogSagaActionTypeKeys.SAGA_CATALOG_LOAD_FINISHED);

/**
 * Dispatched after every successful catalog load; `catalogLoadFinished` follows it, but is dispatched also
 * when the load fails.
 */
export const catalogLoadSucceeded = createAction(CatalogSagaActionTypeKeys.SAGA_CATALOG_LOAD_SUCCEEDED);
