// (C) 2021-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type AdClearInsightCommandData } from "@gooddata/sdk-embedding";

import { PostEventActionTypeKeys } from "./action_types.js";
import {
    DEFAULT_POST_MESSAGE_CONTEXT_ID,
    createPostMessageContextFromId,
} from "./post_message_action_helper.js";

export const clearInsightContentRequested = createAction(
    PostEventActionTypeKeys.CLEAR_INSIGHT_CONTENT_REQUESTED,
    (clearInsightContentData: AdClearInsightCommandData) => {
        const { contextId = DEFAULT_POST_MESSAGE_CONTEXT_ID } = clearInsightContentData.gdc.event;
        return { payload: createPostMessageContextFromId(contextId) };
    },
);

export type IClearInsightContentRequestedAction = ReturnType<typeof clearInsightContentRequested>;

export const clearInsightContentFailed = createAction(
    PostEventActionTypeKeys.CLEAR_INSIGHT_CONTENT_FAILED,
    (contextId?: string) => ({ payload: createPostMessageContextFromId(contextId) }),
);

export type IClearInsightContentFailedAction = ReturnType<typeof clearInsightContentFailed>;

export const clearInsightContentFished = createAction(
    PostEventActionTypeKeys.CLEAR_INSIGHT_CONTENT_FINISHED,
    (contextId?: string) => ({ payload: createPostMessageContextFromId(contextId) }),
);

export type IClearInsightContentFinishedAction = ReturnType<typeof clearInsightContentFished>;
