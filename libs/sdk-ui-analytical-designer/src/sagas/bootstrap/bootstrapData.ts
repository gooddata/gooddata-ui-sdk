// (C) 2007-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { type IBootstrapData, bootstrapData } from "../../actions/app_context_actions.js";
import { backend } from "../../backend.js";
import { bootstrapData as bootstrapDataSelector } from "../../selectors/bootstrap_selector.js";
import { getLocale } from "../../selectors/intl_selector.js";
import { type ICustomRouteParams } from "../../typings/location.js";

import { backendBootstrapData } from "./backendBootstrapData.js";

export function* fetchBootstrapData(routeParams: ICustomRouteParams): SagaIterator<void> {
    // The host can seed BOOTSTRAP_DATA before the sagas start. Keep the seeded data. When the host
    // seeds none, load the data from the backend.
    const seeded: ReturnType<typeof bootstrapDataSelector> = yield select(bootstrapDataSelector);
    if (!seeded) {
        const locale: ReturnType<typeof getLocale> = yield select(getLocale);
        const data: IBootstrapData = yield call(backendBootstrapData, backend, routeParams.projectId, locale);
        yield put(bootstrapData(data));
    }
}
