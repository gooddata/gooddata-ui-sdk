// (C) 2019-2020 GoodData Corporation
import {
    IAttributeDescriptor,
    IMeasureGroupDescriptor,
    IMeasureDescriptor,
    IDimensionDescriptor,
} from "@gooddata/sdk-backend-spi";
import { Execution } from "@gooddata/api-client-tiger";

import isAttributeHeader = Execution.isAttributeHeader;

const DEFAULT_FORMAT = "#,#.##";

function transformDimension(dim: Execution.IResultDimension): IDimensionDescriptor {
    return {
        headers: dim.headers.map((header, headerIdx) => {
            const h = header;

            if (isAttributeHeader(h)) {
                /*
                 * Funny stuff #1: we have to set 'uri' to some made-up value resembling the URIs sent by bear. This
                 *  is because pivot table relies on the format of URIs. Ideally we would refactor pivot table to
                 *  not care about this however this aspect is like a couple of eggs that hold the pivot spaghetti
                 *  together - cannot be easily untangled.
                 */
                const attrDescriptor: IAttributeDescriptor = {
                    attributeHeader: {
                        uri: `/obj/${headerIdx}`,
                        identifier: h.attributeHeader.identifier,
                        formOf: {
                            identifier: h.attributeHeader.formOf.identifier,
                            name: h.attributeHeader.formOf.name,
                            uri: `/obj/${headerIdx}`,
                        },
                        localIdentifier: h.attributeHeader.localIdentifier,
                        name: h.attributeHeader.name,
                    },
                };

                return attrDescriptor;
            } else {
                /*
                 * Funny stuff #2: tiger does not send name & format according to the contract (which is inspired
                 *  by bear behavior). The code must reconciliate as follows:
                 *
                 *  -  if name does not come from tiger, then default the name to localIdentifier
                 *  -  if format does not come from tiger, then default to a hardcoded format
                 */
                const measureDescriptor: IMeasureGroupDescriptor = {
                    measureGroupHeader: {
                        items: h.measureGroupHeader.items.map((m) => {
                            const newItem: IMeasureDescriptor = {
                                measureHeaderItem: {
                                    localIdentifier: m.measureHeaderItem.localIdentifier,
                                    name: m.measureHeaderItem.name ?? m.measureHeaderItem.localIdentifier,
                                    format: m.measureHeaderItem.format ?? DEFAULT_FORMAT,
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
