// (C) 2021 GoodData Corporation

import { put, PutEffect } from "redux-saga/effects";
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
