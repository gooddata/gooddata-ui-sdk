// (C) 2007-2018 GoodData Corporation
import * as React from "react";

import { dataSourceProvider, IDataSourceProviderProps } from "./DataSourceProvider";

export { IDataSourceProviderProps };

import { ICommonChartProps } from "../core/base/BaseChart";
import { ColumnChart as CoreColumnChart } from "../core/ColumnChart";
import { generateDefaultDimensions } from "../../helpers/dimensions";

/**
 * AFM ColumnChart
 * is an internal component that accepts afm, resultSpec
 * @internal
 */
export const ColumnChart: React.ComponentClass<IDataSourceProviderProps> = dataSourceProvider<
    ICommonChartProps
>(CoreColumnChart, generateDefaultDimensions, "ColumnChart");
