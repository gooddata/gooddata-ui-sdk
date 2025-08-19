// (C) 2021-2025 GoodData Corporation

import { PutEffect, put } from "redux-saga/effects";

import { ICustomDashboardEvent, IDashboardEvent } from "../../events/base.js";

/**
 * Creates an effect which will dispatch the provided event. Yield whatever this function returns
 *
 * @param event - event to dispatch
 */
export function dispatchDashboardEvent(
    event: IDashboardEvent | ICustomDashboardEvent,
): PutEffect<IDashboardEvent | ICustomDashboardEvent> {
    return put(event);
}
