// (C) 2020-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import {
    type AdSaveInsightCommandData,
    type GdcErrorType,
    type IAdSaveCommandBody,
    type IPostMessageContextPayload,
} from "@gooddata/sdk-embedding";
import { type IInsight } from "@gooddata/sdk-model";

import { type IVisualization } from "../../typings/bear/bearTypes.js";
import {
    DEFAULT_POST_MESSAGE_CONTEXT_ID,
    createPostMessageContextFromId,
} from "../actions/post_message_action_helper.js";

import { PostEventActionTypeKeys } from "./action_types.js";

type SaveInsightAction = IAdSaveCommandBody & IPostMessageContextPayload;

export interface ISaveInsightFailedActionPayload extends IPostMessageContextPayload {
    saveAsNew: boolean;
    time?: number;
    errorCode?: GdcErrorType;
}

export interface IInsightSavedActionPayload extends IPostMessageContextPayload {
    reportObjectForSaveEmbeddingMessage: IVisualization | IInsight;
    saveAsNew: boolean;
    time?: number;
}

export const saveInsightRequested = createAction(
    PostEventActionTypeKeys.SAVE_INSIGHT_REQUESTED,
    (saveInsightCommandData: AdSaveInsightCommandData) => {
        const { data: saveInsightCommandBody, contextId = DEFAULT_POST_MESSAGE_CONTEXT_ID } =
            saveInsightCommandData.gdc.event;
        const payload: SaveInsightAction = {
            ...saveInsightCommandBody,
            ...createPostMessageContextFromId(contextId),
        };
        return { payload };
    },
);

export type ISaveInsightRequestedAction = ReturnType<typeof saveInsightRequested>;

export const saveInsightFailed = createAction(
    PostEventActionTypeKeys.SAVE_INSIGHT_FAILED,
    (saveAsNew: boolean, time?: number, contextId?: string, errorType?: GdcErrorType) => {
        const payload: ISaveInsightFailedActionPayload = {
            saveAsNew,
            time,
            errorCode: errorType,
            ...createPostMessageContextFromId(contextId),
        };
        return { payload };
    },
);

export type ISaveInsightFailedAction = ReturnType<typeof saveInsightFailed>;

export const saveInsightFinished = createAction(
    PostEventActionTypeKeys.SAVE_INSIGHT_FINISHED,
    (
        reportObjectForSaveEmbeddingMessage: IVisualization | IInsight,
        saveAsNew: boolean,
        time?: number,
        contextId?: string,
    ) => {
        const payload: IInsightSavedActionPayload = {
            reportObjectForSaveEmbeddingMessage,
            saveAsNew,
            time,
            ...createPostMessageContextFromId(contextId),
        };
        return { payload };
    },
);

export type ISaveInsightFinishedAction = ReturnType<typeof saveInsightFinished>;
