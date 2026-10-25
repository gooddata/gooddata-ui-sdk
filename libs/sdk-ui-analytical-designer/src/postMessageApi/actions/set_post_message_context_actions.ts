// (C) 2020-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { createPostMessageContextFromId } from "../actions/post_message_action_helper.js";
import { PostMessageStoreActionTypes } from "../state/store_action_types.js";

export const setPostMessageContext = createAction(
    PostMessageStoreActionTypes.SET_POST_MESSAGE_CONTEXT,
    (postMessageContextId: string) => ({
        payload: createPostMessageContextFromId(postMessageContextId),
    }),
);
