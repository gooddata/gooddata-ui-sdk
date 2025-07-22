// (C) 2019-2025 GoodData Corporation
import { IResultAttributeHeader } from "@gooddata/sdk-model";

/**
 * @internal
 */
export function getAttributeHeaderValue(attributeHeader: IResultAttributeHeader): string | null {
    return (
        attributeHeader.attributeHeaderItem.formattedName ??
        attributeHeader.attributeHeaderItem.name ??
        attributeHeader.attributeHeaderItem.uri ??
        null
    );
}
