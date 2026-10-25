// (C) 2020-2026 GoodData Corporation

import { defineMessage } from "react-intl";
import { type SagaIterator } from "redux-saga";
import { delay, put, select, takeEvery } from "redux-saga/effects";

import { isDataTooLargeError } from "@gooddata/sdk-backend-spi";

import { type IExportResultErrorAction } from "../actions/export_report_actions.js";
import { type IShowAddMessageAction, addMessage, hideMessage } from "../actions/messages_actions.js";
import { ActionTypeKeys } from "../constants/actions.js";
import { getLocale } from "../selectors/intl_selector.js";
import { MESSAGE_EXPORT_RESULT_ERROR } from "../store/messages/messages_state.js";

export function* processMessageDuration(action: IShowAddMessageAction) {
    const { durationInMs, translationKey, id } = action.payload;

    if (durationInMs) {
        yield delay(durationInMs);
        yield put(hideMessage(id ?? translationKey));
    }
}

/**
 * The export too-many-rows toast formats the row counts with the user locale — a cross-domain
 * read (appState.intl) the messages case reducer must not do. The slice's
 * EXPORT_RESULT_ERROR case removes the progress toast and leaves this branch alone; this
 * handler adds the toast via MESSAGES_ADD under the same MESSAGE_EXPORT_RESULT_ERROR id, so
 * the next EXPORT_RESULT_STARTED clears it exactly like the reducer-produced variants.
 */
export function* processExportResultError(action: IExportResultErrorAction): SagaIterator<void> {
    const error = action.payload;

    if (!isDataTooLargeError(error)) {
        return;
    }

    // Currently, there will be at most one limit break specified.
    const limitBreak = error.responseBody?.structuredDetail?.limitBreaks?.[0];
    if (limitBreak?.limitType !== "export-rows") {
        return;
    }

    const locale: ReturnType<typeof getLocale> = yield select(getLocale);
    const formatter = Intl.NumberFormat(locale);

    yield put(
        addMessage({
            id: MESSAGE_EXPORT_RESULT_ERROR,
            translationKey: defineMessage({ id: "messages.exportResultError.tooManyRows" }).id,
            type: "error",
            values: {
                actual: formatter.format(limitBreak.actualValue),
                limit: formatter.format(limitBreak.limit),
            },
        }),
    );
}

export function* messagesWatcher() {
    yield takeEvery(ActionTypeKeys.MESSAGES_ADD, processMessageDuration);
    yield takeEvery(ActionTypeKeys.EXPORT_RESULT_ERROR, processExportResultError);
}
