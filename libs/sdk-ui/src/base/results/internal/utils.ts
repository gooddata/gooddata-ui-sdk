// (C) 2019-2025 GoodData Corporation

import { IDataView } from "@gooddata/sdk-backend-spi";
import {
    IDimensionItemDescriptor,
    IMeasureDescriptor,
    IMeasureGroupDescriptor,
    IResultAttributeHeader,
    IResultHeader,
    isResultTotalHeader,
} from "@gooddata/sdk-model";

/**
 * @internal
 */
export function dataViewHeaders(dataView: IDataView, dimIdx: number): IResultHeader[][] {
    return dataView.headerItems[dimIdx] ?? [];
}

/**
 * @internal
 */
export function dataViewDimensionItems(dataView: IDataView, dimIdx: number): IDimensionItemDescriptor[] {
    const dimensionDescriptor = dataView.result.dimensions[dimIdx];

    return dimensionDescriptor ? dimensionDescriptor.headers : [];
}

/**
 * @internal
 */
export function measureGroupItems(measureGroup: IMeasureGroupDescriptor): IMeasureDescriptor[] {
    return measureGroup.measureGroupHeader.items;
}

/**
 * @internal
 */
export function measureFormat(measureDescriptor: IMeasureDescriptor): string {
    return measureDescriptor.measureHeaderItem.format;
}

/**
 * @internal
 */
export function measureName(measureDescriptor: IMeasureDescriptor): string {
    return measureDescriptor.measureHeaderItem.name;
}

/**
 * @internal
 */
export function getTotalInfo(attributeHeaders: IResultAttributeHeader[]) {
    const numberOfTotalHeaders = attributeHeaders.filter(isResultTotalHeader).length;
    return {
        isTotal: numberOfTotalHeaders > 0 && numberOfTotalHeaders === attributeHeaders.length,
        isSubtotal: numberOfTotalHeaders > 0 && numberOfTotalHeaders !== attributeHeaders.length,
    };
}
