// (C) 2007-2026 GoodData Corporation

// @vitest-environment node

import { type UnknownAction } from "redux";
import { describe, expect, it } from "vitest";

import { DataTooLargeError, TimeoutError, UnexpectedResponseError } from "@gooddata/sdk-backend-spi";
import { type IExtendedExportConfig } from "@gooddata/sdk-ui";

import { DeleteReportFailureReason, deleteReportFailed } from "../../actions/delete_actions.js";
import { exportResultError } from "../../actions/export_report_actions.js";
import { MeasureDateDatasetsActions } from "../../actions/measure_date_datasets_actions.js";
import {
    addMessage,
    dataSourceError,
    hideMessage,
    showErrorMessage,
} from "../../actions/messages_actions.js";
import { saveReportError, saveReportFinished, saveReportStarted } from "../../actions/save_actions.js";
import { ActionTypeKeys } from "../../constants/actions.js";
import { type IMessage } from "../../models/message.js";
import { combinedRootReducer } from "../../reducers/combined_root_reducer.js";
import { initialState } from "../../reducers/initial_state.js";
import { withAppState } from "../../tests/state_builder.test.helpers.js";
import { type IVisualization } from "../../typings/bear/bearTypes.js";
import { type IAppState } from "../types.js";

import {
    type IMessagesState,
    MESSAGE_DATA_SOURCE_ERROR,
    MESSAGE_LONG_SAVING,
    MESSAGE_SAVE_REPORT_ERROR,
    MESSAGE_SAVE_REPORT_SUCCESS,
    messagesInitialState,
} from "./messages_state.js";

// The tests drive the LIFTED reducer with a whole root state, the way the slice runs in the root
// chain (see store/highlighting/test).
const messagesOf = (state: IAppState): IMessagesState => state.appState.messages;
const reduce = (state: IAppState, action: UnknownAction): IMessagesState =>
    messagesOf(combinedRootReducer(state, action));
const withMessages = (partial: Partial<IMessagesState>): IAppState =>
    withAppState(combinedRootReducer(initialState, { type: "@@SEED" }), {
        messages: {
            ...messagesInitialState,
            ...partial,
        },
    }) as IAppState;

