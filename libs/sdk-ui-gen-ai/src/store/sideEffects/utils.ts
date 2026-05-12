// (C) 2024-2026 GoodData Corporation

import { isUnexpectedResponseError } from "@gooddata/sdk-backend-spi";

import { type IChatConversationLocalItem, type Message, makeUserItem } from "../../model.js";

export function extractError(e: unknown) {
    if (e instanceof Error) {
        // Prefer error detail from response body over axios's generic message
        const message = extractErrorDetail(e) ?? e.message;
        return `${e.name}: ${message}`;
    }

    if (typeof e === "object" && e !== null && "detail" in e) {
        return String(e.detail);
    }

    return String(e);
}

function extractErrorDetail(e: Error): string | undefined {
    if (!isUnexpectedResponseError(e)) return undefined;
    const body = e.responseBody;
    if (body && typeof body === "object" && "detail" in body && typeof body.detail === "string") {
        return body.detail;
    }
    return undefined;
}

export function convertMessageToChatConversation(message: Message): IChatConversationLocalItem {
    //NOTE: Try to convert message to local item to ensure backward compatibility with
    // previous action
    return makeUserItem(
        {
            type: "text",
            text: message.content.reduce((acc, content) => {
                if (content.type === "text") {
                    return acc + " " + content.text;
                }
                return acc;
            }, ""),
        },
        message.id,
    );
}
