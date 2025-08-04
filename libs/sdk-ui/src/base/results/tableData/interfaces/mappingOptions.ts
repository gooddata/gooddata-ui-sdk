// (C) 2019-2025 GoodData Corporation

import { DataValue } from "@gooddata/sdk-model";
import { DataAccessConfig } from "../../dataAccessConfig.js";

/**
 * Configuration object passed to all mapping functions that transform data view results
 * into table data cells. Contains all the raw data arrays and configuration needed
 * to properly map, format, and display values in the table structure.
 * @internal
 */
export interface IMappingOptions {
    config: DataAccessConfig;
    isTransposed: boolean;
    rawData: DataValue[][];
    rowGrandTotalsData?: DataValue[][];
    columnGrandTotalsData?: DataValue[][];
    overallTotalsData?: DataValue[][][];
    hasMeasures: boolean;
}
