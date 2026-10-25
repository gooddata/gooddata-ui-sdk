// (C) 2007-2026 GoodData Corporation

import { call, put, select, takeEvery } from "redux-saga/effects";

import { type IObjectMeta, type IPostMessageContextPayload } from "@gooddata/sdk-embedding";
import { type IInsightDefinition, insightId, insightTitle, insightUri } from "@gooddata/sdk-model";

import { resetApplication } from "../../actions/app_context_actions.js";
import { type IOpenReportFailedAction, type IOpenReportFinishedAction } from "../../actions/open_actions.js";
import { ActionTypeKeys } from "../../constants/actions.js";
import { getInsightForCreateViaMd } from "../../selectors/insight_selectors.js";
import { getIsEmbedded } from "../../selectors/meta_selector.js";
import { isResetDisabledSelector } from "../../selectors/reset_button_selector.js";
import { createRouteParams, getRouteUri, setLocation } from "../../utils/location.js";
import { PostEventActionTypeKeys } from "../actions/action_types.js";
import {
    type IOpenInsightAction,
    type IOpenInsightFailedAction,
    openInsightFailed,
    openInsightFinished,
} from "../actions/open_insight_actions.js";
import { setPostMessageContext } from "../actions/set_post_message_context_actions.js";
import {
    insightNotFound,
    insightOpened,
    openInsightInvalidArgument,
} from "../outgoing/open_insight_events.js";
import { getPostMessageContextId } from "../sagas/post_message_saga_helper.js";
import {
    availableCommandsSelector,
    getPostMessageContext,
} from "../state/selectors/post_message_context_selector.js";

export function* openInsight({ payload: { customRouteParams, postMessageContext } }: IOpenInsightAction) {
    const contextId: string = getPostMessageContextId(postMessageContext);
    if (!customRouteParams.projectId) {
        yield put(openInsightFailed(contextId));
        return;
    }

    const routeParams = createRouteParams(customRouteParams);
    const uri: ReturnType<typeof getRouteUri> = yield select(getRouteUri, routeParams);
    const isResetDisabled: ReturnType<typeof isResetDisabledSelector> = yield select(isResetDisabledSelector);

    if (!isResetDisabled) {
        yield put(resetApplication());
    }

    yield put(setPostMessageContext(contextId));
    yield call(setLocation, uri);
}

export function* handleOpenInsightFinished(action: IOpenReportFinishedAction) {
    const isEmbedded: ReturnType<typeof getIsEmbedded> = yield select(getIsEmbedded);
    if (!isEmbedded) {
        return;
    }

    const { postMessageContext }: IPostMessageContextPayload = yield select(getPostMessageContext);
    const contextId: string = getPostMessageContextId(postMessageContext);
    const { insight, isDraft, time } = action.payload;

    if (!isDraft) {
        yield put(openInsightFinished(time, contextId));
    }

    const availableCommands: ReturnType<typeof availableCommandsSelector> =
        yield select(availableCommandsSelector);
    const insightMeta: IObjectMeta = {
        title: insightTitle(insight),
        uri: insightUri(insight),
        identifier: insightId(insight),
    };
    const definition: IInsightDefinition = yield select(getInsightForCreateViaMd);
    yield call(insightOpened, availableCommands, insightMeta, definition, contextId);
}

export function* handleOpenInsightEventFailed({
    payload: { postMessageContext, isInsightNotFound },
}: IOpenInsightFailedAction) {
    const contextId: string = getPostMessageContextId(postMessageContext);
    if (isInsightNotFound) {
        yield call(insightNotFound, contextId);
    } else {
        yield call(openInsightInvalidArgument, contextId);
    }
}

export function* handleOpenInsightFailed(action: IOpenReportFailedAction) {
    const { isDraft } = action.payload;
    if (isDraft) {
        return;
    }

    const { postMessageContext }: IPostMessageContextPayload = yield select(getPostMessageContext);
    const contextId: string = getPostMessageContextId(postMessageContext);

    yield put(openInsightFailed(contextId, true));
}

export function* watchOpenInsight() {
    yield takeEvery(PostEventActionTypeKeys.OPEN_INSIGHT_REQUESTED, openInsight);
    yield takeEvery(PostEventActionTypeKeys.OPEN_INSIGHT_EVENT_FAILED, handleOpenInsightEventFailed);
    yield takeEvery(ActionTypeKeys.OPEN_REPORT_FINISHED, handleOpenInsightFinished);
    yield takeEvery(ActionTypeKeys.OPEN_REPORT_FAILED, handleOpenInsightFailed);
}
