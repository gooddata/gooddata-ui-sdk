// (C) 2024-2025 GoodData Corporation

import { type AssistantMessage, isErrorContents } from "../../model.js";

/**
 * Represents the lifecycle status of a single assistant message.
 * @internal
 */
export type AssistantMessageState = "loading" | "streaming" | "error" | "cancelled" | "complete";

/**
 * Derives an assistant message status based on cancellation, error, completion, and streamed content.
 * @internal
 */
export function getAssistantMessageState(message: AssistantMessage): AssistantMessageState {
    if (message.cancelled) {
        return "cancelled";
    }
    if (message.content.some(isErrorContents)) {
        return "error";
    }
    if (message.complete) {
        return "complete";
    }
    if (message.content.length > 0) {
        return "streaming";
    }
    return "loading";
}
