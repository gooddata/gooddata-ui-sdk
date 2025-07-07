// (C) 2019-2025 GoodData Corporation

import {
    IDescriptor2D,
    IHeaders2D,
    IMeasureData2D,
    IMeasureGroupDescriptor2D,
    IMeasureGroupHeaders2D,
    IDataPointIntersection2D,
    IData2D,
    IAttributeData2D,
    IAttributeDescriptor2D,
    IAttributeHeaders2D,
} from "../dataAccess.js";
import { IDataView } from "@gooddata/sdk-backend-spi";
import { DataAccessConfig } from "../dataAccessConfig.js";
import {
    isAttributeDescriptor,
    isMeasureGroupDescriptor,
    DataValue,
    IResultMeasureHeader,
    IResultAttributeHeader,
    IResultTotalHeader,
    isResultMeasureHeader,
} from "@gooddata/sdk-model";

/**
 * This function converts data view to 2 dimensional data array, typically used for table-like structure.
 *
 * @internal
 */
export function dataViewToData2D(dataView: IDataView, config: DataAccessConfig): IData2D {
    const dimensions = dataView.result.dimensions;
    const headerItems = dataView.headerItems;
    const rawData = dataView.data as DataValue[][];
    const [rowCount, columnCount] = dataView.count;

    const headers: IHeaders2D[] = [];
    const descriptors: IDescriptor2D[] = [];

    const columns: IDataPointIntersection2D[] = new Array(columnCount)
        .fill(null)
        .map(() => [] as IDataPointIntersection2D);

    const rows: IDataPointIntersection2D[][] = new Array(rowCount)
        .fill(null)
        .map(() => new Array(columnCount).fill(null).map(() => []));

    dimensions.forEach((dimension, dimensionIndex) => {
        const dimensionItems = dimension.headers;
        dimensionItems.forEach((dimensionItemDescriptor, dimensionItemIndex) => {
            if (isAttributeDescriptor(dimensionItemDescriptor)) {
                const attributeHeaders = headerItems[dimensionIndex][
                    dimensionItemIndex
                ] as IResultAttributeHeader[];
                const attributeDescriptor2D: IAttributeDescriptor2D = {
                    type: "attributeDescriptor",
                    descriptor: dimensionItemDescriptor,
                    dimensionIndex: dimensionIndex,
                };
                const attributeHeaders2D: IAttributeHeaders2D = {
                    type: "attributeHeaders",
                    headers: attributeHeaders as IResultAttributeHeader[],
                    dimensionIndex: dimensionIndex,
                };

                headers.push(attributeHeaders2D);
                descriptors.push(attributeDescriptor2D);

                if (dimensionIndex === 0) {
                    rows.forEach((_, rowIndex) => {
                        const attributeHeader = attributeHeaders[rowIndex];
                        columns.forEach((_, columnIndex) => {
                            const attributeData2D: IAttributeData2D = {
                                type: "attributeData",
                                header: attributeHeader,
                                descriptor: dimensionItemDescriptor,
                                dimensionIndex: dimensionIndex,
                                coordinates: [rowIndex, columnIndex],
                            };
                            rows[rowIndex][columnIndex].push(attributeData2D);
                        });
                    });
                } else if (dimensionIndex === 1) {
                    columns.forEach((_, columnIndex) => {
                        const attributeHeader = attributeHeaders[columnIndex];
                        rows.forEach((_, rowIndex) => {
                            const attributeData2D: IAttributeData2D = {
                                type: "attributeData",
                                header: attributeHeader,
                                descriptor: dimensionItemDescriptor,
                                dimensionIndex: dimensionIndex,
                                coordinates: [rowIndex, columnIndex],
                            };
                            rows[rowIndex][columnIndex].push(attributeData2D);
                        });
                    });
                }
            } else if (isMeasureGroupDescriptor(dimensionItemDescriptor)) {
                const measureGroupHeaders = headerItems[dimensionIndex][dimensionItemIndex] as (
                    | IResultMeasureHeader
                    | IResultTotalHeader
                )[];
                const measureGroupDescriptor2D: IMeasureGroupDescriptor2D = {
                    type: "measureGroupDescriptor",
                    descriptor: dimensionItemDescriptor,
                    dimensionIndex: dimensionIndex,
                };
                const measureGroupHeaders2D: IMeasureGroupHeaders2D = {
                    type: "measureGroupHeaders",
                    headers: measureGroupHeaders,
                    dimensionIndex: dimensionIndex,
                };
                headers.push(measureGroupHeaders2D);
                descriptors.push(measureGroupDescriptor2D);
                if (dimensionIndex === 0) {
                    rows.forEach((_, rowIndex) => {
                        const measureHeader = measureGroupHeaders[rowIndex];
                        columns.forEach((_, columnIndex) => {
                            const measureValue = rawData[rowIndex][columnIndex];
                            if (isResultMeasureHeader(measureHeader)) {
                                const measureDescriptor =
                                    dimensionItemDescriptor.measureGroupHeader.items[
                                        measureHeader?.measureHeaderItem?.order
                                    ];
                                const measureFormattedValue = config.valueFormatter(
                                    measureValue,
                                    measureDescriptor.measureHeaderItem.format,
                                );
                                const measureData2D: IMeasureData2D = {
                                    type: "measureData",
                                    header: measureHeader,
                                    descriptor: measureDescriptor,
                                    value: measureValue,
                                    formattedValue: measureFormattedValue,
                                    dimensionIndex: dimensionIndex,
                                    coordinates: [rowIndex, columnIndex],
                                };
                                rows[rowIndex][columnIndex].push(measureData2D);
                            }
                        });
                    });
                } else if (dimensionIndex === 1) {
                    columns.forEach((_, columnIndex) => {
                        const measureHeader = measureGroupHeaders[columnIndex];
                        rows.forEach((_, rowIndex) => {
                            const measureValue = rawData[rowIndex][columnIndex];
                            if (isResultMeasureHeader(measureHeader)) {
                                const measureDescriptor =
                                    dimensionItemDescriptor.measureGroupHeader.items[
                                        measureHeader?.measureHeaderItem?.order
                                    ];
                                const measureFormattedValue = config.valueFormatter(
                                    measureValue,
                                    measureDescriptor.measureHeaderItem.format,
                                );
                                const measureData2D: IMeasureData2D = {
                                    type: "measureData",
                                    header: measureHeader,
                                    descriptor: measureDescriptor,
                                    value: measureValue,
                                    formattedValue: measureFormattedValue,
                                    dimensionIndex: dimensionIndex,
                                    coordinates: [rowIndex, columnIndex],
                                };
                                rows[rowIndex][columnIndex].push(measureData2D);
                            }
                        });
                    });
                }
            }
        });
    });

    return {
        headers,
        descriptors,
        rows,
    };
}
