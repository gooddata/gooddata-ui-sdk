// (C) 2007-2018 GoodData Corporation
import {
    IAttributeDescriptor,
    IMeasureGroupDescriptor,
    IDimensionDescriptor,
} from "@gooddata/sdk-backend-spi";
import * as invariant from "invariant";
import { IUnwrappedAttributeHeadersWithItems } from "./types";

//
// TODO: move all this code to data view facade.
//
//

function findInDimensionHeaders(
    dimensions: IDimensionDescriptor[],
    headerCallback: (
        headerType: string,
        header: any,
        dimensionIndex: number,
        headerIndex: number,
        headerCount: number,
    ) => any,
): any {
    let returnValue: any = null;
    dimensions.some((dimension: any, dimensionIndex: number) => {
        dimension.headers.some(
            (wrappedHeader: IMeasureGroupDescriptor | IAttributeDescriptor, headerIndex: number) => {
                const headerType = Object.keys(wrappedHeader)[0];
                const header = wrappedHeader[headerType];
                const headerCount = dimension.headers.length;
                returnValue = headerCallback(headerType, header, dimensionIndex, headerIndex, headerCount);
                return !!returnValue;
            },
        );
        return !!returnValue;
    });
    return returnValue;
}

export function findMeasureGroupInDimensions(
    dimensions: IDimensionDescriptor[],
): IMeasureGroupDescriptor["measureGroupHeader"] {
    return findInDimensionHeaders(
        dimensions,
        (
            headerType: string,
            header: IMeasureGroupDescriptor["measureGroupHeader"],
            _dimensionIndex: number,
            headerIndex: number,
            headerCount: number,
        ) => {
            const measureGroupHeader = headerType === "measureGroupHeader" ? header : null;
            if (measureGroupHeader) {
                invariant(
                    headerIndex === headerCount - 1,
                    "MeasureGroup must be the last header in it's dimension",
                );
            }
            return measureGroupHeader;
        },
    );
}

export function findAttributeInDimension(
    dimension: any,
    attributeHeaderItemsDimension: any,
    indexInDimension?: number,
): IUnwrappedAttributeHeadersWithItems {
    return findInDimensionHeaders(
        [dimension],
        (
            headerType: string,
            header: IAttributeDescriptor["attributeHeader"],
            _dimensionIndex: number,
            headerIndex: number,
        ) => {
            if (
                headerType === "attributeHeader" &&
                (indexInDimension === undefined || indexInDimension === headerIndex)
            ) {
                return {
                    ...header,
                    // attribute items are delivered separately from attributeHeaderItems
                    items: attributeHeaderItemsDimension[indexInDimension ? indexInDimension : 0],
                };
            }
            return null;
        },
    );
}

export function getNthAttributeHeader(
    attributeHeaders: IAttributeDescriptor[],
    headerIndex: number,
): IAttributeDescriptor["attributeHeader"] {
    if (attributeHeaders.length && attributeHeaders[headerIndex]) {
        return attributeHeaders[headerIndex].attributeHeader;
    }
    return null;
}

export function getNthAttributeLocalIdentifier(
    rowAttributeHeaders: IAttributeDescriptor[],
    headerIndex: number,
): string {
    const attributeHeader = getNthAttributeHeader(rowAttributeHeaders, headerIndex);
    return attributeHeader && attributeHeader.localIdentifier;
}

export function getNthAttributeName(
    rowAttributeHeaders: IAttributeDescriptor[],
    headerIndex: number,
): string {
    const attributeHeader = getNthAttributeHeader(rowAttributeHeaders, headerIndex);
    return attributeHeader && attributeHeader.formOf.name;
}
