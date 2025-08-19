// (C) 2019-2025 GoodData Corporation

import { IDataView } from "@gooddata/sdk-backend-spi";
import { DataValue } from "@gooddata/sdk-model";

import { ITableData } from "./interfaces/index.js";
import { IMappingOptions } from "./interfaces/mappingOptions.js";
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
import { DataAccessConfig } from "../dataAccessConfig.js";

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

    const data = rowDefinitions.map((rowDefinition) => {
        return columnDefinitions.map((columnDefinition) => {
            return mapData(rowDefinition, columnDefinition, options);
        });
    });

    return {
        columnDefinitions,
        rowDefinitions,
        data,
        isPivoted,
        isTransposed,
    };
}
