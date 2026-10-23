// (C) 2021-2026 GoodData Corporation

import { type IMeasureMetadataObject } from "@gooddata/sdk-model";

function matchTitleOrId(metric: IMeasureMetadataObject | null, regexp: RegExp) {
    return metric && (metric.title.search(regexp) !== -1 || metric.id.search(regexp)) !== -1;
}

/**
 * based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
 * @param string -
 */
function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export function getFilteredItems(items: IMeasureMetadataObject[], search: string): IMeasureMetadataObject[] {
    if (search) {
        const regExp = new RegExp(escapeRegExp(search), "i");
        return items.filter((metric) => matchTitleOrId(metric, regExp));
    }

    return items;
}

export function fillDataArray(
    originalItems: (IMeasureMetadataObject | null)[],
    newItems: (IMeasureMetadataObject | null)[],
    startIndex: number,
): (IMeasureMetadataObject | null)[] {
    let fillData: null[] = [];
    if (startIndex > originalItems.length) {
        fillData = Array(startIndex - originalItems.length)
            .fill(true)
            .map(() => null);
        return [...originalItems, ...fillData, ...newItems];
    }

    originalItems.splice(startIndex, newItems.length, ...newItems);
    return [...originalItems];
}
