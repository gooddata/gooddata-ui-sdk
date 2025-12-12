// (C) 2021-2025 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { getContext } from "redux-saga/effects";

import { type DashboardContext, type PrivateDashboardContext } from "../../types/commonTypes.js";

/**
 * Gets the public dashboard context stored inside redux-saga context.
 */
export function* getDashboardContext(): SagaIterator<DashboardContext> {
    return yield getContext("dashboardContext");
}

/**
 * Gets the private dashboard context stored inside redux-saga context.
 */
export function* getPrivateContext(): SagaIterator<PrivateDashboardContext> {
    return yield getContext("privateContext");
}