describe("messages store", () => {
    const TIMEOUT_ID = 12345;

    it("should self-initialize the subtree from the slice initial state", () => {
        const updated = combinedRootReducer(initialState, { type: "@@ANY" });

        expect(messagesOf(updated)).toEqual(messagesInitialState);
    });

    describe(`#${ActionTypeKeys.SAVE_REPORT_ERROR}`, () => {
        it("should add save report error to the displayed messages", () => {
            const action = saveReportError(true, 123, false);

            const messages = reduce(initialState, action);

            expect(messages.displayed).toEqual([
                {
                    id: MESSAGE_SAVE_REPORT_ERROR,
                    type: "error",
                    text: "messages.saveReportError",
                    node: null,
                    values: null,
                    errorDetails: null,
                    timeoutId: null,
                    errorDetail: null,
                    showLess: null,
                    showMore: null,
                },
            ]);
        });

        it("should remove message report takes too long if present", () => {
            const action = saveReportError(true, 123, false);

            const stateWithDelayedMessage = withMessages({
                delayed: [{ id: MESSAGE_LONG_SAVING } as IMessage],
            });

            const messages = reduce(stateWithDelayedMessage, action);

            expect(messages.delayed).toEqual([]);
        });
    });

    describe(`#${ActionTypeKeys.HIDE_MESSAGE}`, () => {
        it("should remove displayed messages with given id", () => {
            const action = hideMessage(MESSAGE_SAVE_REPORT_SUCCESS);

            const stateWithMessage = withMessages({
                displayed: [{ id: MESSAGE_SAVE_REPORT_SUCCESS } as IMessage],
            });

            const messages = reduce(stateWithMessage, action);

            expect(messages.displayed).toEqual([]);
        });

        it("should remove delayed messages with given id", () => {
            const action = hideMessage(MESSAGE_SAVE_REPORT_SUCCESS);

            const stateWithMessage = withMessages({
                delayed: [{ id: MESSAGE_SAVE_REPORT_SUCCESS } as IMessage],
            });

            const messages = reduce(stateWithMessage, action);

            expect(messages.delayed).toEqual([]);
        });
    });

    describe(`#${ActionTypeKeys.SAVE_REPORT_STARTED}`, () => {
        const longSavingMessage: IMessagesState["displayed"][number] = {
            id: MESSAGE_LONG_SAVING,
            text: "messages.longSaving",
            type: "progress",
            node: null,
            values: null,
            errorDetails: null,
            timeoutId: TIMEOUT_ID,
            errorDetail: null,
            showLess: null,
            showMore: null,
        };

        it("should add long saving to the delayed messages", () => {
            const messages = reduce(initialState, saveReportStarted(true, TIMEOUT_ID));

            expect(messages.delayed).toEqual([longSavingMessage]);
        });

        it("should remove saving report error from messages", () => {
            const stateWithMessage = withMessages({
                delayed: [{ id: MESSAGE_SAVE_REPORT_ERROR } as IMessage],
            });

            const messages = reduce(stateWithMessage, saveReportStarted(true, TIMEOUT_ID));

            expect(messages.delayed).toEqual([longSavingMessage]);
        });
    });

    describe(`#${ActionTypeKeys.MESSAGES_DATA_SOURCE_ERROR}`, () => {
        const sampleError = {
            message: "Not Found",
        };
        const expectedMessage: IMessage = {
            id: MESSAGE_DATA_SOURCE_ERROR,
            type: "error",
            text: "messages.connectionError",
            node: null,
            values: null,
            errorDetails: null,
            timeoutId: null,
            errorDetail: null,
            showLess: null,
            showMore: null,
        };

        it("should add the data source error message", () => {
            const messages = reduce(initialState, dataSourceError(sampleError));

            expect(messages.displayed).toEqual([expectedMessage]);
        });

        it("should remove previous data source error messages", () => {
            const state = combinedRootReducer(initialState, dataSourceError(sampleError));
            const messages = reduce(state, dataSourceError(sampleError));

            expect(messages.displayed).toEqual([expectedMessage]);
        });

        it("should NOT add the toast when the error is a semantic backend 4xx", () => {
            const error = new UnexpectedResponseError("Bad request", 400, {});

            const messages = reduce(initialState, dataSourceError(error));

            expect(messages.displayed).toEqual([]);
        });

        it("should add the toast when the error is a 5xx (e.g., real connection failure)", () => {
            const error = new UnexpectedResponseError("Server error", 500, {});

            const messages = reduce(initialState, dataSourceError(error));

            expect(messages.displayed).toEqual([expectedMessage]);
        });

        it("should clear a stale connection toast when a 4xx arrives (round-trip proves connectivity)", () => {
            const stateWith5xxToast = combinedRootReducer(
                initialState,
                dataSourceError(new UnexpectedResponseError("Server error", 500, {})),
            );
            expect(messagesOf(stateWith5xxToast).displayed).toEqual([expectedMessage]);

            const messages = reduce(
                stateWith5xxToast,
                dataSourceError(new UnexpectedResponseError("Bad request", 400, {})),
            );

            expect(messages.displayed).toEqual([]);
        });
    });

    describe(`#${ActionTypeKeys.SAVE_REPORT_FINISHED}`, () => {
        const report: IVisualization = {
            visualizationObject: {
                content: {
                    visualizationClass: {
                        uri: "/gdc/md/project/obj/666",
                    },
                    buckets: [],
                },
                meta: {
                    title: "report",
                    uri: "/gdc/md/project/obj/12345",
                    author: "/gdc/account/profile/3549d3c12c12a736e4ee3abbbb044ae1",
                    contributor: "/gdc/account/profile/3549d3c12c12a736e4ee3abbbb044ae1",
                    category: "visualizationObject",
                    identifier: "foo",
                    deprecated: "0",
                    isProduction: 1,
                    created: "",
                    updated: "",
                    summary: "",
                    tags: [],
                },
            },
        };

        it("should remove message long saving from delayed messages", () => {
            const action = saveReportFinished(report, true, 123, false);

            const stateWithDelayedMessage = withMessages({
                delayed: [{ id: MESSAGE_LONG_SAVING } as IMessage],
            });

            const messages = reduce(stateWithDelayedMessage, action);

            expect(messages.delayed).toEqual([]);
        });

        it("should keep only one message about succ. report saving", () => {
            const action = saveReportFinished(report, true, 123, false);

            const stateWithReportFinishedMessage = withMessages({
                displayed: [{ id: MESSAGE_SAVE_REPORT_SUCCESS } as IMessage],
            });

            const messages = reduce(stateWithReportFinishedMessage, action);

            expect(messages.displayed).toEqual([
                {
                    errorDetail: null,
                    showLess: null,
                    showMore: null,
                    node: null,
                    values: null,
                    errorDetails: null,
                    id: MESSAGE_SAVE_REPORT_SUCCESS,
                    text: "messages.saveReportSuccess",
                    timeoutId: null,
                    type: "success",
                },
            ]);
        });
    });

    describe(`#${ActionTypeKeys.SHOW_ERROR_MESSAGE}`, () => {
        it("should add error message to the displayed messages", () => {
            const action = showErrorMessage("hello.world", "Not enough data points.");

            const messages = reduce(initialState, action);

            expect(messages.displayed).toMatchObject([
                { type: "error", text: "hello.world", values: { error: "Not enough data points." } },
            ]);
        });
    });

    describe(`#${ActionTypeKeys.MEASURE_DATE_DATASETS_ERROR}`, () => {
        it("should add error message to the displayed messages", () => {
            const action = dataSourceError("hello.world");
            const messages = reduce(initialState, action);

            expect(messages.displayed).toMatchObject([{ type: "error" }]);
        });

        it("should NOT add the toast when the date-dataset error is a semantic backend 4xx", () => {
            const error = new UnexpectedResponseError("Bad request", 400, {});
            const action = MeasureDateDatasetsActions.measureDateDatasetsError("local-1", error);

            const messages = reduce(initialState, action);

            expect(messages.displayed).toEqual([]);
        });

        it("should add the toast when the date-dataset error is a 5xx", () => {
            const error = new UnexpectedResponseError("Server error", 500, {});
            const action = MeasureDateDatasetsActions.measureDateDatasetsError("local-1", error);

            const messages = reduce(initialState, action);

            expect(messages.displayed).toMatchObject([{ type: "error" }]);
        });
    });

    describe(`#${ActionTypeKeys.DELETE_REPORT_ERROR}`, () => {
        it("should add generic error message to the displayed messages", () => {
            const action = deleteReportFailed(100, DeleteReportFailureReason.UNKNOWN);
            const messages = reduce(initialState, action);

            expect(messages.displayed).toMatchObject([
                {
                    type: "error",
                    text: "messages.deleteReportError",
                },
            ]);
        });

        it("should add specific error message to the displayed messages", () => {
            const action = deleteReportFailed(
                100,
                DeleteReportFailureReason.FAILED_TO_DELETE_REFERENCED_REPORT,
            );
            const messages = reduce(initialState, action);

            expect(messages.displayed).toMatchObject([
                {
                    type: "error",
                    text: "messages.failedToDeleteReferencedReportError",
                },
            ]);
        });
    });

    describe(`#${ActionTypeKeys.EXPORT_RESULT_ERROR}`, () => {
        const id = "d2b52c8e-b5eb-497d-810a-3d2b57cba0ac";
        const projectId = "my-project-id";
        const startTime = 1551090435592;
        const duration = 20;
        const exportConfig = { title: "Export", format: "csv" } as IExtendedExportConfig;

        it("should add generic export error message for an unrecognized error", () => {
            const error = new Error("boom");
            const action = exportResultError(id, projectId, startTime, duration, error, exportConfig);

            const messages = reduce(initialState, action);

            expect(messages.displayed).toMatchObject([
                {
                    type: "error",
                    text: "messages.exportResultError",
                },
            ]);
        });

        it("should leave the too-many-rows toast to the messages saga (locale is a foreign read)", () => {
            const error = new DataTooLargeError("too large", undefined, {
                structuredDetail: {
                    limitBreaks: [{ limitType: "export-rows", limit: 1000, actualValue: 1500 }],
                },
            });
            const action = exportResultError(id, projectId, startTime, duration, error, exportConfig);

            const stateWithProgress = combinedRootReducer(initialState, {
                type: ActionTypeKeys.EXPORT_RESULT_STARTED,
            });
            const messages = reduce(stateWithProgress, action);

            // the progress toast is removed here; the toast itself arrives via MESSAGES_ADD
            // from sagas/messages_sagas.ts (covered in sagas/test/messages_sagas.test.ts)
            expect(messages.displayed).toEqual([]);
        });

        it("should add the timeout message for a TimeoutError", () => {
            const error = new TimeoutError("export timed out");
            const action = exportResultError(id, projectId, startTime, duration, error, exportConfig);

            const messages = reduce(initialState, action);

            expect(messages.displayed).toMatchObject([
                {
                    type: "error",
                    text: "messages.exportResultError.timeout",
                },
            ]);
        });
    });

    describe(`#${ActionTypeKeys.MESSAGES_ADD}`, () => {
        it("should add message", () => {
            const action = addMessage({
                type: "success",
                translationKey: "translationKey",
            });
            const messages = reduce(initialState, action);

            expect(messages.displayed).toMatchObject([
                {
                    id: "translationKey",
                    type: "success",
                    timeoutId: null,
                    text: "translationKey",
                },
            ]);
        });

        it("should honor an explicit id distinct from the translation key", () => {
            const action = addMessage({
                type: "error",
                translationKey: "messages.exportResultError.tooManyRows",
                id: "export_result_error",
                values: { actual: "1,500", limit: "1,000" },
            });
            const messages = reduce(initialState, action);

            expect(messages.displayed).toMatchObject([
                {
                    id: "export_result_error",
                    text: "messages.exportResultError.tooManyRows",
                    values: { actual: "1,500", limit: "1,000" },
                },
            ]);
        });
    });
});
