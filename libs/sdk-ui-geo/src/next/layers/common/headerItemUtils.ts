// (C) 2025-2026 GoodData Corporation

import { type IResultHeader, isResultAttributeHeader } from "@gooddata/sdk-model";

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
                const { uri, name } = headerItem.attributeHeaderItem;
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
 */
export function getAttributeDataAndUris(
    attributeHeaderItems: IResultHeader[][],
    dataIndex: number,
    emptyHeaderString: string,
    nullHeaderString: string,
): ISegmentData {
    const headerItems = attributeHeaderItems[dataIndex];
    return headerItems.reduce<ISegmentData>(
        (result: ISegmentData, headerItem: IResultHeader): ISegmentData => {
            if (headerItem && isResultAttributeHeader(headerItem)) {
                const { uri, name } = headerItem.attributeHeaderItem;
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
