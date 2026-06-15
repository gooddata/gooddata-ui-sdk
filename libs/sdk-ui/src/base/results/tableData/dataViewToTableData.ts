// (C) 2019-2026 GoodData Corporation

import { type IDataView } from "@gooddata/sdk-backend-spi";
import { type DataValue } from "@gooddata/sdk-model";

import { type DataAccessConfig } from "../dataAccessConfig.js";

import { type ITableDataValue } from "./interfaces/cells.js";
import { type ITableColumnDefinition } from "./interfaces/columns.js";
import { type ITableData } from "./interfaces/index.js";
import { type IMappingOptions } from "./interfaces/mappingOptions.js";
import { type ITableRowDefinition } from "./interfaces/rows.js";
import { collectBucketsInfo } from "./mapping/collect/collectBucketsInfo.js";
import { collectColumnDefinitions } from "./mapping/collect/collectColumnDefinitions.js";
import { collectDescriptorsInfo } from "./mapping/collect/collectDescriptorsInfo.js";
import { collectHeadersInfo } from "./mapping/collect/collectHeadersInfo.js";
import { collectMeasureDimensionInfo } from "./mapping/collect/collectMeasureDimensionMeta.js";
import { collectPivotingInfo } from "./mapping/collect/collectPivotingInfo.js";
import { collectRowDefinitions } from "./mapping/collect/collectRowDefinitions.js";
import { collectTotalsInfo } from "./mapping/collect/collectTotalsInfo.js";
import { collectTranspositionInfo } from "./mapping/collect/collectTranspositionInfo.js";
import { mapData } from "./mapping/dataViewToTableDataMapping.js";

function isTotalColumnDefinition(columnDefinition: ITableColumnDefinition) {
    return columnDefinition.type === "subtotal" || columnDefinition.type === "grandTotal";
}

function isTotalRowDefinition(rowDefinition: ITableRowDefinition) {
    return rowDefinition.type === "subtotal" || rowDefinition.type === "grandTotal";
}

function hideTotalsForPartialData<T extends ITableColumnDefinition | ITableRowDefinition>(
    definitions: T[],
    isTotalDefinition: (definition: T) => boolean,
    isPartialData: boolean,
): T[] {
    return isPartialData ? definitions.filter((definition) => !isTotalDefinition(definition)) : definitions;
}

function normalizeRowDefinition<T extends ITableRowDefinition>(rowDefinition: T, rowIndex: number): T {
    return {
        ...rowDefinition,
        rowIndex,
    };
}

function normalizeColumnDefinition<T extends ITableColumnDefinition>(
    columnDefinition: T,
    columnIndex: number,
): T {
    return {
        ...columnDefinition,
        columnIndex,
    };
}

function normalizeDataValue(
    dataValue: ITableDataValue,
    rowDefinition: ITableRowDefinition,
    columnDefinition: ITableColumnDefinition,
): ITableDataValue {
    return {
        ...dataValue,
        rowIndex: rowDefinition.rowIndex,
        columnIndex: columnDefinition.columnIndex,
        rowDefinition,
        columnDefinition,
    } as ITableDataValue;
}

/**
 * This function converts data view to 2 dimensional data array, typically used for pivot table structure.
 *
 * @internal
 */
export function dataViewToTableData(dataView: IDataView, config: DataAccessConfig): ITableData {
    const rawData = dataView.data as DataValue[][];
    const totalData = dataView.totals;
    const rowGrandTotalsData = totalData?.[0];
    const columnGrandTotalsData = totalData?.[1];
    const overallTotalsData = dataView.totalTotals;
    const isPartialData = (dataView.metadata?.limitBreaks?.length ?? 0) > 0;

    const measureDimensionInfo = collectMeasureDimensionInfo(dataView);
    const bucketsInfo = collectBucketsInfo(dataView);
    const headersInfo = collectHeadersInfo(dataView);
    const descriptorsInfo = collectDescriptorsInfo(dataView);
    const totalsInfo = collectTotalsInfo(bucketsInfo);
    const transpositionInfo = collectTranspositionInfo(measureDimensionInfo);
    const { isPivoted } = collectPivotingInfo(bucketsInfo);
    const { rowDefinitions } = collectRowDefinitions(
        headersInfo,
        descriptorsInfo,
        measureDimensionInfo,
        transpositionInfo,
        totalsInfo,
    );
    const { columnDefinitions } = collectColumnDefinitions(
        dataView,
        headersInfo,
        descriptorsInfo,
        bucketsInfo,
        measureDimensionInfo,
        transpositionInfo,
    );

    const visibleRowDefinitions = hideTotalsForPartialData(
        rowDefinitions,
        isTotalRowDefinition,
        isPartialData,
    );
    const visibleColumnDefinitions = hideTotalsForPartialData(
        columnDefinitions,
        isTotalColumnDefinition,
        isPartialData,
    );

    const normalizedRowDefinitions = visibleRowDefinitions.map(normalizeRowDefinition);
    const normalizedColumnDefinitions = visibleColumnDefinitions.map(normalizeColumnDefinition);

    const { hasMeasures } = measureDimensionInfo;
    const { isTransposed } = transpositionInfo;

    const options: IMappingOptions = {
        config,
        rawData,
        isTransposed,
        rowGrandTotalsData,
        columnGrandTotalsData,
        overallTotalsData,
        hasMeasures,
    };

    let data: ITableDataValue[][] = [];

    if (isPartialData) {
        data = visibleRowDefinitions.map((rowDefinition, rowIndex) => {
            return visibleColumnDefinitions.map((columnDefinition, columnIndex) => {
                const dataValue = mapData(rowDefinition, columnDefinition, options);

                return normalizeDataValue(
                    dataValue,
                    normalizedRowDefinitions[rowIndex],
                    normalizedColumnDefinitions[columnIndex],
                );
            });
        });
    } else {
        data = visibleRowDefinitions.map((rowDefinition) => {
            return visibleColumnDefinitions.map((columnDefinition) => {
                return mapData(rowDefinition, columnDefinition, options);
            });
        });
    }

    return {
        columnDefinitions: normalizedColumnDefinitions,
        rowDefinitions: normalizedRowDefinitions,
        data,
        isPivoted,
        isTransposed,
    };
}
