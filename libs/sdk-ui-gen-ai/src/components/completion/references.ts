// (C) 2025-2026 GoodData Corporation

import { type CatalogItem, type ICatalogDateAttribute, isCatalogDateDataset } from "@gooddata/sdk-model";

import { getCatalogItemId, getCatalogItemTitle, getCatalogItemType } from "./utils.js";
import {
    type IChatConversationLocalItem,
    type IChatConversationMultipartLocalPart,
    type TextContentObject,
} from "../../model.js";

export function collectReferences(
    text: string,
    used: (CatalogItem | ICatalogDateAttribute)[],
): TextContentObject[] {
    const items: TextContentObject[] = [];
    used.forEach((item) => {
        collectReference(items, text, item);
        if (isCatalogDateDataset(item)) {
            item.dateAttributes.forEach((dateAttribute) => {
                collectReference(items, text, dateAttribute);
            });
        }
    });

    return items;
}

function collectReference(
    items: TextContentObject[],
    text: string,
    item: CatalogItem | ICatalogDateAttribute,
): void {
    const id = getCatalogItemId(item);
    const type = getCatalogItemType(item);

    if (id && type) {
        const regex = new RegExp(`\{${type}/${id}\}`, "g");
        if (regex.test(text)) {
            const title = getCatalogItemTitle(item);
            items.push({
                id,
                type,
                title,
            });
        }
    }
}

export function parseReferences<
    T extends IChatConversationLocalItem["content"] | IChatConversationMultipartLocalPart,
>(content: T, catalogItems: CatalogItem[]): T {
    if (catalogItems.length === 0) {
        return content;
    }
    switch (content.type) {
        case "reasoning":
            return {
                ...content,
                objects: collectReferences(content.summary, catalogItems),
            };
        case "text":
            return {
                ...content,
                objects: collectReferences(content.text, catalogItems),
            };
        case "multipart":
            return {
                ...content,
                parts: content.parts.map((part: IChatConversationMultipartLocalPart) =>
                    parseReferences(part, catalogItems),
                ),
            };
        default:
            return content;
    }
}
