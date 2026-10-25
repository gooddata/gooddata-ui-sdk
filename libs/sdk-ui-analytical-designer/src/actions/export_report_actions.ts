// (C) 2007-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";
import { BAD_REQUEST, getStatusText } from "http-status-codes";

import {
    type IDashboardExportRawOptions,
    type UnexpectedResponseError,
    isProtectedDataError,
    isUnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";
import { type IPostMessageContextPayload } from "@gooddata/sdk-embedding";
import { type IExportFunction, type IExtendedExportConfig } from "@gooddata/sdk-ui";

import { ActionTypeKeys } from "../constants/actions.js";
import { createPostMessageContextFromId } from "../postMessageApi/actions/post_message_action_helper.js";

// == EXPORT DIALOG

export const showDialogExportReport = createAction(ActionTypeKeys.SHOW_DIALOG_EXPORT_REPORT);

export const showDialogExportPdf = createAction(ActionTypeKeys.SHOW_DIALOG_EXPORT_PDF);

export type ExportCsvMode = "formatted" | "raw";

export const showDialogExportCsv = createAction(
    ActionTypeKeys.SHOW_DIALOG_EXPORT_CSV,
    (mode: ExportCsvMode) => ({ payload: { mode } }),
);

// == EXPORT RESULT

export interface IExportResultActionPayload extends IPostMessageContextPayload {
    exportConfig: IExtendedExportConfig;
}

export const exportResult = createAction(
    ActionTypeKeys.EXPORT_RESULT,
    (
        exportConfig: IExtendedExportConfig,
        postMessageContextId?: string,
    ): { payload: IExportResultActionPayload } => {
        const postMessageContext: IPostMessageContextPayload =
            createPostMessageContextFromId(postMessageContextId);

        return { payload: { exportConfig, ...postMessageContext } };
    },
);

export type IExportResultAction = ReturnType<typeof exportResult>;

export const exportResultReady = createAction(
    ActionTypeKeys.EXPORT_RESULT_READY,
    (exportResultFunction: IExportFunction) => ({ payload: { exportResultFunction } }),
);

export type IExportResultReadyAction = ReturnType<typeof exportResultReady>;

export const exportResultStarted = createAction(
    ActionTypeKeys.EXPORT_RESULT_STARTED,
    (id: string, projectId: string, startTime: number, exportConfig: IExtendedExportConfig) => ({
        payload: undefined,
        meta: { id, startTime, projectId, exportConfig },
    }),
);

/**
 * Declared rather than inferred: the status/protected-data fields are spread in from one of three
 * branches, so inference would produce a union in which `meta.statusCode` does not exist on every
 * member — and its reader (the error dialog) reads it unconditionally.
 */
export interface IExportResultErrorMeta {
    id: string;
    projectId: string;
    startTime: number;
    duration: number;
    statusCode?: string;
    statusText?: string;
    isProtectedDataError?: boolean;
    exportConfig: IExtendedExportConfig;
}

export const exportResultError = createAction(
    ActionTypeKeys.EXPORT_RESULT_ERROR,
    (
        id: string,
        projectId: string,
        startTime: number,
        duration: number,
        error: UnexpectedResponseError | Error,
        exportConfig: IExtendedExportConfig,
    ): { payload: Error; meta: IExportResultErrorMeta } => {
        const resultErrorMeta = isUnexpectedResponseError(error)
            ? { statusCode: String(error.httpStatus), statusText: getStatusText(error.httpStatus) }
            : isProtectedDataError(error)
              ? {
                    statusCode: String(BAD_REQUEST),
                    statusText: getStatusText(BAD_REQUEST),
                    isProtectedDataError: true,
                }
              : {};

        return {
            payload: error,
            meta: { id, projectId, startTime, duration, exportConfig, ...resultErrorMeta },
        };
    },
);

export type IExportResultErrorAction = ReturnType<typeof exportResultError>;

export const exportResultFinished = createAction(
    ActionTypeKeys.EXPORT_RESULT_FINISHED,
    (
        id: string,
        projectId: string,
        startTime: number,
        duration: number,
        uri: string,
        exportConfig: IExtendedExportConfig,
    ) => ({
        payload: undefined,
        meta: { id, projectId, startTime, duration, uri, exportConfig },
    }),
);

export const hideExportSuccessMessage = createAction(ActionTypeKeys.EXPORT_RESULT_SUCCESS_MESSAGE_HIDE);

export const exportRaw = createAction(
    ActionTypeKeys.RAW_EXPORT_REQUESTED,
    (title: string, options?: IDashboardExportRawOptions) => ({ payload: { title, options } }),
);

export type IExportRawAction = ReturnType<typeof exportRaw>;
