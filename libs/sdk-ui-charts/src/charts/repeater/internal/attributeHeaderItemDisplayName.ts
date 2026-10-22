// (C) 2026 GoodData Corporation

import { type IResultAttributeHeaderItem } from "@gooddata/sdk-model";

/**
 * Text to display for an attribute element: its formatted name when it has one (dates, numeric computed
 * attributes), its raw name otherwise. The raw name stays the value for hyperlink targets, image sources
 * and drilling.
 */
export function attributeHeaderItemDisplayName(
    item: IResultAttributeHeaderItem | undefined,
): string | null | undefined {
    return item?.formattedName ?? item?.name;
}
