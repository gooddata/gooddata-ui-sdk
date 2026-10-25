// (C) 2020-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type AdRedoCommandData } from "@gooddata/sdk-embedding";

import { PostEventActionTypeKeys } from "./action_types.js";
import {
    DEFAULT_POST_MESSAGE_CONTEXT_ID,
    createPostMessageContextFromId,
} from "./post_message_action_helper.js";

export const redoRequested = createAction(
    PostEventActionTypeKeys.REDO_REQUESTED,
    (redoData: AdRedoCommandData) => {
        const { contextId = DEFAULT_POST_MESSAGE_CONTEXT_ID } = redoData.gdc.event;
        return { payload: createPostMessageContextFromId(contextId) };
    },
);

export type IRedoRequestedAction = ReturnType<typeof redoRequested>;

export const redoFailed = createAction(PostEventActionTypeKeys.REDO_FAILED, (contextId: string) => ({
    payload: createPostMessageContextFromId(contextId),
}));

export type IRedoFailedAction = ReturnType<typeof redoFailed>;

export const redoFinished = createAction(PostEventActionTypeKeys.REDO_FINISHED, (contextId: string) => ({
    payload: createPostMessageContextFromId(contextId),
}));

export type IRedoFinishedAction = ReturnType<typeof redoFinished>;
