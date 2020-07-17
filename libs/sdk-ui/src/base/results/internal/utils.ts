// (C) 2019-2020 GoodData Corporation

import {
    IDataView,
    IDimensionItemDescriptor,
    IMeasureDescriptor,
    IMeasureGroupDescriptor,
    IResultHeader,
} from "@gooddata/sdk-backend-spi";

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
