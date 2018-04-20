// (C) 2007-2018 GoodData Corporation
import * as AfmComponents from './components/afm/afmComponents';
import * as VisEvents from './interfaces/Events';
import CatalogHelper from './helpers/CatalogHelper';
import { isEmptyResult } from './helpers/errorHandlers';
import { BaseChart as CoreBaseChart, IBaseChartProps } from './components/core/base/BaseChart';
import { Table as CoreTable } from './components/core/Table';
import { Headline as CoreHeadline } from './components/core/Headline';
import { ScatterPlot as CoreScatterPlot } from './components/core/ScatterPlot';
import { FunnelChart as CoreFunnelChart } from './components/core/FunnelChart';
import { ICommonVisualizationProps } from './components/core/base/VisualizationLoadingHOC';
import { ErrorComponent } from './components/simple/ErrorComponent';
import { LoadingComponent } from './components/simple/LoadingComponent';
import { Kpi } from './components/simple/Kpi';
import { Visualization, VisualizationEnvironment } from './components/uri/Visualization';
import { ErrorStates, ErrorCodes } from './constants/errorStates';
import { VisualizationTypes, ChartType } from './constants/visualizationTypes';
import { Execute } from './execution/Execute';
import { IDrillableItem } from './interfaces/DrillEvents';
import { IPushData } from './interfaces/PushData';
import { IVisualizationProperties } from './interfaces/VisualizationProperties';
import { AttributeFilter } from './components/filters/AttributeFilter/AttributeFilter';
import { AttributeElements } from './components/filters/AttributeFilter/AttributeElements';
import * as PropTypes from './proptypes/index';
import { generateDimensions } from './helpers/dimensions';
import * as BucketNames from './constants/bucketNames';
import * as PoPHelper from './helpers/popHelper';
import { IDataSourceProviderInjectedProps } from './components/afm/DataSourceProvider';

import { BarChart } from './components/BarChart';
import { ColumnChart } from './components/ColumnChart';
import { LineChart } from './components/LineChart';
import { AreaChart } from './components/AreaChart';
import { PieChart } from './components/PieChart';
import { Treemap } from './components/Treemap';
import { DonutChart } from './components/DonutChart';
import { Table } from './components/Table';
import { Headline } from './components/Headline';
import { ScatterPlot } from './components/ScatterPlot';
import { ComboChart } from './components/ComboChart';
import { FunnelChart } from './components/FunnelChart';
import Chart, { ILegendConfig } from './components/visualizations/chart/Chart';
import ChartTransformation from './components/visualizations/chart/ChartTransformation';
import { RuntimeError } from './errors/RuntimeError';

/**
 * CoreComponents
 * A collection of BaseChart, Headline, Table, ScatterPlot, FunnelChart
 * @internal
 */
const CoreComponents = {
    BaseChart: CoreBaseChart,
    Headline: CoreHeadline,
    Table: CoreTable,
    ScatterPlot: CoreScatterPlot,
    FunnelChart: CoreFunnelChart
};

export {
    AfmComponents,
    AttributeElements,
    AttributeFilter,
    BarChart,
    BucketNames,
    CatalogHelper,
    ChartType,
    ColumnChart,
    ScatterPlot,
    ComboChart,
    FunnelChart,
    CoreComponents,
    ErrorCodes,
    ErrorStates,
    ErrorComponent,
    Execute,
    generateDimensions,
    Headline,
    IBaseChartProps,
    ICommonVisualizationProps,
    IDataSourceProviderInjectedProps,
    IDrillableItem,
    ILegendConfig,
    IPushData,
    isEmptyResult,
    IVisualizationProperties,
    Kpi,
    LoadingComponent,
    LineChart,
    AreaChart,
    PieChart,
    Treemap,
    DonutChart,
    PoPHelper,
    PropTypes,
    RuntimeError,
    Table,
    VisEvents,
    Visualization,
    VisualizationEnvironment,
    VisualizationTypes,
    ChartTransformation,
    Chart
};
