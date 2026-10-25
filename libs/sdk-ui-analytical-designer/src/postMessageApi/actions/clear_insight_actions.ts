// (C) 2020-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type AdClearCommandData } from "@gooddata/sdk-embedding";

import { PostEventActionTypeKeys } from "./action_types.js";
import {
    DEFAULT_POST_MESSAGE_CONTEXT_ID,
    createPostMessageContextFromId,
} from "./post_message_action_helper.js";

export const clearInsightRequested = createAction(
    PostEventActionTypeKeys.CLEAR_INSIGHT_REQUESTED,
    (clearData: AdClearCommandData) => {
        const { contextId = DEFAULT_POST_MESSAGE_CONTEXT_ID } = clearData.gdc.event;
        return { payload: createPostMessageContextFromId(contextId) };
    },
);

export type IClearInsightRequestedAction = ReturnType<typeof clearInsightRequested>;

export const clearInsightFailed = createAction(
    PostEventActionTypeKeys.CLEAR_INSIGHT_FAILED,
    (contextId?: string) => ({ payload: createPostMessageContextFromId(contextId) }),
);

export type IClearInsightFailedAction = ReturnType<typeof clearInsightFailed>;

export const clearInsightFished = createAction(
    PostEventActionTypeKeys.CLEAR_INSIGHT_FINISHED,
    (contextId?: string) => ({ payload: createPostMessageContextFromId(contextId) }),
);

export type IClearInsightFinishedAction = ReturnType<typeof clearInsightFished>;
