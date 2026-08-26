// (C) 2026 GoodData Corporation

import { type GenAIChatEffort } from "@gooddata/sdk-model";

import { type IChatConversationLocalItem } from "../../model.js";

// Efforts the UI can represent, in menu order. The backend enum is wider (it also has HIGH).
export const SUPPORTED_EFFORTS = ["LOW", "MEDIUM"] as const satisfies ReadonlyArray<GenAIChatEffort>;

export type SupportedEffort = (typeof SUPPORTED_EFFORTS)[number];

export const DEFAULT_EFFORT: SupportedEffort = "LOW";

const DEEPEST_EFFORT: SupportedEffort = "MEDIUM";

export function sanitizeEffort(effort: GenAIChatEffort | undefined): SupportedEffort | undefined {
    return SUPPORTED_EFFORTS.find((supported) => supported === effort);
}

/**
 * The effort a conversation was last using, or undefined when its history records none.
 */
export function deriveConversationEffort(
    items: IChatConversationLocalItem[] | undefined,
): SupportedEffort | undefined {
    const lastUserItem = items?.filter((item) => item.role === "user" && item.id).pop();

    if (!lastUserItem) {
        return undefined;
    }

    if (lastUserItem.reasoningEffort === undefined) {
        return DEFAULT_EFFORT;
    }

    return sanitizeEffort(lastUserItem.reasoningEffort) ?? DEEPEST_EFFORT;
}
