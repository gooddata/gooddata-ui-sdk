// (C) 2024-2026 GoodData Corporation

import { type IChatConversationLocalItem } from "../../model.js";

export interface IChatMessagesGroup {
    type: "reasoning" | "user" | "assistant" | "error";
    messages: IChatConversationLocalItem[];
}

export function groupMessages(messages: IChatConversationLocalItem[]): IChatMessagesGroup[] {
    if (messages.length === 0) {
        return [];
    }

    const initialGroups: IChatMessagesGroup[] = [];
    let currentGroup: IChatMessagesGroup = {
        type: getMessageType(messages[0]),
        messages: [messages[0]],
    };
    initialGroups.push(currentGroup);

    for (let i = 1; i < messages.length; i++) {
        const message = messages[i];
        const type = getMessageType(message);

        if (type === currentGroup.type) {
            currentGroup.messages.push(message);
        } else {
            currentGroup = { type, messages: [message] };
            initialGroups.push(currentGroup);
        }
    }

    const groups: IChatMessagesGroup[] = [];
    for (let i = 0; i < initialGroups.length; i++) {
        const group = initialGroups[i];

        if (group.type === "error") {
            const prevGroup = groups[groups.length - 1];
            const nextGroup = initialGroups[i + 1];

            if (prevGroup?.type === "reasoning" && nextGroup?.type === "reasoning") {
                // Merge error into previous reasoning group
                prevGroup.messages.push(...group.messages);
                // Also merge the next reasoning group into the previous reasoning group
                prevGroup.messages.push(...nextGroup.messages);
                // oxlint-disable-next-line
                i++; // skip nextGroup
                continue;
            }
        }

        if (group.type === "reasoning" && groups[groups.length - 1]?.type === "reasoning") {
            groups[groups.length - 1].messages.push(...group.messages);
        } else {
            groups.push(group);
        }
    }

    return groups;
}

function getMessageType(message: IChatConversationLocalItem): "reasoning" | "user" | "assistant" | "error" {
    if (message.content.type === "error") {
        return "error";
    }
    if (
        message.content.type === "reasoning" ||
        message.role === "tool" ||
        message.content.type === "toolCall" ||
        message.content.type === "toolResult"
    ) {
        return "reasoning";
    }
    if (message.role === "assistant") {
        return "assistant";
    }
    return "user";
}
