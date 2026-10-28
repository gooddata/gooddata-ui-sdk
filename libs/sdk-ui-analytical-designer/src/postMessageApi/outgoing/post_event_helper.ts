// (C) 2020-2026 GoodData Corporation

import { GdcProductName } from "@gooddata/sdk-embedding";
import { messagingUtils } from "@gooddata/sdk-embedding/internal";

import {
    type AnalyticalDesignerEvent,
    type AnalyticalDesignerEventType,
    type IAnalyticalDesignerEventDataMap,
} from "../../embedding/analyticalDesignerTypes.js";
import { type IAdHostAdapter, getHostAdapter } from "../../embedding/hostBridge.js";
import { DEFAULT_POST_MESSAGE_CONTEXT_ID } from "../actions/post_message_action_helper.js";

const resetDefaultContextId = (contextId?: string): string => {
    return contextId && contextId === DEFAULT_POST_MESSAGE_CONTEXT_ID ? undefined : contextId;
};

/** Delivers an event to the host that renders AD as a React component. */
export function postHostEvent<T extends AnalyticalDesignerEventType>(
    hostAdapter: IAdHostAdapter,
    type: T,
    data: IAnalyticalDesignerEventDataMap[T],
    contextId?: string,
): void {
    const event: AnalyticalDesignerEvent<T> = { type, data, contextId: resetDefaultContextId(contextId) };
    // every AnalyticalDesignerEvent<T> is an AnalyticalDesignerEvent; TypeScript cannot widen a
    // generic mapped union (TS#30581)
    hostAdapter.onEvent(event as AnalyticalDesignerEvent);
}

/** Posts an event as a window message; data is the @gooddata/sdk-embedding contract payload. */
export function postWindowEvent(type: AnalyticalDesignerEventType, data: unknown, contextId?: string): void {
    messagingUtils.postEvent(
        GdcProductName.ANALYTICAL_DESIGNER,
        type,
        data as object,
        resetDefaultContextId(contextId),
    );
}

/**
 * Emits an event to the host: to the host component when one is installed, else as a window message.
 * Drill is emitted by drillPerformed: the two transports carry different payloads for it.
 */
export function adPostEvent<T extends Exclude<AnalyticalDesignerEventType, "drill">>(
    type: T,
    data: IAnalyticalDesignerEventDataMap[T],
    contextId?: string,
): void {
    const hostAdapter = getHostAdapter();
    if (hostAdapter) {
        postHostEvent(hostAdapter, type, data, contextId);
        return;
    }
    postWindowEvent(type, data, contextId);
}
