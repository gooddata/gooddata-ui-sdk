// (C) 2007-2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { defineMessage } from "react-intl";
import { type Reducer } from "redux";

import { isDataTooLargeError, isTimeoutError } from "@gooddata/sdk-backend-spi";

import {
    DeleteReportFailureReason,
    deleteReportFailed,
    deleteReportFinished,
    deleteReportStarted,
    hideSuccessMessage as hideDeleteSuccessMessage,
} from "../../actions/delete_actions.js";
import {
    exportResultError,
    exportResultFinished,
    exportResultStarted,
    hideExportSuccessMessage,
} from "../../actions/export_report_actions.js";
import { measureDateDatasetsError } from "../../actions/measure_date_datasets_actions.js";
import {
    addMessage,
    dataSourceError,
    delayedLongSaving,
    hideMessage,
    showErrorMessage,
    showWarningMessage,
} from "../../actions/messages_actions.js";
import { exportReportError } from "../../actions/report_actions.js";
import {
    hideSuccessMessage as hideSaveSuccessMessage,
    saveReportError,
    saveReportFinished,
    saveReportStarted,
} from "../../actions/save_actions.js";
import { type IMessage, newMessage } from "../../models/message.js";
import { isSemanticBackendError } from "../../utils/error_classification.js";

import {
    type IMessagesState,
    MESSAGE_DATA_SOURCE_ERROR,
    MESSAGE_DELETE_REPORT_ERROR,
    MESSAGE_DELETE_REPORT_SUCCESS,
    MESSAGE_EXPORT_RESULT_ERROR,
    MESSAGE_EXPORT_RESULT_START,
    MESSAGE_EXPORT_RESULT_SUCCESS,
    MESSAGE_LONG_SAVING,
    MESSAGE_SAVE_REPORT_ERROR,
    MESSAGE_SAVE_REPORT_SUCCESS,
    MESSAGE_SHOW_WARNING,
    messagesInitialState,
} from "./messages_state.js";

// ——— draft helpers dissolved from services/messages_service.ts ———

interface IMessageConfiguration {
    delayed?: boolean;
    timeoutId?: number;
    messageData: {
        type: string;
        text?: string;
        node?: string;
        values?: Record<string, string>;
        errorDetails?: {
            id: string;
            values: Record<string, string>;
        };
    };
}

function pushMessage(state: IMessagesState, messageId: string, configuration: IMessageConfiguration): void {
    const { messageData, timeoutId, delayed = false } = configuration;

    const message = newMessage({
        id: messageId,
        type: messageData.type,
        text: messageData.text,
        node: messageData.node,
        values: messageData.values,
        errorDetails: messageData.errorDetails,
    });

    if (delayed) {
        state.delayed.push({ ...message, timeoutId });
    } else {
        state.displayed.push(message);
    }
}

function removeMessage(state: IMessagesState, messageId: string): void {
    state.delayed = state.delayed.filter((message: IMessage) => {
        if (message.id === messageId) {
            // cancelling a delayed message must also cancel its scheduled reveal
            clearTimeout(message.timeoutId);
            return false;
        }
        return true;
    });
    state.displayed = state.displayed.filter((message: IMessage) => message.id !== messageId);
}

function showDelayedMessage(state: IMessagesState, messageId: string): void {
    const delayedMessage = state.delayed.find((message: IMessage) => message.id === messageId);
    if (!delayedMessage) {
        // the delayed toast may already be gone (e.g. cancelled by an error in the same tick) —
        // never push a spread-of-undefined husk into displayed
        return;
    }

    state.delayed = state.delayed.filter((message: IMessage) => message.id !== messageId);
    // the former Record.delete("timeoutId") reset the field to its null default
    state.displayed.push({ ...delayedMessage, timeoutId: null });
}

// ——— case reducer bodies ———

// Shared by MESSAGES_DATA_SOURCE_ERROR and MEASURE_DATE_DATASETS_ERROR.
const handleDataSourceError = (state: IMessagesState, error: unknown) => {
    // Semantic backend errors (4xx) are not connectivity failures — suppress the toast
    // while leaving the action dispatch intact so the SSO 401 redirect saga keeps its signal.
    // Also clear any stale toast: a successful 4xx round-trip proves connectivity is fine.
    removeMessage(state, MESSAGE_DATA_SOURCE_ERROR);
    if (isSemanticBackendError(error)) {
        return;
    }

    pushMessage(state, MESSAGE_DATA_SOURCE_ERROR, {
        messageData: {
            type: "error",
            text: defineMessage({ id: "messages.connectionError" }).id,
        },
    });
};

// Shared by SHOW_ERROR_MESSAGE and REPORT_EXPORT_ERROR.
const handleShowErrorMessage = (state: IMessagesState, message: unknown, error: unknown) => {
    // this message has NO id, so HIDE_MESSAGE can never remove it
    state.displayed.push(
        newMessage({
            type: "error",
            text: typeof message === "string" ? message : "",
            values: { error: typeof error === "string" ? error : "" },
        }),
    );
};

