// (C) 2007-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type IPostMessageContextPayload } from "@gooddata/sdk-embedding";

import { ActionTypeKeys } from "../constants/actions.js";
import { createPostMessageContextFromId } from "../postMessageApi/actions/post_message_action_helper.js";
import { type IVisualization } from "../typings/bear/bearTypes.js";

export const hideSuccessMessage = createAction(ActionTypeKeys.SAVE_REPORT_SUCCESS_MESSAGE_HIDE);

export type IHideSuccessMessageAction = ReturnType<typeof hideSuccessMessage>;

export const saveReportFinished = createAction(
    ActionTypeKeys.SAVE_REPORT_FINISHED,
    (reportMDObject: IVisualization, saveAsNew: boolean, time: number, editingFromKD = false) => ({
        payload: {
            reportMDObject,
            saveAsNew,
            time,
            editingFromKD,
        },
    }),
);

export const saveReportError = createAction(
    ActionTypeKeys.SAVE_REPORT_ERROR,
    (saveAsNew: boolean, time: number, editingFromKD = false, error?: Error) => ({
        payload: {
            saveAsNew,
            time,
            editingFromKD,
            error,
        },
    }),
);

export type ISaveReportErrorAction = ReturnType<typeof saveReportError>;

interface ISaveReportStartedActionPayload extends IPostMessageContextPayload {
    saveAsNew: boolean;
    editingFromKD?: boolean;
    timeoutId: number;
}

export const saveReportStarted = createAction(
    ActionTypeKeys.SAVE_REPORT_STARTED,
    (saveAsNew: boolean, timeoutId?: number, editingFromKD = false, postMessageContextId?: string) => {
        const postMessageContext: IPostMessageContextPayload =
            createPostMessageContextFromId(postMessageContextId);
        return {
            payload: {
                saveAsNew,
                editingFromKD,
                timeoutId,
                ...postMessageContext,
            } as ISaveReportStartedActionPayload,
        };
    },
);

export type ISaveReportStartedAction = ReturnType<typeof saveReportStarted>;

export interface ISaveReportRequestedActionPayload extends IPostMessageContextPayload {
    saveAsNew: boolean;
    editingFromKD?: boolean;
    reOpenEmbedDialog?: boolean;
}

export const saveReportRequested = createAction(
    ActionTypeKeys.SAVE_REPORT_REQUESTED,
    (saveAsNew: boolean, editingFromKD = false, postMessageContextId?: string, reOpenEmbedDialog = false) => {
        const postMessageContext: IPostMessageContextPayload =
            createPostMessageContextFromId(postMessageContextId);
        return {
            payload: {
                saveAsNew,
                editingFromKD,
                reOpenEmbedDialog,
                ...postMessageContext,
            } as ISaveReportRequestedActionPayload,
        };
    },
);

export type ISaveReportRequestedAction = ReturnType<typeof saveReportRequested>;

export const saveReportCheck = createAction(
    ActionTypeKeys.SAVE_REPORT_CHECK,
    (saveAsNew: boolean, editingFromKD = false, reOpenEmbedDialog = false) => ({
        payload: {
            saveAsNew,
            editingFromKD,
            reOpenEmbedDialog,
        },
    }),
);

export type ISaveReportCheckAction = ReturnType<typeof saveReportCheck>;

export const saveReportFromKD = createAction(ActionTypeKeys.SHOW_DIALOG_SAVE_REPORT_FROM_KD);
