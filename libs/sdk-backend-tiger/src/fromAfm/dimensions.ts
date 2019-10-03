// (C) 2019 GoodData Corporation
import {
    IAttributeHeader,
    IMeasureGroupHeader,
    IMeasureHeaderItem,
    IResultDimension,
} from "@gooddata/sdk-backend-spi";
import { Execution } from "../gd-tiger-model/Execution";
import isAttributeHeader = Execution.isAttributeHeader;

function transformDimension(dim: Execution.IResultDimension): IResultDimension {
    return {
        headers: dim.headers.map(header => {
            const h = header;

            if (isAttributeHeader(h)) {
                // TODO: SDK8: make our mind about whether URIs should be optional in attribute headers
                //  perhaps it makes sense. perhaps the URIs should be always present and should be coming from
                //  new stack as well? anyway, making URIs optional in the domain model will mean waterfall of fun
                //  changes across public interface of the SDK (drilling etc)
                const attrHeader: IAttributeHeader = {
                    attributeHeader: {
                        uri: `/fakeAttrUri/${h.attributeHeader.identifier}`,
                        identifier: h.attributeHeader.identifier,
                        formOf: {
                            identifier: h.attributeHeader.identifier,
                            name: h.attributeHeader.identifier,
                            uri: `/fakeDfUri/${h.attributeHeader.identifier}`,
                        },
                        localIdentifier: h.attributeHeader.identifier,
                        name: h.attributeHeader.identifier,
                    },
                };

                return attrHeader;
            } else {
                const measureHeader: IMeasureGroupHeader = {
                    measureGroupHeader: {
                        items: h.measureGroupHeader.items.map(m => {
                            const newItem: IMeasureHeaderItem = {
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

                return measureHeader;
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
export function transformResultDimensions(dimensions: Execution.IResultDimension[]): IResultDimension[] {
    return dimensions.map(transformDimension);
}
