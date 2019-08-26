// (C) 2007-2018 GoodData Corporation
import * as React from "react";

import { dataSourceProvider, IDataSourceProviderProps } from "./DataSourceProvider";

export { IDataSourceProviderProps };

import { ICommonChartProps } from "../core/base/BaseChart";
import { FunnelChart as CoreFunnelChart } from "../core/FunnelChart";
import { generateDefaultDimensionsForRoundChart } from "../../helpers/dimensions";

/**
 * AFM FunnelChart
 * is an internal component that accepts afm, resultSpec
 * @internal
 */
export const FunnelChart: React.ComponentClass<IDataSourceProviderProps> = dataSourceProvider<
    ICommonChartProps
>(CoreFunnelChart, generateDefaultDimensionsForRoundChart, "FunnelChart");
