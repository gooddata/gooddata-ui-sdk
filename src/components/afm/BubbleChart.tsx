// (C) 2007-2018 GoodData Corporation
import * as React from "react";

import { dataSourceProvider, IDataSourceProviderProps } from "./DataSourceProvider";

export { IDataSourceProviderProps };

import { ICommonChartProps } from "../core/base/BaseChart";
import { BubbleChart as CoreBubbleChart } from "../core/BubbleChart";
import { generateDefaultDimensionsForPointsCharts } from "../../helpers/dimensions";

/**
 * AFM BubbleChart
 * is an internal component that accepts afm, resultSpec
 * @internal
 */
export const BubbleChart: React.ComponentClass<IDataSourceProviderProps> = dataSourceProvider<
    ICommonChartProps
>(CoreBubbleChart, generateDefaultDimensionsForPointsCharts, "BubbleChart");
