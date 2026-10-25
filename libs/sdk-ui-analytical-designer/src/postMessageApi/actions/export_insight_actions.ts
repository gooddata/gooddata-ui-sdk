// (C) 2020-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type UnexpectedResponseError, isUnexpectedResponseError } from "@gooddata/sdk-backend-spi";
import {
    type AdExportInsightCommandData,
    GdcErrorType,
    type IAdExportInsightCommandBody,
    type IPostMessageContextPayload,
} from "@gooddata/sdk-embedding";
import { type IExtendedExportConfig } from "@gooddata/sdk-ui";

import {
    DEFAULT_POST_MESSAGE_CONTEXT_ID,
    createPostMessageContextFromId,
} from "../actions/post_message_action_helper.js";

import { PostEventActionTypeKeys } from "./action_types.js";

type ExportInsightActionPayload = IPostMessageContextPayload & IAdExportInsightCommandBody;

export interface IOutputExportInsightActionPayload extends IPostMessageContextPayload, IExtendedExportConfig {
    projectId: string;
    time?: number;
    exportFileLink?: string;
    errorCode?: GdcErrorType;
    errorMessage?: string;
}

export interface IExportInsightLogInfo {
    projectId: string;
    exportConfig: IExtendedExportConfig;
    exportFileLink?: string;
    time?: number;
    errorCode?: GdcErrorType;
    errorMessage?: string;
    runTimeError?: UnexpectedResponseError | Error;
    contextId?: string;
}

export const exportInsightRequested = createAction(
    PostEventActionTypeKeys.EXPORT_INSIGHT_REQUESTED,
    (exportInsightCommandData: AdExportInsightCommandData) => {
        const { data: exportInsightCommandBody, contextId = DEFAULT_POST_MESSAGE_CONTEXT_ID } =
            exportInsightCommandData.gdc.event;
        const payload: ExportInsightActionPayload = {
            ...exportInsightCommandBody,
            ...createPostMessageContextFromId(contextId),
        };
        return { payload };
    },
);

export type IExportInsightRequestedAction = ReturnType<typeof exportInsightRequested>;

function getOutputExportInsightActionPayload({
    projectId,
    contextId,
    exportFileLink,
    errorCode,
    errorMessage,
    runTimeError,
    exportConfig: { format, includeFilterContext, mergeHeaders, delimiter },
}: IExportInsightLogInfo): IOutputExportInsightActionPayload {
    const postMessageContext: IPostMessageContextPayload = createPostMessageContextFromId(contextId);

    return {
        projectId,
        format,
        includeFilterContext,
        mergeHeaders,
        delimiter,
        exportFileLink,
        errorCode: isUnexpectedResponseError(runTimeError) ? GdcErrorType.RuntimeError : errorCode, // TODO SDK8 convert the error code properly when the types are in SDK8
        errorMessage: isUnexpectedResponseError(runTimeError) ? runTimeError.message : errorMessage,
        ...postMessageContext,
    };
}

export const exportInsightFailed = createAction(
    PostEventActionTypeKeys.EXPORT_INSIGHT_FAILED,
    (exportLogInfo: IExportInsightLogInfo) => ({
        payload: getOutputExportInsightActionPayload(exportLogInfo),
    }),
);

export const exportInsightFinished = createAction(
    PostEventActionTypeKeys.EXPORT_INSIGHT_FINISHED,
    (exportLogInfo: IExportInsightLogInfo) => ({
        payload: getOutputExportInsightActionPayload(exportLogInfo),
    }),
);

export type IOutputExportInsightAction =
    | ReturnType<typeof exportInsightFailed>
    | ReturnType<typeof exportInsightFinished>;
