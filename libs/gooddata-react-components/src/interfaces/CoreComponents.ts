// (C) 2019 GoodData Corporation
import * as React from "react";

import { IBaseChartProps, IChartProps } from "../_defunct/to_delete/BaseChart";
import { ITableProps } from "../components/core/PureTable";
import { ICommonVisualizationProps } from "../_defunct/to_delete/VisualizationLoadingHOC";
import { IDataSourceProviderInjectedProps } from "../_defunct/to_delete/DataSourceProvider";
import { IPivotTableProps } from "../_defunct/pivotTable/CorePivotTable";

export interface ICoreComponents {
    BaseChart: React.ComponentClass<IBaseChartProps>;
    Headline: React.ComponentClass<ICommonVisualizationProps & IDataSourceProviderInjectedProps>;
    Table: React.ComponentClass<ITableProps & IDataSourceProviderInjectedProps>;
    PivotTable: React.ComponentClass<IPivotTableProps>;
    ScatterPlot: React.ComponentClass<IChartProps>;
    FunnelChart: React.ComponentClass<IChartProps>;
}
