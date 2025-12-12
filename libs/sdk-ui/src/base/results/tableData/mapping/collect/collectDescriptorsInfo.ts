// (C) 2019-2025 GoodData Corporation
import { type IDataView } from "@gooddata/sdk-backend-spi";
import {
    type IAttributeDescriptor,
    type IMeasureDescriptor,
    isAttributeDescriptor,
    isMeasureGroupDescriptor,
} from "@gooddata/sdk-model";

/**
 * @internal
 */
export type IDescriptorsInfo = {
    descriptorByLocalId: Record<string, IAttributeDescriptor | IMeasureDescriptor>;
};

/**
 * @internal
 */
export function collectDescriptorsInfo(dataView: IDataView) {
    const dimensions = dataView.result.dimensions;

    const descriptorByLocalId: Record<string, IAttributeDescriptor | IMeasureDescriptor> = {};

    dimensions.forEach((dimension) => {
        const dimensionItems = dimension.headers;
        dimensionItems.forEach((dimensionItemDescriptor) => {
            if (isAttributeDescriptor(dimensionItemDescriptor)) {
                descriptorByLocalId[dimensionItemDescriptor.attributeHeader.localIdentifier] =
                    dimensionItemDescriptor;
            } else if (isMeasureGroupDescriptor(dimensionItemDescriptor)) {
                dimensionItemDescriptor.measureGroupHeader.items.forEach((item) => {
                    descriptorByLocalId[item.measureHeaderItem.localIdentifier] = item;
                });
            }
        });
    });

    return { descriptorByLocalId };
}
