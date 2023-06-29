// (C) 2021-2022 GoodData Corporation

import { isScopeCol, LeafDataCol } from "./tableDescriptorTypes.js";
import {
    ColumnLocator,
    ITotalColumnLocator,
    IAttributeColumnLocator,
    IMeasureColumnLocator,
} from "../../columnWidths.js";
import {
    IMeasureDescriptor,
    IAttributeDescriptor,
    IResultAttributeHeader,
    isResultTotalHeader,
    IResultTotalHeader,
} from "@gooddata/sdk-model";
import { invariant } from "ts-invariant";
import zip from "lodash/zip.js";

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
        const { descriptorsToHere, headersToHere } = col;
        const descriptorsAndHeaders = zip(descriptorsToHere, headersToHere);
        descriptorsAndHeaders.push([col.attributeDescriptor, col.header]);

        return descriptorsAndHeaders.map(([descriptor, header]) =>
            isResultTotalHeader(header)
                ? createTotalLocator(descriptor, header)
                : createAttributeLocator(descriptor, header),
        );
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
