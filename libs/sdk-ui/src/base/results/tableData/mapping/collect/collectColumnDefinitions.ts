// (C) 2019-2025 GoodData Corporation
import { IDataView } from "@gooddata/sdk-backend-spi";
import { IAttributeDescriptor } from "@gooddata/sdk-model";
import { ITableColumnDefinition } from "../../interfaces/columns.js";
import { IMeasureDimensionInfo } from "./collectMeasureDimensionMeta.js";
import { IHeadersInfo } from "./collectHeadersInfo.js";
import { IDescriptorsInfo } from "./collectDescriptorsInfo.js";
import { IBucketsInfo } from "./collectBucketsInfo.js";

export function collectColumnDefinitions(
    dataView: IDataView,
    headersInfo: IHeadersInfo,
    descriptorsInfo: IDescriptorsInfo,
    bucketsInfo: IBucketsInfo,
    measureDimensionInfo: IMeasureDimensionInfo,
) {
    const [_, columnCount] = dataView.count;

    const { rowAttributes, columnAttributes } = bucketsInfo;
    const { hasMeasures, measureDimension, measureGroupDescriptor } = measureDimensionInfo;
    const { columnHeaders } = headersInfo;
    const { descriptorByLocalId } = descriptorsInfo;

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
            columnDefinitions.push({
                type: "grandTotal",
                columnIndex: columnDefinitions.length,
                columnScope: columnHeader.columnScope,
                columnHeaderIndex: columnHeader.index - columnCount,
            });
        } else if (isColumnSubtotalScope) {
            columnDefinitions.push({
                type: "subtotal",
                columnIndex: columnDefinitions.length,
                columnScope: columnHeader.columnScope,
                columnHeaderIndex: columnHeader.index,
            });
        } else if (isColumnValueScope) {
            columnDefinitions.push({
                type: "value",
                columnIndex: columnDefinitions.length,
                columnScope: columnHeader.columnScope,
                columnHeaderIndex: columnHeader.index,
            });
        }
    });

    return {
        columnDefinitions,
    };
}
