// (C) 2019-2026 GoodData Corporation

import { type IAttributeDescriptor, type IResultAttributeHeader } from "@gooddata/sdk-model";

import { attributeHeaderDisplayValue } from "../../../attributeNumberFormat.js";
import { type ValueFormatter } from "../../../dataAccessConfig.js";

/**
 * Gets the display value from an attribute header.
 *
 * @remarks
 * Uses formattedName (for dates) with fallback to name (labelValue); when the attribute descriptor carries
 * a number format, the name is formatted with it. Does NOT fall back to uri since that contains
 * primaryLabelValue, not the display value.
 *
 * @internal
 */
export function getAttributeHeaderValue(
    attributeHeader: IResultAttributeHeader,
    descriptor?: IAttributeDescriptor,
    valueFormatter?: ValueFormatter,
): string | null {
    return attributeHeaderDisplayValue(attributeHeader, descriptor, valueFormatter);
}
