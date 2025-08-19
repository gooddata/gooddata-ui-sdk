// (C) 2025 GoodData Corporation
import { CatalogItem, ICatalogDateAttribute } from "@gooddata/sdk-model";

import { getCatalogItemId, getCatalogItemTitle, getCatalogItemType } from "./utils.js";
import { TextContentObject } from "../../model.js";

export function collectReferences(
    text: string,
    used: (CatalogItem | ICatalogDateAttribute)[],
): TextContentObject[] {
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
