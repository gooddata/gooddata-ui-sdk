// (C) 2020-2026 GoodData Corporation

import { type IPostMessageContextPayload } from "@gooddata/sdk-embedding";

export const DEFAULT_POST_MESSAGE_CONTEXT_ID = "DEFAULT_POST_MESSAGE_CONTEXT_ID";

export interface IPostMessageContextContent {
    contextId: string;
}

export function createPostMessageContextFromId(contextId?: string): IPostMessageContextPayload {
    return {
        postMessageContext: {
            contextId: contextId,
        },
    };
}
