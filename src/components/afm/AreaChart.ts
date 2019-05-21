// (C) 2007-2018 GoodData Corporation
import * as React from "react";

import { dataSourceProvider, IDataSourceProviderProps } from "./DataSourceProvider";

export { IDataSourceProviderProps };

import { ICommonChartProps } from "../core/base/BaseChart";
import { AreaChart as CoreAreaChart } from "../core/AreaChart";
import { generateDefaultDimensions } from "../../helpers/dimensions";

/**
 * AFM AreaChart
 * is an internal component that accepts afm, resultSpec
 * @internal
 */
export const AreaChart: React.ComponentClass<IDataSourceProviderProps> = dataSourceProvider<
    ICommonChartProps
>(CoreAreaChart, generateDefaultDimensions, "AreaChart");
