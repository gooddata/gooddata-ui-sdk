// (C) 2019-2025 GoodData Corporation

import { type IResultAttributeHeader } from "@gooddata/sdk-model";

/**
 * Gets the display value from an attribute header.
 *
 * @remarks
 * Uses formattedName (for dates) with fallback to name (labelValue).
 * Does NOT fall back to uri since that contains primaryLabelValue, not the display value.
 *
 * @internal
 */
export function getAttributeHeaderValue(attributeHeader: IResultAttributeHeader): string | null {
    return (
        attributeHeader.attributeHeaderItem.formattedName ?? attributeHeader.attributeHeaderItem.name ?? null
    );
}
