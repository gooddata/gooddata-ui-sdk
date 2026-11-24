// (C) 2026 GoodData Corporation

import { type IChatConversationItem } from "@gooddata/sdk-backend-spi";

import { type IChatConversationLocalItem, makeConversationItem } from "../../../model.js";
import { isClarificationQuestionsItem } from "../../../utils.js";

import { convertToLocalContent } from "./toLocalContent.js";

export function convertToLocalConversationItems(
    items: readonly IChatConversationItem[],
): IChatConversationLocalItem[] {
    return items.map((item, i, arr) => {
        const isClarification = isClarificationQuestionsItem(item);
        const filled = isClarification ? arr.length - 1 !== i : true;

        return makeConversationItem(
            {
                ...item,
                content: convertToLocalContent(item.content),
            },
            filled,
        );
    });
}
