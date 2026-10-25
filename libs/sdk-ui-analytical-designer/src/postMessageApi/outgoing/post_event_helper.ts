// (C) 2020-2026 GoodData Corporation

import { GdcProductName } from "@gooddata/sdk-embedding";
import { messagingUtils } from "@gooddata/sdk-embedding/internal";

import { getHostAdapter } from "../../embedding/hostBridge.js";
import { DEFAULT_POST_MESSAGE_CONTEXT_ID } from "../actions/post_message_action_helper.js";

// data is the raw @gooddata/sdk-embedding contract payload — an opaque passthrough here
export const adPostEvent = (name: string, data: unknown, contextId?: string): void => {
    const resetDefaultContextId = (contextId?: string): string => {
        return contextId && contextId === DEFAULT_POST_MESSAGE_CONTEXT_ID ? undefined : contextId;
    };
    const hostAdapter = getHostAdapter();
    if (hostAdapter) {
        hostAdapter.onEvent({
            product: GdcProductName.ANALYTICAL_DESIGNER,
            name,
            data,
            contextId: resetDefaultContextId(contextId),
        });
        return;
    }
    messagingUtils.postEvent(
        GdcProductName.ANALYTICAL_DESIGNER,
        name,
        data as object,
        resetDefaultContextId(contextId),
    );
};
