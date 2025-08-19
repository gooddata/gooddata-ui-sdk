// (C) 2021-2025 GoodData Corporation

import zip from "lodash/zip.js";
import { invariant } from "ts-invariant";

import {
    IAttributeDescriptor,
    IMeasureDescriptor,
    IResultAttributeHeader,
    IResultTotalHeader,
    isResultTotalHeader,
} from "@gooddata/sdk-model";

import { LeafDataCol, TransposedMeasureDataCol, isScopeCol } from "./tableDescriptorTypes.js";
import {
    ColumnLocator,
    IAttributeColumnLocator,
    IMeasureColumnLocator,
    ITotalColumnLocator,
} from "../../columnWidths.js";

function createAttributeLocator(
    descriptor: IAttributeDescriptor | undefined,
    header: IResultAttributeHeader | undefined,
): IAttributeColumnLocator {
    // if this bombs it means something is wrong with the col descriptors or in very bad case in the DVF data access logic.
    // by contract, all data series have same number of descriptors & headers. therefore the zipping logic should never
    // run into situation where the arrays are of different size.
    invariant(descriptor && header);

    return {
        attributeLocatorItem: {
            attributeIdentifier: descriptor.attributeHeader.localIdentifier,
            element: header.attributeHeaderItem.uri,
        },
    };
}

function createTotalLocator(
    descriptor: IAttributeDescriptor | undefined,
    header: IResultTotalHeader | undefined,
): ITotalColumnLocator {
    // if this bombs it means something is wrong with the col descriptors or in very bad case in the DVF data access logic.
    // by contract, all data series have same number of descriptors & headers. therefore the zipping logic should never
    // run into situation where the arrays are of different size.
    invariant(descriptor && header);

    return {
        totalLocatorItem: {
            attributeIdentifier: descriptor.attributeHeader.localIdentifier,
            totalFunction: header.totalHeaderItem.name,
        },
    };
}

function createMeasureLocator(descriptor: IMeasureDescriptor): IMeasureColumnLocator {
    return {
        measureLocatorItem: {
            measureIdentifier: descriptor.measureHeaderItem.localIdentifier,
        },
    };
}

/**
 * Given a leaf data col, this function will create column locator that can be used in
 * width items.
 *
 * @param col - col definition to get locators for
 */
export function createColumnLocator(col: LeafDataCol): ColumnLocator[] {
    if (isScopeCol(col)) {
        const result: ColumnLocator[] = [];
        const { descriptorsToHere, headersToHere, measureDescriptors } = col;
        const descriptorsAndHeaders = zip(descriptorsToHere, headersToHere);
        descriptorsAndHeaders.push([col.attributeDescriptor, col.header]);

        descriptorsAndHeaders.forEach(([descriptor, header]) =>
            isResultTotalHeader(header)
                ? result.push(createTotalLocator(descriptor, header))
                : result.push(createAttributeLocator(descriptor, header)),
        );

        if (measureDescriptors) {
            measureDescriptors.forEach((measureDescriptor) =>
                result.push(createMeasureLocator(measureDescriptor)),
            );
        }

        return result;
    } else {
        const result: ColumnLocator[] = [];

        if (col.seriesDescriptor.attributeDescriptors && col.seriesDescriptor.attributeHeaders) {
            const descriptorAndHeaders = zip(
                col.seriesDescriptor.attributeDescriptors,
                col.seriesDescriptor.attributeHeaders,
            );

            descriptorAndHeaders.forEach(([descriptor, header]) => {
                if (isResultTotalHeader(header)) {
                    result.push(createTotalLocator(descriptor, header));
                } else {
                    result.push(createAttributeLocator(descriptor, header));
                }
            });
        }

        result.push(createMeasureLocator(col.seriesDescriptor.measureDescriptor));

        return result;
    }
}

/**
 * Given a transposed slice measure or mixed values data col, this function will create column locator that can be used in
 * width items.
 *
 * @param col - col definition to get locators for
 */
export function createTransposedColumnLocator(
    col: TransposedMeasureDataCol | TransposedMeasureDataCol,
): IMeasureColumnLocator[] {
    const result: IMeasureColumnLocator[] = [];

    if (col.seriesDescriptor) {
        const filteredSeriesDescriptor = col.seriesDescriptor.filter(
            (serieDescriptor, index, self) =>
                self.findIndex((s) => s.measureDescriptor === serieDescriptor.measureDescriptor) === index,
        );

        filteredSeriesDescriptor.forEach((serieDescriptor) => {
            result.push(createMeasureLocator(serieDescriptor.measureDescriptor));
        });
    }

    return result;
}
