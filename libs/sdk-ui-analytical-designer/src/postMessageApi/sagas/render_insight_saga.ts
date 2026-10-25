// (C) 2020-2026 GoodData Corporation

import { call, select, takeEvery } from "redux-saga/effects";

import { type IObjectMeta } from "@gooddata/sdk-embedding";

import {
    type IReportExecutionFailedAction,
    type IReportExecutionFinishedAction,
    hasExecutionStatus,
} from "../../actions/report_actions.js";
import { ActionTypeKeys } from "../../constants/actions.js";
import { getIsEmbedded } from "../../selectors/meta_selector.js";
import {
    getLastSavedReportIdentifier,
    getLastSavedReportTitle,
    getLastSavedReportUri,
} from "../../selectors/report_selector.js";
import { type IAppState } from "../../store/types.js";
import { insightRendered } from "../outgoing/render_insight_events.js";
import { availableCommandsSelector } from "../state/selectors/post_message_context_selector.js";

export function* notifyInsightRendered(
    action: IReportExecutionFinishedAction | IReportExecutionFailedAction,
) {
    const isEmbedded: ReturnType<typeof getIsEmbedded> = yield select(getIsEmbedded);
    if (!isEmbedded) {
        return;
    }
    const availableCommands: ReturnType<typeof availableCommandsSelector> =
        yield select(availableCommandsSelector);
    const state: IAppState = yield select();
    const insightMeta: IObjectMeta = {
        title: getLastSavedReportTitle(state),
        uri: getLastSavedReportUri(state),
        identifier: getLastSavedReportIdentifier(state),
    };
    // REPORT_EXECUTION_ERROR's payload is a caught error; its `status` has always been what this
    // event forwards as the error message (undefined for REPORT_EXECUTION_FINISHED)
    yield call(
        insightRendered,
        availableCommands,
        insightMeta,
        hasExecutionStatus(action.payload) ? action.payload.status : undefined,
    );
}

export function* watchInsightRendered() {
    yield takeEvery(ActionTypeKeys.REPORT_EXECUTION_FINISHED, notifyInsightRendered);
    yield takeEvery(ActionTypeKeys.REPORT_EXECUTION_ERROR, notifyInsightRendered);
}
