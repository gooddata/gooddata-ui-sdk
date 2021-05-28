// (C) 2021 GoodData Corporation

import { put } from "redux-saga/effects";
import { IDashboardEvent } from "../events/base";

/**
 * This saga is used to dispatch events into the dashboard's event bus.
 *
 * @param event - event to dispatch.
 */
export function* eventDispatcher(event: IDashboardEvent) {
    yield put(event);
}
