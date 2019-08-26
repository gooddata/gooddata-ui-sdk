// (C) 2007-2018 GoodData Corporation
import * as React from "react";

import { dataSourceProvider, IDataSourceProviderProps } from "./DataSourceProvider";

export { IDataSourceProviderProps };

import { ICommonChartProps } from "../core/base/BaseChart";
import { LineChart as CoreLineChart } from "../core/LineChart";
import { generateDefaultDimensions } from "../../helpers/dimensions";

/**
 * AFM LineChart
 * is an internal component that accepts afm, resultSpec
 * @internal
 */
export const LineChart: React.ComponentClass<IDataSourceProviderProps> = dataSourceProvider<
    ICommonChartProps
>(CoreLineChart, generateDefaultDimensions, "LineChart");
