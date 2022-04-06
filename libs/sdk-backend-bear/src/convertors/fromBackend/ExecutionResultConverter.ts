// (C) 2019-2022 GoodData Corporation

import { GdcExecution } from "@gooddata/api-model-bear";
import { isUri } from "@gooddata/api-client-bear";
import {
    uriRef,
    IDimensionDescriptor,
    IAttributeDescriptor,
    IMeasureGroupDescriptor,
    IResultWarning,
} from "@gooddata/sdk-model";
import isAttributeHeader = GdcExecution.isAttributeHeader;

export function convertWarning(warning: GdcExecution.Warning): IResultWarning {
    return {
        warningCode: warning.warningCode,
        message: warning.message,
        parameters: warning.parameters?.map((param) => (isUri(param) ? uriRef(param) : param)),
    };
}

/**
 * Converts execution result's dimension headers as passed by backend into dimension descriptor. At the moment, this function
 * ensures that the 'ref' properties are correctly filled in.
 *
 * @param dims - result dimensions.
 */
export function convertDimensions(dims: GdcExecution.IResultDimension[]): IDimensionDescriptor[] {
    return dims.map((dim) => {
        return {
            headers: dim.headers.map((header) => {
                if (isAttributeHeader(header)) {
                    return {
                        attributeHeader: {
                            ...header.attributeHeader,
                            ref: uriRef(header.attributeHeader.uri),
                            formOf: {
                                ...header.attributeHeader.formOf,
                                ref: uriRef(header.attributeHeader.formOf.uri),
                            },
                        },
                    } as IAttributeDescriptor;
                } else {
                    return {
                        measureGroupHeader: {
                            items: header.measureGroupHeader.items.map((measure) => {
                                return {
                                    measureHeaderItem: {
                                        ...measure.measureHeaderItem,
                                        ref: measure.measureHeaderItem.uri
                                            ? uriRef(measure.measureHeaderItem.uri)
                                            : undefined,
                                    },
                                };
                            }),
                            totalItems: header.measureGroupHeader.totalItems,
                        },
                    } as IMeasureGroupDescriptor;
                }
            }),
        };
    });
}
