// (C) 2007-2020 GoodData Corporation
import {
    IAttributeDescriptor,
    IMeasureGroupDescriptor,
    IDimensionDescriptor,
    IResultHeader,
} from "@gooddata/sdk-backend-spi";
import invariant from "ts-invariant";
import { IUnwrappedAttributeHeadersWithItems } from "./types";

//
// TODO: move all this code to data view facade.
//
//

function findInDimensionHeaders(
    dimensions: IDimensionDescriptor[],
    headerCallback: (
        descriptorType: string,
        descriptor: any,
        dimensionIndex: number,
        headerIndex: number,
        headerCount: number,
    ) => any,
): any {
    let returnValue: any = null;
    dimensions.some((dimension: any, dimensionIndex: number) => {
        dimension.headers.some(
            (wrappedDescriptor: IMeasureGroupDescriptor | IAttributeDescriptor, headerIndex: number) => {
                const headerType = Object.keys(wrappedDescriptor)[0];
                const header = wrappedDescriptor[headerType];
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
            descriptorType: string,
            descriptor: IMeasureGroupDescriptor["measureGroupHeader"],
            _dimensionIndex: number,
            headerIndex: number,
            headerCount: number,
        ) => {
            const measureGroupHeader = descriptorType === "measureGroupHeader" ? descriptor : null;
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
    dimension: IDimensionDescriptor,
    attributeHeaderItemsDimension: IResultHeader[][],
    indexInDimension?: number,
): IUnwrappedAttributeHeadersWithItems {
    return findInDimensionHeaders(
        [dimension],
        (
            descriptorType: string,
            descriptor: IAttributeDescriptor["attributeHeader"],
            _dimensionIndex: number,
            headerIndex: number,
        ) => {
            if (
                descriptorType === "attributeHeader" &&
                (indexInDimension === undefined || indexInDimension === headerIndex)
            ) {
                return {
                    ...descriptor,
                    // attribute items are delivered separately from attributeHeaderItems
                    items: attributeHeaderItemsDimension[indexInDimension ? indexInDimension : 0],
                };
            }
            return null;
        },
    );
}
