// (C) 2020-2026 GoodData Corporation

import { type SagaReturnType, call, put, select, takeEvery } from "redux-saga/effects";

import {
    type AdSetTimezoneCommandData,
    GdcErrorType,
    type ICommandFailedBody,
    type IDrillableItemsCommandBody,
    getEventType,
    isAdClearCommandData,
    isAdClearInsightCommandData,
    isAdDrillableItemsCommandData,
    isAdExportInsightCommandData,
    isAdOpenInsightCommandData,
    isAdRedoCommandData,
    isAdRemoveFilterContextCommandData,
    isAdRequestCancellationCommandData,
    isAdSaveAsInsightCommandData,
    isAdSaveInsightCommandData,
    isAdSetApiTokenCommandData,
    isAdSetFilterContextCommandData,
    isAdSetTimezoneCommandData,
    isAdUndoCommandData,
} from "@gooddata/sdk-embedding";
import { isValidIanaTimezoneId } from "@gooddata/sdk-model";

import { conversionInit } from "../../actions/drillable_items_actions.js";
import { setTimezoneOverride } from "../../actions/timezone_override_actions.js";
import { backend } from "../../backend.js";
import { HOST_ADAPTER_ORIGIN, getHostAdapter } from "../../embedding/hostBridge.js";
import { getOrganizationId } from "../../selectors/bootstrap_selector.js";
import {
    isEmbeddingWriteCommandsEnabled,
    isEnableTimezoneChange,
} from "../../selectors/feature_flag_selector.js";
import { PostEventActionTypeKeys } from "../actions/action_types.js";
import { clearInsightRequested } from "../actions/clear_insight_actions.js";
import { clearInsightContentRequested } from "../actions/clear_insight_content_actions.js";
import { hostVerificationFailed, insecureCommandFailed } from "../actions/command_error_actions.js";
import { type ICommandReceivedAction } from "../actions/command_received_actions.js";
import {
    removeFilterContextRequested,
    setFilterContextRequested,
} from "../actions/control_filtering_actions.js";
import { exportInsightRequested } from "../actions/export_insight_actions.js";
import { openInsightRequested } from "../actions/open_insight_actions.js";
import { redoRequested } from "../actions/redo_actions.js";
import { saveAsInsightRequested } from "../actions/save_as_insight_actions.js";
import { saveInsightRequested } from "../actions/save_insight_actions.js";
import { undoRequested } from "../actions/undo_actions.js";
import { invalidCommand, postInvalidCommandArgument } from "../outgoing/invalid_command_events.js";

import { handleReceivedApiToken } from "./api_token_received_saga.js";
import { handleCancelEditFromKD } from "./cancel_edit_from_kd_saga.js";
import { getPostMessageContextIdFromCommandData, isWriteCommand } from "./post_message_saga_helper.js";

export async function validateHostDomain(organizationId: string, url: string): Promise<boolean> {
    return backend.organization(organizationId).securitySettings().isUrlValid(url, "UI_EVENT");
}

function* isCommandOriginValid(origin: string) {
    try {
        const organizationId: ReturnType<typeof getOrganizationId> = yield select(getOrganizationId);
        const result: SagaReturnType<typeof validateHostDomain> = yield call(
            validateHostDomain,
            organizationId,
            origin,
        );
        return result;
    } catch (e) {
        // oxlint-disable-next-line eslint-js/no-console
        console.log(e);
        return false;
    }
}

function* isCommandTypeValid(commandType: string) {
    const isWrite = isWriteCommand(commandType);
    const writeCommandsEnabled: ReturnType<typeof isEmbeddingWriteCommandsEnabled> = yield select(
        isEmbeddingWriteCommandsEnabled,
    );
    return !isWrite || writeCommandsEnabled;
}

