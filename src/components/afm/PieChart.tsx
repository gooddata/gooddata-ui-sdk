// (C) 2007-2018 GoodData Corporation
import * as React from "react";

import { dataSourceProvider, IDataSourceProviderProps } from "./DataSourceProvider";

export { IDataSourceProviderProps };

import { ICommonChartProps } from "../core/base/BaseChart";
import { PieChart as CorePieChart } from "../core/PieChart";
import { generateDefaultDimensionsForRoundChart } from "../../helpers/dimensions";

/**
 * AFM PieChart
 * is an internal component that accepts afm, resultSpec
 * @internal
 */
export const PieChart: React.ComponentClass<IDataSourceProviderProps> = dataSourceProvider<ICommonChartProps>(
    CorePieChart,
    generateDefaultDimensionsForRoundChart,
    "PieChart",
);
