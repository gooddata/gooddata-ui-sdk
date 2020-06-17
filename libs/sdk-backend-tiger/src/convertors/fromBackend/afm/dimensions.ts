// (C) 2019-2020 GoodData Corporation
import {
    IAttributeDescriptor,
    IMeasureGroupDescriptor,
    IMeasureDescriptor,
    IDimensionDescriptor,
} from "@gooddata/sdk-backend-spi";
import { Execution } from "@gooddata/gd-tiger-client";

import isAttributeHeader = Execution.isAttributeHeader;

function transformDimension(dim: Execution.IResultDimension): IDimensionDescriptor {
    return {
        headers: dim.headers.map((header, headerIdx) => {
            const h = header;

            if (isAttributeHeader(h)) {
                // TODO: SDK8: make our mind about whether URIs should be optional in attribute headers
                //  perhaps it makes sense. perhaps the URIs should be always present and should be coming from
                //  new stack as well? anyway, making URIs optional in the domain model will mean waterfall of fun
                //  changes across public interface of the SDK (drilling etc)
                const attrDescriptor: IAttributeDescriptor = {
                    attributeHeader: {
                        uri: `/obj/${headerIdx}/${h.attributeHeader.identifier}`,
                        identifier: h.attributeHeader.identifier,
                        formOf: {
                            identifier: h.attributeHeader.formOf.identifier,
                            name: h.attributeHeader.formOf.name,
                            uri: `/obj/${666 + headerIdx}/${h.attributeHeader.formOf.identifier}`,
                        },
                        localIdentifier: h.attributeHeader.localIdentifier,
                        name: h.attributeHeader.name,
                    },
                };

                return attrDescriptor;
            } else {
                const measureDescriptor: IMeasureGroupDescriptor = {
                    measureGroupHeader: {
                        items: h.measureGroupHeader.items.map(m => {
                            const newItem: IMeasureDescriptor = {
                                measureHeaderItem: {
                                    localIdentifier: m.measureHeaderItem.localIdentifier,
                                    name: m.measureHeaderItem.name,
                                    format: m.measureHeaderItem.format,
                                },
                            };

                            return newItem;
                        }),
                    },
                };

                return measureDescriptor;
            }
        }),
    };
}

/**
 * Transforms dimensions in the result provided by backend to the unified model used in SDK.
 *
 * @param dimensions - dimensions from execution result
 * @returns dimensions as used in the unified model
 */
export function transformResultDimensions(dimensions: Execution.IResultDimension[]): IDimensionDescriptor[] {
    return dimensions.map(transformDimension);
}