function* handleSetTimezoneCommand(commandData: AdSetTimezoneCommandData) {
    const contextId = getPostMessageContextIdFromCommandData(commandData);
    const isTimezoneEnabled: ReturnType<typeof isEnableTimezoneChange> = yield select(isEnableTimezoneChange);
    if (!isTimezoneEnabled) {
        yield call(
            postInvalidCommandArgument,
            "Cannot set the timezone override: the dashboard timezone feature is disabled.",
            contextId,
        );
        return;
    }

    const { timezoneId } = commandData.gdc.event.data ?? {};
    if (timezoneId !== undefined && timezoneId !== "" && !isValidIanaTimezoneId(timezoneId)) {
        yield call(
            postInvalidCommandArgument,
            `The provided timezone override "${timezoneId}" is not a valid IANA timezone ID.`,
            contextId,
        );
        return;
    }

    // empty string and undefined both clear the override
    const resolvedOverride = timezoneId || undefined;
    yield put(setTimezoneOverride(resolvedOverride));
}

export function* handleReceivedCommand({
    payload: { data: commandData, origin: commandOrigin },
}: ICommandReceivedAction) {
    const commandType: string = getEventType(commandData);
    const contextId = getPostMessageContextIdFromCommandData(commandData);

    // Commands injected in-process by an installed host adapter carry the sentinel origin — no
    // host-domain validation applies (the sentinel is unreachable via window messages).
    const isHostInjected = commandOrigin === HOST_ADAPTER_ORIGIN && !!getHostAdapter();
    const isValidOrigin: SagaReturnType<typeof isCommandOriginValid> = isHostInjected
        ? true
        : yield call(isCommandOriginValid, commandOrigin);
    if (!isValidOrigin) {
        yield put(hostVerificationFailed(contextId));
        return;
    }

    const isValidType: SagaReturnType<typeof isCommandTypeValid> = yield call(
        isCommandTypeValid,
        commandType,
    );
    if (!isValidType) {
        yield put(insecureCommandFailed(commandType, contextId));
        return;
    }

    if (isAdDrillableItemsCommandData(commandData)) {
        const gdcCommandData: IDrillableItemsCommandBody = commandData.gdc.event.data;
        yield put(conversionInit(gdcCommandData));
    } else if (isAdOpenInsightCommandData(commandData)) {
        yield put(openInsightRequested(commandData));
    } else if (isAdClearCommandData(commandData)) {
        yield put(clearInsightRequested(commandData));
    } else if (isAdClearInsightCommandData(commandData)) {
        yield put(clearInsightContentRequested(commandData));
    } else if (isAdSaveInsightCommandData(commandData)) {
        yield put(saveInsightRequested(commandData));
    } else if (isAdSaveAsInsightCommandData(commandData)) {
        yield put(saveAsInsightRequested(commandData));
    } else if (isAdExportInsightCommandData(commandData)) {
        yield put(exportInsightRequested(commandData));
    } else if (isAdUndoCommandData(commandData)) {
        yield put(undoRequested(commandData));
    } else if (isAdRedoCommandData(commandData)) {
        yield put(redoRequested(commandData));
    } else if (isAdSetFilterContextCommandData(commandData)) {
        yield put(setFilterContextRequested(commandData));
    } else if (isAdRemoveFilterContextCommandData(commandData)) {
        yield put(removeFilterContextRequested(commandData));
    } else if (isAdRequestCancellationCommandData(commandData)) {
        yield handleCancelEditFromKD();
    } else if (isAdSetApiTokenCommandData(commandData)) {
        yield handleReceivedApiToken(commandData);
    } else if (isAdSetTimezoneCommandData(commandData)) {
        yield handleSetTimezoneCommand(commandData);
    } else {
        const invalidCommandError: ICommandFailedBody = {
            errorCode: GdcErrorType.InvalidCommand,
            errorMessage: "The command is inValid",
        };
        yield call(invalidCommand, invalidCommandError, contextId);
    }
}

export function* watchCommandReceived() {
    yield takeEvery(PostEventActionTypeKeys.COMMAND_RECEIVED, handleReceivedCommand);
}
