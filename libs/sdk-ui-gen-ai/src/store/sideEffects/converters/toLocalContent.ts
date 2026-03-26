// (C) 2024-2026 GoodData Corporation

import {
    type IChatConversationContent,
    type IChatConversationMultipartPart,
} from "@gooddata/sdk-backend-spi";

import type { IChatConversationLocalContent, IChatConversationMultipartLocalPart } from "../../../model.js";

export function convertToLocalContent(
    content: IChatConversationContent,
    arrived?: boolean,
): IChatConversationLocalContent {
    return {
        ...content,
        ...(content.type === "multipart"
            ? {
                  parts: convertToLocalMultipartContent(content.parts, arrived),
              }
            : {}),
    };
}

export function convertToLocalMultipartContent(
    content: IChatConversationMultipartPart[],
    arrived?: boolean,
): IChatConversationMultipartLocalPart[] {
    return content.map((c) => ({
        ...c,
        ...(c.type === "visualization" && arrived
            ? {
                  reporting: true,
              }
            : {}),
    }));
}
