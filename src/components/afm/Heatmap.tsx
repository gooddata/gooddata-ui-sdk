// (C) 2007-2018 GoodData Corporation
import { dataSourceProvider, IDataSourceProviderProps } from "./DataSourceProvider";

export { IDataSourceProviderProps };

import { ICommonChartProps } from "../core/base/BaseChart";
import { Heatmap as CoreHeatmap } from "../core/Heatmap";
import { generateDefaultDimensions } from "../../helpers/dimensions";

export const Heatmap = dataSourceProvider<ICommonChartProps>(
    CoreHeatmap,
    generateDefaultDimensions,
    "Heatmap",
);
