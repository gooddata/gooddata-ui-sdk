// (C) 2024-2026 GoodData Corporation

import { type IChatConversationLocalItem } from "../../model.js";

/**
 * Represents the lifecycle status of a single assistant message.
 * @internal
 */
export type ItemState = "loading" | "streaming" | "error" | "cancelled" | "complete";

/**
 * Derives an assistant message status based on cancellation, error, completion, and streamed content.
 * @internal
 */
export function getItemState(message: IChatConversationLocalItem): ItemState {
    if (message.cancelled) {
        return "cancelled";
    }
    if (message.content.type === "error") {
        return "error";
    }
    if (message.complete) {
        return "complete";
    }
    if (message.streaming) {
        return "streaming";
    }
    return "loading";
}
