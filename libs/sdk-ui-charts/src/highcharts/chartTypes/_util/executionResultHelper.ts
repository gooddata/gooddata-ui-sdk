// (C) 2007-2023 GoodData Corporation
import {
    IDimensionDescriptor,
    IAttributeDescriptor,
    IMeasureGroupDescriptor,
    IResultHeader,
    isMeasureGroupDescriptor,
    IDimensionItemDescriptor,
    IMeasureDescriptorObject,
    IAttributeDescriptorBody,
} from "@gooddata/sdk-model";
import { invariant } from "ts-invariant";
import { IUnwrappedAttributeHeadersWithItems } from "../../typings/mess.js";

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
    for (let dimensionIndex = 0; dimensionIndex < dimensions.length; dimensionIndex++) {
        const dimension = dimensions[dimensionIndex];
        for (let headerIndex = 0; headerIndex < dimension.headers.length; headerIndex++) {
            const wrappedDescriptor: IDimensionItemDescriptor = dimension.headers[headerIndex];
            const headerCount = dimension.headers.length;

            let headerType: string;
            let header: IMeasureDescriptorObject | IAttributeDescriptorBody;
            if (isMeasureGroupDescriptor(wrappedDescriptor)) {
                headerType = "measureGroupHeader";
                header = wrappedDescriptor.measureGroupHeader;
            } else {
                headerType = "attributeHeader";
                header = wrappedDescriptor.attributeHeader;
            }

            const callbackResult = headerCallback(
                headerType,
                header,
                dimensionIndex,
                headerIndex,
                headerCount,
            );

            if (callbackResult) {
                return callbackResult;
            }
        }
    }

    return null;
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
