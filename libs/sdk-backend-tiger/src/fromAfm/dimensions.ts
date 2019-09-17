// (C) 2019 GoodData Corporation
import { IAttributeHeader, IResultDimension } from "@gooddata/sdk-backend-spi";
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
                //  changes across the codebase (drilling etc)
                const attrHeader: IAttributeHeader = {
                    attributeHeader: {
                        uri: "/fake/",
                        ...h.attributeHeader,
                        formOf: {
                            uri: "/fake",
                            ...h.attributeHeader.formOf,
                        },
                    },
                };

                return attrHeader;
            } else {
                return h;
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
