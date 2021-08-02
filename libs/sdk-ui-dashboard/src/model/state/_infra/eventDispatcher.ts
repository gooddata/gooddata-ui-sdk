// (C) 2021 GoodData Corporation

import { put, PutEffect } from "redux-saga/effects";
import { IDashboardEvent } from "../../events/base";

/**
 * Creates an effect which will dispatch the provided event. Yield whatever this function returns
 *
 * @param event - event to dispatch
 */
export function dispatchDashboardEvent(event: IDashboardEvent): PutEffect<IDashboardEvent> {
    return put(event);
}
