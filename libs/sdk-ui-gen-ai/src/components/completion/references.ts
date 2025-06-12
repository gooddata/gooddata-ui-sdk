// (C) 2025 GoodData Corporation
import { CatalogItem } from "@gooddata/sdk-model";

import { TextContentObject } from "../../model.js";

import { getCatalogItemId, getCatalogItemTitle, getCatalogItemType } from "./utils.js";

export function collectReferences(text: string, used: CatalogItem[]): TextContentObject[] {
    const items: TextContentObject[] = [];
    used.forEach((item) => {
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
    });

    return items;
}
