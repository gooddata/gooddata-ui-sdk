// (C) 2020-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type AdUndoCommandData } from "@gooddata/sdk-embedding";

import { PostEventActionTypeKeys } from "./action_types.js";
import {
    DEFAULT_POST_MESSAGE_CONTEXT_ID,
    createPostMessageContextFromId,
} from "./post_message_action_helper.js";

export const undoRequested = createAction(
    PostEventActionTypeKeys.UNDO_REQUESTED,
    (undoData: AdUndoCommandData) => {
        const { contextId = DEFAULT_POST_MESSAGE_CONTEXT_ID } = undoData.gdc.event;
        return { payload: createPostMessageContextFromId(contextId) };
    },
);

export type IUndoRequestedAction = ReturnType<typeof undoRequested>;

export const undoFailed = createAction(PostEventActionTypeKeys.UNDO_FAILED, (contextId: string) => ({
    payload: createPostMessageContextFromId(contextId),
}));

export type IUndoFailedAction = ReturnType<typeof undoFailed>;

export const undoFinished = createAction(PostEventActionTypeKeys.UNDO_FINISHED, (contextId: string) => ({
    payload: createPostMessageContextFromId(contextId),
}));

export type IUndoFinishedAction = ReturnType<typeof undoFinished>;
