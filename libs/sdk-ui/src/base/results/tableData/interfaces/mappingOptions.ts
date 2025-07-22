// (C) 2019-2025 GoodData Corporation

import { DataValue } from "@gooddata/sdk-model";
import { DataAccessConfig } from "../../dataAccessConfig.js";

/**
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
