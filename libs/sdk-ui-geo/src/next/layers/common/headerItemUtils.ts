// (C) 2025-2026 GoodData Corporation

import { type IResultHeader, isResultAttributeHeader } from "@gooddata/sdk-model";
import { getAttributeHeaderItemName } from "@gooddata/sdk-ui";

import { EMPTY_SEGMENT_VALUE } from "../pushpin/constants.js";

export interface ISegmentData {
    uris: string[];
    data: string[];
}

/**
 * Extracts segment data and URIs from attribute header items.
 * Substitutes `EMPTY_SEGMENT_VALUE` for null/undefined URIs.
 */
export function getSegmentDataAndUris(
    attributeHeaderItems: IResultHeader[][],
    dataIndex: number,
    emptyHeaderString: string,
    nullHeaderString: string,
): ISegmentData {
    const headerItems = attributeHeaderItems[dataIndex];
    return headerItems.reduce<ISegmentData>(
        (result: ISegmentData, headerItem: IResultHeader): ISegmentData => {
            if (headerItem && isResultAttributeHeader(headerItem)) {
                const { uri } = headerItem.attributeHeaderItem;
                const name = getAttributeHeaderItemName(headerItem.attributeHeaderItem);
                const displayName = name ?? nullHeaderString;
                const finalName = name === "" ? emptyHeaderString : displayName;
                return {
                    uris: [...result.uris, uri ?? EMPTY_SEGMENT_VALUE],
                    data: [...result.data, finalName],
                };
            }
            return result;
        },
        { uris: [], data: [] },
    );
}

/**
 * Extracts attribute data and raw URIs from attribute header items.
 * Unlike `getSegmentDataAndUris`, this preserves raw URI values without
 * substituting `EMPTY_SEGMENT_VALUE` for nulls.
 *
 * @param useFormattedName - read the formatted element value (for values shown to the user); pass false
 *  for values used to identify something, e.g. area identifiers matched against map features
 */
export function getAttributeDataAndUris(
    attributeHeaderItems: IResultHeader[][],
    dataIndex: number,
    emptyHeaderString: string,
    nullHeaderString: string,
    useFormattedName = true,
): ISegmentData {
    const headerItems = attributeHeaderItems[dataIndex];
    return headerItems.reduce<ISegmentData>(
        (result: ISegmentData, headerItem: IResultHeader): ISegmentData => {
            if (headerItem && isResultAttributeHeader(headerItem)) {
                const { uri } = headerItem.attributeHeaderItem;
                const name = useFormattedName
                    ? getAttributeHeaderItemName(headerItem.attributeHeaderItem)
                    : headerItem.attributeHeaderItem.name;
                const displayName = name ?? nullHeaderString;
                const finalName = name === "" ? emptyHeaderString : displayName;
                return {
                    uris: [...result.uris, uri],
                    data: [...result.data, finalName],
                };
            }
            return result;
        },
        { uris: [], data: [] },
    );
}
