// (C) 2007-2018 GoodData Corporation
import * as React from "react";

import { dataSourceProvider, IDataSourceProviderProps } from "./DataSourceProvider";

export { IDataSourceProviderProps };

import { ICommonChartProps } from "../core/base/BaseChart";
import { ComboChart as CoreComboChart } from "../core/ComboChart";
import { generateDefaultDimensions } from "../../helpers/dimensions";

/**
 * AFM ComboChart
 * is an internal component that accepts afm, resultSpec
 * @internal
 */
export const ComboChart: React.ComponentClass<IDataSourceProviderProps> = dataSourceProvider<
    ICommonChartProps
>(CoreComboChart, generateDefaultDimensions, "ComboChart");
