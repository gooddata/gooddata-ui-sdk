// (C) 2007-2018 GoodData Corporation
import * as React from "react";

import { dataSourceProvider, IDataSourceProviderProps } from "./DataSourceProvider";

export { IDataSourceProviderProps };

import { ICommonChartProps } from "../core/base/BaseChart";
import { ScatterPlot as CoreScatterPlot } from "../core/ScatterPlot";
import { generateDefaultDimensionsForPointsCharts } from "../../helpers/dimensions";

/**
 * AFM ScatterPlot
 * is an internal component that accepts afm, resultSpec
 * @internal
 */
export const ScatterPlot: React.ComponentClass<IDataSourceProviderProps> = dataSourceProvider<
    ICommonChartProps
>(CoreScatterPlot, generateDefaultDimensionsForPointsCharts, "ScatterPlot");
