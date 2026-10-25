// (C) 2020-2026 GoodData Corporation

import { call, select, takeEvery } from "redux-saga/effects";

import { ActionTypeKeys } from "../../constants/actions.js";
import { enableNewInsightChangedPostMessageEvent } from "../../selectors/feature_flag_selector.js";
import { getInsightForCreateViaMd } from "../../selectors/insight_selectors.js";
import { getIsEmbedded } from "../../selectors/meta_selector.js";
import { extendedReferencePointApplied } from "../../store/buckets/buckets_operation_events.js";
import { ChartSortStoreActionTypeKeys } from "../../store/chart_sort/chart_sort_actions.js";
import { insightChanged } from "../outgoing/insight_changed_events.js";
import { availableCommandsSelector } from "../state/selectors/post_message_context_selector.js";

/**
 * `action.type` is a bare string because `createAction` types `.type` as `string`. The comparison is
 * against the creators' own `.type`, so a renamed event cannot drift away from this check silently.
 *
 * It keys on `extendedReferencePointApplied`, the operation's semantic EVENT, and not on the
 * trigger: this handler reads `getInsightForCreateViaMd`, which reads the buckets and the extended
 * reference point, and the trigger writes neither — so keying on it would notify the host with the
 * PREVIOUS insight.
 */
export function* handleExecutionStarted(action: { type: string }) {
    const isEmbedded: ReturnType<typeof getIsEmbedded> = yield select(getIsEmbedded);
    if (!isEmbedded) {
        return;
    }

    const isNewInsightChangedPostMessageEventEnabled: ReturnType<
        typeof enableNewInsightChangedPostMessageEvent
    > = yield select(enableNewInsightChangedPostMessageEvent);

    /**
     * We are watching for two actions and decide which one we react to based on the feature flag.
     */
    if (
        (isNewInsightChangedPostMessageEventEnabled &&
            action.type === ActionTypeKeys.REPORT_EXECUTION_STARTED) ||
        (!isNewInsightChangedPostMessageEventEnabled && action.type === extendedReferencePointApplied.type)
    ) {
        return;
    }

    const definition: ReturnType<typeof getInsightForCreateViaMd> = yield select(getInsightForCreateViaMd);
    const availableCommands: ReturnType<typeof availableCommandsSelector> =
        yield select(availableCommandsSelector);
    yield call(insightChanged, availableCommands, definition);
}

export function* handleUpdateChartConfig() {
    const isEmbedded: ReturnType<typeof getIsEmbedded> = yield select(getIsEmbedded);
    if (!isEmbedded) {
        return;
    }

    const isNewInsightChangedPostMessageEventEnabled: ReturnType<
        typeof enableNewInsightChangedPostMessageEvent
    > = yield select(enableNewInsightChangedPostMessageEvent);

    if (!isNewInsightChangedPostMessageEventEnabled) {
        return;
    }

    const definition: ReturnType<typeof getInsightForCreateViaMd> = yield select(getInsightForCreateViaMd);
    const availableCommands: ReturnType<typeof availableCommandsSelector> =
        yield select(availableCommandsSelector);
    yield call(insightChanged, availableCommands, definition);
}

export function* watchInsightChanged() {
    yield takeEvery(ActionTypeKeys.REPORT_EXECUTION_STARTED, handleExecutionStarted);
    yield takeEvery(extendedReferencePointApplied.type, handleExecutionStarted);
    yield takeEvery(ChartSortStoreActionTypeKeys.STORE_UPDATE_CHART_SORT_CONFIG, handleUpdateChartConfig);
}
