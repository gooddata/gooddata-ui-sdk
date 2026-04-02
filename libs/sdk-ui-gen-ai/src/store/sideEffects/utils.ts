// (C) 2024-2026 GoodData Corporation

import { type IChatConversationLocalItem, type Message, makeUserItem } from "../../model.js";

export function extractError(e: unknown) {
    // Normal error
    if (e instanceof Error) {
        return `${e.name}: ${e.message}`;
    }

    if (typeof e === "object" && e !== null && "detail" in e) {
        return String(e.detail);
    }

    return String(e);
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
