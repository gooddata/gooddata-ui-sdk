// (C) 2007-2026 GoodData Corporation

import { call, put, select, takeEvery } from "redux-saga/effects";

import { GdcErrorType } from "@gooddata/sdk-embedding";
import { type IExtendedExportConfig } from "@gooddata/sdk-ui";

import { exportResult } from "../../actions/export_report_actions.js";
import { CSV, XLSX } from "../../constants/export_types.js";
import { getProjectId } from "../../selectors/bootstrap_selector.js";
import { getIsExportCSVDisabled, getIsExportXLSXDisabled } from "../../selectors/options_menu_selector.js";
import { VisualizationPropertiesSelectors } from "../../selectors/visualization_properties_selector.js";
import { PostEventActionTypeKeys } from "../actions/action_types.js";
import {
    type IExportInsightRequestedAction,
    type IOutputExportInsightAction,
    exportInsightFailed,
} from "../actions/export_insight_actions.js";
import {
    exportFailed,
    exportFinished,
    exportInvalidFormat,
    exportInvalidState,
    getInvalidExportFormatError,
    getInvalidExportStateError,
} from "../outgoing/export_insight_events.js";
import { getPostMessageContextId } from "../sagas/post_message_saga_helper.js";
import { availableCommandsSelector } from "../state/selectors/post_message_context_selector.js";

export function* handleExportInsightRequest({
    payload: { config, postMessageContext },
}: IExportInsightRequestedAction) {
    const contextId = getPostMessageContextId(postMessageContext);
    const { format } = config;
    const projectId: ReturnType<typeof getProjectId> = yield select(getProjectId);

    const isSupportedFormat = [XLSX, CSV].includes(format);
    if (!isSupportedFormat) {
        const { errorMessage } = getInvalidExportFormatError(format);
        yield put(
            exportInsightFailed({
                projectId,
                contextId,
                exportConfig: config,
                errorCode: GdcErrorType.InvalidArgument,
                errorMessage,
            }),
        );
        return;
    }

    const isExportXLSXDisabled: ReturnType<typeof getIsExportXLSXDisabled> =
        yield select(getIsExportXLSXDisabled);
    const isExportCSVDisabled: ReturnType<typeof getIsExportCSVDisabled> =
        yield select(getIsExportCSVDisabled);
    const isExportDisabled = format === XLSX ? isExportXLSXDisabled : isExportCSVDisabled;
    if (isExportDisabled) {
        const { errorMessage } = getInvalidExportStateError(format);
        yield put(
            exportInsightFailed({
                projectId,
                contextId,
                exportConfig: config,
                errorCode: GdcErrorType.InvalidState,
                errorMessage,
            }),
        );
        return;
    }

    const grandTotalsPosition: ReturnType<typeof VisualizationPropertiesSelectors.getGrandTotalsPosition> =
        yield select(VisualizationPropertiesSelectors.getGrandTotalsPosition);
    const exportConfig: IExtendedExportConfig = {
        ...config,
        ...(grandTotalsPosition ? { grandTotalsPosition } : {}),
    };

    yield put(exportResult(exportConfig, contextId));
}

export function* handleExportInsightFailed({
    payload: { format, errorCode, postMessageContext },
}: IOutputExportInsightAction) {
    const contextId = getPostMessageContextId(postMessageContext);
    if (errorCode === GdcErrorType.InvalidArgument) {
        yield call(exportInvalidFormat, format, contextId);
    } else if (errorCode === GdcErrorType.InvalidState) {
        yield call(exportInvalidState, format, contextId);
    } else {
        yield call(exportFailed, contextId);
    }
}

export function* handleExportInsightFinished({
    payload: { exportFileLink, postMessageContext },
}: IOutputExportInsightAction) {
    const contextId = getPostMessageContextId(postMessageContext);
    const availableCommands: ReturnType<typeof availableCommandsSelector> =
        yield select(availableCommandsSelector);
    yield call(exportFinished, availableCommands, exportFileLink, contextId);
}

export function* watchExportInsight() {
    yield takeEvery(PostEventActionTypeKeys.EXPORT_INSIGHT_REQUESTED, handleExportInsightRequest);
    yield takeEvery(PostEventActionTypeKeys.EXPORT_INSIGHT_FAILED, handleExportInsightFailed);
    yield takeEvery(PostEventActionTypeKeys.EXPORT_INSIGHT_FINISHED, handleExportInsightFinished);
}
