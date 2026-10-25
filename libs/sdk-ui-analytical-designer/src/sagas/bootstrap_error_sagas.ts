// (C) 2007-2026 GoodData Corporation

import { type SagaReturnType, call, select, takeEvery } from "redux-saga/effects";

import { type IBootstrapErrorAction } from "../actions/app_context_actions.js";
import { ActionTypeKeys } from "../constants/actions.js";
import { getErrorHandler } from "../services/bootstrap_error_service.js";
import { type IAppState } from "../store/types.js";
import { isLoggedInViaSso } from "../utils/sso.js";

export function* bootstrapError(action: IBootstrapErrorAction) {
    const state: IAppState = yield select();
    const loggedViaSso: SagaReturnType<typeof isLoggedInViaSso> = yield call(isLoggedInViaSso);

    const errorHandler: SagaReturnType<typeof getErrorHandler> = yield call(
        getErrorHandler,
        state,
        action,
        loggedViaSso,
    );

    if (errorHandler) {
        yield call(errorHandler, action.payload);
    }
}

export function* watchErrorBootstrap() {
    yield takeEvery(ActionTypeKeys.BOOTSTRAP_ERROR, bootstrapError);
}
