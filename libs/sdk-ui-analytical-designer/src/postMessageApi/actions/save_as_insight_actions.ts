// (C) 2020-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import {
    type AdSaveAsInsightCommandData,
    type IAdSaveAsInsightCommandBody,
    type IPostMessageContextPayload,
} from "@gooddata/sdk-embedding";

import {
    DEFAULT_POST_MESSAGE_CONTEXT_ID,
    createPostMessageContextFromId,
} from "../actions/post_message_action_helper.js";

import { PostEventActionTypeKeys } from "./action_types.js";

type SaveAsInsightActionPayload = IAdSaveAsInsightCommandBody & IPostMessageContextPayload;

export const saveAsInsightRequested = createAction(
    PostEventActionTypeKeys.SAVE_AS_INSIGHT_REQUESTED,
    (saveAsInsightCommandData: AdSaveAsInsightCommandData) => {
        const { data: saveAsInsightCommandBody, contextId = DEFAULT_POST_MESSAGE_CONTEXT_ID } =
            saveAsInsightCommandData.gdc.event;
        const payload: SaveAsInsightActionPayload = {
            ...saveAsInsightCommandBody,
            ...createPostMessageContextFromId(contextId),
        };
        return { payload };
    },
);

export type ISaveAsInsightRequestedAction = ReturnType<typeof saveAsInsightRequested>;
