// (C) 2021-2026 GoodData Corporation

import { type SagaReturnType, call, select, takeEvery } from "redux-saga/effects";

import { NotAuthenticated, isNotAuthenticated } from "@gooddata/sdk-backend-spi";

import { type IDeleteReportFailedAction } from "../actions/delete_actions.js";
import { type IExportResultErrorAction } from "../actions/export_report_actions.js";
import { type measureDateDatasetsError as measureDateDatasetsErrorCreator } from "../actions/measure_date_datasets_actions.js";
import { type dataSourceError } from "../actions/messages_actions.js";
import {
    type IExportReportErrorAction,
    type IReportExecutionFailedAction,
    hasExecutionStatus,
} from "../actions/report_actions.js";
import { type ISaveReportErrorAction } from "../actions/save_actions.js";
import { ActionTypeKeys } from "../constants/actions.js";
import { UNAUTHORIZED } from "../constants/errors.js";
import {
    getSSOExpiredUrl,
    showSSOCustomUnauthorizedLoginPage as showSSOCustomUnauthorizedLoginPageSelector,
} from "../selectors/bootstrap_selector.js";
import { getAccountPageUri } from "../services/bootstrap_error_service.js";
import {
    CatalogActionTypeKeys,
    type ISetCatalogAvailabilityErrorFlagAction,
} from "../store/catalog/catalog_store_actions.js";
import { getInfoUri } from "../utils/location.js";
import { isLoggedInViaSso } from "../utils/sso.js";

import { redirectToReport } from "./export_report_sagas.js";

export const infoUriFailed = getInfoUri("ssoFailed");

export function* ssoTokenExpired(error: unknown) {
    if (!error) {
        return;
    }

    const loggedInViaSso: boolean = yield call(isLoggedInViaSso);
    const shouldRedirect = loggedInViaSso && isNotAuthenticated(error);

    if (shouldRedirect) {
        const showSSOCustomUnauthorizedLoginPage: ReturnType<
            typeof showSSOCustomUnauthorizedLoginPageSelector
        > = yield select(showSSOCustomUnauthorizedLoginPageSelector);

        if (showSSOCustomUnauthorizedLoginPage) {
            const ssoExpiredUrl: ReturnType<typeof getSSOExpiredUrl> = yield select(getSSOExpiredUrl);
            yield call(redirectToReport, window, ssoExpiredUrl || infoUriFailed);
            return;
        }
        const url: SagaReturnType<typeof getAccountPageUri> = yield call(getAccountPageUri, {
            location: window.location,
        });
        yield call(redirectToReport, window, url);
    }
}

export function* reportExecutionError(action: IReportExecutionFailedAction) {
    // the execution error payload is a caught error probed for its status CODE string
    const status = hasExecutionStatus(action.payload) ? action.payload.status : undefined;
    if (status === UNAUTHORIZED) {
        const error = new NotAuthenticated(status);
        yield call(ssoTokenExpired, error);
    }
}

export function* messagesDataSourceError(action: ReturnType<typeof dataSourceError>) {
    yield call(ssoTokenExpired, action.payload?.error);
}

export function* measureDateDatasetsError(action: ReturnType<typeof measureDateDatasetsErrorCreator>) {
    yield call(ssoTokenExpired, action.payload?.error);
}

export function* exportResultError(action: IExportResultErrorAction | IExportReportErrorAction) {
    yield call(ssoTokenExpired, action.payload);
}

export function* saveReportError(action: ISaveReportErrorAction) {
    yield call(ssoTokenExpired, action.payload?.error);
}

export function* deleteReportError(action: IDeleteReportFailedAction) {
    yield call(ssoTokenExpired, action.payload?.error);
}

export function* setAvailabilityError(action: ISetCatalogAvailabilityErrorFlagAction) {
    yield call(ssoTokenExpired, action.payload?.error);
}

export function* watchApplicationRedirect() {
    yield takeEvery(ActionTypeKeys.REPORT_EXECUTION_ERROR, reportExecutionError);
    yield takeEvery(ActionTypeKeys.MESSAGES_DATA_SOURCE_ERROR, messagesDataSourceError);
    yield takeEvery(ActionTypeKeys.MEASURE_DATE_DATASETS_ERROR, measureDateDatasetsError);
    yield takeEvery(ActionTypeKeys.EXPORT_RESULT_ERROR, exportResultError);
    yield takeEvery(ActionTypeKeys.REPORT_EXPORT_ERROR, exportResultError);
    yield takeEvery(ActionTypeKeys.SAVE_REPORT_ERROR, saveReportError);
    yield takeEvery(ActionTypeKeys.DELETE_REPORT_ERROR, deleteReportError);
    yield takeEvery(CatalogActionTypeKeys.STORE_SET_AVAILABILITY_ERROR, setAvailabilityError);
}
