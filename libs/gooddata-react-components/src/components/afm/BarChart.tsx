// (C) 2007-2018 GoodData Corporation
import * as React from "react";

import { dataSourceProvider, IDataSourceProviderProps } from "./DataSourceProvider";

export { IDataSourceProviderProps };

import { ICommonChartProps } from "../core/base/BaseChart";
import { BarChart as CoreBarChart } from "../core/BarChart";
import { generateDefaultDimensions } from "../../helpers/dimensions";

/**
 * AFM BarChart
 * is an internal component that accepts afm, resultSpec
 * @internal
 */
export const BarChart: React.ComponentClass<IDataSourceProviderProps> = dataSourceProvider<ICommonChartProps>(
    CoreBarChart,
    generateDefaultDimensions,
    "BarChart",
);