const messagesSlice = createSlice({
    name: "messages",
    initialState: messagesInitialState,
    // Report/export domain actions are wired by their ActionTypeKeys string — their creators
    // stay in their own domain files.
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(saveReportError, (state) => {
                removeMessage(state, MESSAGE_LONG_SAVING);
                pushMessage(state, MESSAGE_SAVE_REPORT_ERROR, {
                    messageData: {
                        type: "error",
                        text: defineMessage({ id: "messages.saveReportError" }).id,
                    },
                });
            })
            .addCase(deleteReportStarted, (state) => {
                removeMessage(state, MESSAGE_DELETE_REPORT_ERROR);
            })
            .addCase(deleteReportFinished, (state) => {
                pushMessage(state, MESSAGE_DELETE_REPORT_SUCCESS, {
                    messageData: {
                        type: "success",
                        text: defineMessage({ id: "messages.deleteReportSuccess" }).id,
                    },
                });
            })
            .addCase(deleteReportFailed, (state, action) => {
                const text =
                    action.payload.reason === DeleteReportFailureReason.FAILED_TO_DELETE_REFERENCED_REPORT
                        ? defineMessage({ id: "messages.failedToDeleteReferencedReportError" }).id
                        : defineMessage({ id: "messages.deleteReportError" }).id;

                pushMessage(state, MESSAGE_DELETE_REPORT_ERROR, {
                    messageData: { type: "error", text },
                });
            })
            .addCase(exportResultStarted, (state) => {
                removeMessage(state, MESSAGE_EXPORT_RESULT_ERROR);
                removeMessage(state, MESSAGE_EXPORT_RESULT_SUCCESS);
                pushMessage(state, MESSAGE_EXPORT_RESULT_START, {
                    messageData: {
                        type: "progress",
                        text: defineMessage({ id: "messages.exportResultStart" }).id,
                    },
                });
            })
            .addCase(exportResultError, (state, action) => {
                removeMessage(state, MESSAGE_EXPORT_RESULT_START);

                const error = action.payload;

                if (isDataTooLargeError(error)) {
                    const limitBreak = error.responseBody?.structuredDetail?.limitBreaks?.[0];
                    if (limitBreak?.limitType == "export-rows") {
                        // The too-many-rows toast needs the user locale to format the row
                        // counts — a cross-domain read a case reducer must not do.
                        // sagas/messages_sagas.ts watches the same action and adds the toast
                        // (with this same MESSAGE_EXPORT_RESULT_ERROR id) via MESSAGES_ADD.
                        return;
                    }
                }

                if (isTimeoutError(error)) {
                    pushMessage(state, MESSAGE_EXPORT_RESULT_ERROR, {
                        messageData: {
                            type: "error",
                            text: defineMessage({ id: "messages.exportResultError.timeout" }).id,
                        },
                    });
                    return;
                }

                pushMessage(state, MESSAGE_EXPORT_RESULT_ERROR, {
                    messageData: {
                        type: "error",
                        text: defineMessage({ id: "messages.exportResultError" }).id,
                    },
                });
            })
            .addCase(exportResultFinished, (state) => {
                removeMessage(state, MESSAGE_EXPORT_RESULT_START);
                pushMessage(state, MESSAGE_EXPORT_RESULT_SUCCESS, {
                    messageData: {
                        type: "success",
                        text: defineMessage({ id: "messages.exportResultSuccess" }).id,
                    },
                });
            })
            .addCase(hideExportSuccessMessage, (state) => {
                removeMessage(state, MESSAGE_EXPORT_RESULT_SUCCESS);
            })
            .addCase(hideMessage, (state, action) => {
                removeMessage(state, action.payload.messageId);
            })
            .addCase(saveReportStarted, (state, action) => {
                pushMessage(state, MESSAGE_LONG_SAVING, {
                    messageData: {
                        type: "progress",
                        text: defineMessage({ id: "messages.longSaving" }).id,
                    },
                    delayed: true,
                    timeoutId: action.payload.timeoutId,
                });
                removeMessage(state, MESSAGE_SAVE_REPORT_ERROR);
            })
            .addCase(delayedLongSaving, (state) => {
                showDelayedMessage(state, MESSAGE_LONG_SAVING);
            })
            .addCase(saveReportFinished, (state) => {
                removeMessage(state, MESSAGE_LONG_SAVING);
                removeMessage(state, MESSAGE_SAVE_REPORT_SUCCESS);
                pushMessage(state, MESSAGE_SAVE_REPORT_SUCCESS, {
                    messageData: {
                        type: "success",
                        text: defineMessage({ id: "messages.saveReportSuccess" }).id,
                    },
                });
            })
            .addCase(hideSaveSuccessMessage, (state) => {
                removeMessage(state, MESSAGE_SAVE_REPORT_SUCCESS);
            })
            .addCase(hideDeleteSuccessMessage, (state) => {
                removeMessage(state, MESSAGE_DELETE_REPORT_SUCCESS);
            })
            .addCase(dataSourceError, (state, action) => {
                handleDataSourceError(state, action.payload?.error);
            })
            .addCase(measureDateDatasetsError, (state, action) => {
                handleDataSourceError(state, action.payload?.error);
            })
            .addCase(showErrorMessage, (state, action) => {
                handleShowErrorMessage(state, action.payload.message, action.payload.error);
            })
            .addCase(exportReportError, (state, action) => {
                // the caught export error is probed for the two fields the toast shows
                const errorProbe = action.payload as { message?: string; error?: unknown } | undefined;
                handleShowErrorMessage(state, errorProbe?.message, errorProbe?.error);
            })
            .addCase(showWarningMessage, (state, action) => {
                pushMessage(state, MESSAGE_SHOW_WARNING, {
                    messageData: {
                        type: "warning",
                        text: action.payload.message,
                    },
                });
            })
            .addCase(addMessage, (state, action) => {
                const { translationKey, id, type, values, errorDetails } = action.payload;

                pushMessage(state, id ?? translationKey, {
                    messageData: {
                        type,
                        text: translationKey,
                        values,
                        errorDetails,
                    },
                });
            });
    },
});

/** The appState.messages slice reducer, mounted via messages_reducer.ts. */
export const messagesSliceReducer: Reducer<IMessagesState> = messagesSlice.reducer;
