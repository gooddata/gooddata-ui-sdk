// (C) 2021-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type IPostMessageContextPayload } from "@gooddata/sdk-embedding";

import { PostEventActionTypeKeys } from "./action_types.js";
import {
    DEFAULT_POST_MESSAGE_CONTEXT_ID,
    createPostMessageContextFromId,
} from "./post_message_action_helper.js";

export interface IInsecureCommandFailedActionPayload extends IPostMessageContextPayload {
    commandType: string;
}

export const insecureCommandFailed = createAction(
    PostEventActionTypeKeys.INSECURE_COMMAND_FAILED,
    (commandType: string, contextId: string = DEFAULT_POST_MESSAGE_CONTEXT_ID) => {
        const payload: IInsecureCommandFailedActionPayload = {
            commandType,
            ...createPostMessageContextFromId(contextId),
        };
        return { payload };
    },
);

export type IInsecureCommandFailedAction = ReturnType<typeof insecureCommandFailed>;

export const hostVerificationFailed = createAction(
    PostEventActionTypeKeys.HOST_VERIFICATION_FAILED,
    (contextId: string = DEFAULT_POST_MESSAGE_CONTEXT_ID) => ({
        payload: createPostMessageContextFromId(contextId),
    }),
);
