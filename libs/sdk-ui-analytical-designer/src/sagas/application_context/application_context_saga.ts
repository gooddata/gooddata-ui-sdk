// (C) 2022-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select, takeEvery } from "redux-saga/effects";

import { type ILocale } from "@gooddata/sdk-ui";

import {
    type IBootstrapDataAction,
    setIntlMessages,
    type setLocale,
} from "../../actions/app_context_actions.js";
import { ActionTypeKeys } from "../../constants/actions.js";
import { bootstrapData, userLanguage } from "../../selectors/bootstrap_selector.js";
import { storeBackendInitialized } from "../../store/application_context/app_context_actions.js";
import {
    DEFAULT_LANGUAGE,
    DEFAULT_MESSAGES,
    resolveMessages,
    validateLocale,
} from "../../utils/translations.js";

import { ApplicationContextActionsTypeKeys } from "./application_context_actions.js";

function* handleBackendInitialized(): SagaIterator<void> {
    yield put(storeBackendInitialized());
}

export function* loadIntlMessages(locale: ILocale) {
    try {
        const currentLocaleMessages: Record<string, string> = yield call(resolveMessages, locale);
        yield put(setIntlMessages(locale, currentLocaleMessages));
    } catch (error) {
        console.error("Failed to load intl messages", error);
        // Degrade to the default-language bundle so consumers that gate rendering on the
        // presence of messages (e.g. the report visualization) still render instead of
        // staying permanently blank when a locale chunk fails to load.
        yield put(setIntlMessages(locale, DEFAULT_MESSAGES[DEFAULT_LANGUAGE]));
    }
}

function* loadIntlMessagesSaga(action: IBootstrapDataAction): SagaIterator<void> {
    const { data } = action.payload;
    const bootstrapLocale = validateLocale(data.user.language);
    yield call(loadIntlMessages, bootstrapLocale);
}

function* handleSetLocale(action: ReturnType<typeof setLocale>): SagaIterator<void> {
    const locale = validateLocale(action.payload.locale);
    yield call(loadIntlMessages, locale);
}

export function* watchApplicationContext(): SagaIterator<void> {
    yield takeEvery(ApplicationContextActionsTypeKeys.SAGA_BACKEND_INITIALIZED, handleBackendInitialized);
    yield takeEvery(ActionTypeKeys.SET_LOCALE, handleSetLocale);

    const seeded: ReturnType<typeof bootstrapData> = yield select(bootstrapData);
    if (seeded) {
        // A host can seed BOOTSTRAP_DATA before the sagas start. Then the listener below misses it,
        // so load the seeded locale directly.
        const language: ReturnType<typeof userLanguage> = yield select(userLanguage);
        yield call(loadIntlMessages, validateLocale(language));
    } else {
        yield takeEvery(ActionTypeKeys.BOOTSTRAP_DATA, loadIntlMessagesSaga);
    }
}
