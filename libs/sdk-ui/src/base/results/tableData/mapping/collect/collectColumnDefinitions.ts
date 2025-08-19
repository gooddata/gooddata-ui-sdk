// (C) 2019-2025 GoodData Corporation
import { IDataView } from "@gooddata/sdk-backend-spi";
import { IAttributeDescriptor } from "@gooddata/sdk-model";

import { IBucketsInfo } from "./collectBucketsInfo.js";
import { IDescriptorsInfo } from "./collectDescriptorsInfo.js";
import { IHeadersInfo } from "./collectHeadersInfo.js";
import { IMeasureDimensionInfo } from "./collectMeasureDimensionMeta.js";
import { ITranspositionInfo } from "./collectTranspositionInfo.js";
import { ITableColumnDefinition } from "../../interfaces/columns.js";
import {
    ITableDataAttributeScope,
    ITableDataAttributeTotalScope,
    ITableDataMeasureScope,
    ITableDataMeasureTotalScope,
} from "../../interfaces/scope.js";

export function collectColumnDefinitions(
    dataView: IDataView,
    headersInfo: IHeadersInfo,
    descriptorsInfo: IDescriptorsInfo,
    bucketsInfo: IBucketsInfo,
    measureDimensionInfo: IMeasureDimensionInfo,
    transpositionInfo: ITranspositionInfo,
) {
    const [_, columnCount] = dataView.count;

    const { rowAttributes, columnAttributes } = bucketsInfo;
    const { hasMeasures, measureDimension, measureGroupDescriptor } = measureDimensionInfo;
    const { columnHeaders } = headersInfo;
    const { descriptorByLocalId } = descriptorsInfo;
    const { isTransposed } = transpositionInfo;

    const rowAttributeDescriptors = rowAttributes?.map(
        (attr) => descriptorByLocalId[attr.attribute.localIdentifier],
    ) as IAttributeDescriptor[];

    const columnAttributeDescriptors = columnAttributes?.map(
        (attr) => descriptorByLocalId[attr.attribute.localIdentifier],
    ) as IAttributeDescriptor[];

    const columnDefinitions: ITableColumnDefinition[] = [];

    // Collect row attribute column definitions
    rowAttributeDescriptors?.forEach((descriptor, rowHeaderIndex) => {
        columnDefinitions.push({
            type: "attribute",
            columnIndex: columnDefinitions.length,
            rowHeaderIndex,
            attributeDescriptor: descriptor,
        });
    });

    // If measures are in rows, add mixed measure column definitions
    if (hasMeasures && measureDimension === "rows") {
        // Measure are in rows -> we need mixed measure header column
        columnDefinitions.push({
            type: "measureGroupHeader",
            columnIndex: columnDefinitions.length,
            measureGroupDescriptor: measureGroupDescriptor,
            attributeDescriptors: columnAttributeDescriptors,
        });

        // Is not pivoted + measures are in rows -> we need mixed measure value column
        if (columnHeaders.length === 0) {
            columnDefinitions.push({
                type: "measureGroupValue",
                columnIndex: columnDefinitions.length,
                measureGroupDescriptor: measureGroupDescriptor,
            });
        }
    }

    // If table is pivoted, add pivoted column definitions
    columnHeaders.forEach((columnHeader) => {
        const isColumnGrandTotalScope = columnHeader.columnScope.every(
            (scope) => scope.type === "attributeTotalScope" || scope.type === "measureTotalScope",
        );
        const isColumnSubtotalScope =
            !isColumnGrandTotalScope &&
            columnHeader.columnScope.some(
                (scope) => scope.type === "measureTotalScope" || scope.type === "attributeTotalScope",
            );
        const isColumnValueScope =
            !isColumnSubtotalScope &&
            columnHeader.columnScope.every(
                (scope) => scope.type === "measureScope" || scope.type === "attributeScope",
            );

        if (isColumnGrandTotalScope) {
            const reversedScope = [...columnHeader.columnScope].reverse();
            if (isTransposed) {
                const attributeTotalScope = reversedScope.find(
                    (scope): scope is ITableDataAttributeTotalScope => scope.type === "attributeTotalScope",
                );
                columnDefinitions.push({
                    type: "grandTotal",
                    columnIndex: columnDefinitions.length,
                    columnScope: columnHeader.columnScope,
                    columnHeaderIndex: columnHeader.index - columnCount,
                    isTransposed: true,
                    isEmpty: false,
                    totalHeader: attributeTotalScope!.header,
                    attributeDescriptor: attributeTotalScope!.descriptor,
                });
            } else {
                const measureTotalScope = reversedScope.find(
                    (scope): scope is ITableDataMeasureTotalScope => scope.type === "measureTotalScope",
                );
                columnDefinitions.push({
                    type: "grandTotal",
                    columnIndex: columnDefinitions.length,
                    columnScope: columnHeader.columnScope,
                    columnHeaderIndex: columnHeader.index - columnCount,
                    isTransposed: false,
                    isEmpty: false,
                    totalHeader: measureTotalScope!.header,
                    measureDescriptor: measureTotalScope!.descriptor,
                });
            }
        } else if (isColumnSubtotalScope) {
            const reversedScope = [...columnHeader.columnScope].reverse();
            if (isTransposed) {
                const attributeTotalScope = reversedScope.find(
                    (scope): scope is ITableDataAttributeTotalScope => scope.type === "attributeTotalScope",
                );
                columnDefinitions.push({
                    type: "subtotal",
                    columnIndex: columnDefinitions.length,
                    columnScope: columnHeader.columnScope,
                    columnHeaderIndex: columnHeader.index,
                    isTransposed: true,
                    isEmpty: false,
                    totalHeader: attributeTotalScope!.header,
                    attributeDescriptor: attributeTotalScope!.descriptor,
                });
            } else {
                const measureTotalScope = reversedScope.find(
                    (scope): scope is ITableDataMeasureTotalScope => scope.type === "measureTotalScope",
                );
                columnDefinitions.push({
                    type: "subtotal",
                    columnIndex: columnDefinitions.length,
                    columnScope: columnHeader.columnScope,
                    columnHeaderIndex: columnHeader.index,
                    isTransposed: false,
                    isEmpty: false,
                    totalHeader: measureTotalScope!.header,
                    measureDescriptor: measureTotalScope!.descriptor,
                });
            }
        } else if (isColumnValueScope) {
            const reversedScope = [...columnHeader.columnScope].reverse();
            if (isTransposed) {
                const attributeScope = reversedScope.find(
                    (scope): scope is ITableDataAttributeScope => scope.type === "attributeScope",
                );
                columnDefinitions.push({
                    type: "value",
                    columnIndex: columnDefinitions.length,
                    columnScope: columnHeader.columnScope,
                    columnHeaderIndex: columnHeader.index,
                    isTransposed: true,
                    isEmpty: false,
                    attributeHeader: attributeScope!.header,
                    attributeDescriptor: attributeScope!.descriptor,
                });
            } else {
                if (!hasMeasures) {
                    const attributeScope = reversedScope.find(
                        (scope): scope is ITableDataAttributeScope => scope.type === "attributeScope",
                    );
                    columnDefinitions.push({
                        type: "value",
                        columnIndex: columnDefinitions.length,
                        columnScope: columnHeader.columnScope,
                        columnHeaderIndex: columnHeader.index,
                        isEmpty: true,
                        isTransposed: false,
                        attributeHeader: attributeScope!.header,
                        attributeDescriptor: attributeScope!.descriptor,
                    });
                } else {
                    const measureScope = reversedScope.find(
                        (scope): scope is ITableDataMeasureScope => scope.type === "measureScope",
                    );
                    if (measureScope) {
                        columnDefinitions.push({
                            type: "value",
                            columnIndex: columnDefinitions.length,
                            columnScope: columnHeader.columnScope,
                            columnHeaderIndex: columnHeader.index,
                            isTransposed: false,
                            isEmpty: false,
                            measureHeader: measureScope!.header,
                            measureDescriptor: measureScope!.descriptor,
                        });
                    }
                }
            }
        }
    });

    return {
        columnDefinitions,
    };
}
