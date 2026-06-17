// (C) 2025-2026 GoodData Corporation

import {
    type CatalogItem,
    type IAttributeDisplayFormMetadataObject,
    type ICatalogDateAttribute,
    isCatalogAttribute,
    isCatalogDateDataset,
} from "@gooddata/sdk-model";

import {
    type IChatConversationLocalItem,
    type IChatConversationMultipartLocalPart,
    type TextContentObject,
} from "../../model.js";

import { getCatalogItemId, getCatalogItemTitle, getCatalogItemType } from "./utils.js";

export const REFERENCE_REGEX_PART = "[^{}\\/]+\\/[^{}]+";
export const REFERENCE_REGEX = new RegExp(`\\{${REFERENCE_REGEX_PART}\\}`, "g");

export function collectReferences(
    where: string | true,
    used: (CatalogItem | ICatalogDateAttribute)[],
): TextContentObject[] {
    const items: TextContentObject[] = [];
    used.forEach((item) => {
        collectReference(items, where, item);
        if (isCatalogDateDataset(item)) {
            item.dateAttributes.forEach((dateAttribute) => {
                collectReference(items, where, dateAttribute);
            });
        }
        if (isCatalogAttribute(item)) {
            item.displayForms.forEach((displayForm) => {
                collectReference(items, where, displayForm);
            });
        }
    });

    return items;
}

function collectReference(
    items: TextContentObject[],
    where: string | true,
    item: CatalogItem | ICatalogDateAttribute | IAttributeDisplayFormMetadataObject,
): void {
    const id = getCatalogItemId(item);
    const type = getCatalogItemType(item);

    if (id && type) {
        const regex = new RegExp(`\\{${type}/${id}\\}`, "g");
        if (where === true || regex.test(where)) {
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
        case "alertProposal":
            return {
                ...content,
                objects: collectReferences(true, catalogItems),
            };
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

export function replaceReferences(text: string, references: TextContentObject[]): string {
    return text.replace(REFERENCE_REGEX, (match) => {
        const [type, id] = match.slice(1, -1).split("/");
        const reference = references.find((ref) => ref.id === id && ref.type === type);
        return reference ? reference.title : match;
    });
}
