// (C) 2007-2018 GoodData Corporation
import * as AfmComponents from './components/afm/afmComponents';
import * as VisEvents from './interfaces/Events';
import CatalogHelper from './helpers/CatalogHelper';
import { isEmptyResult } from './helpers/errorHandlers';
import { BaseChart as CoreBaseChart, IBaseChartProps } from './components/core/base/BaseChart';
import { Table as CoreTable } from './components/core/Table';
import { Headline as CoreHeadline } from './components/core/Headline';
import { ICommonVisualizationProps } from './components/core/base/VisualizationLoadingHOC';
import { ErrorComponent } from './components/simple/ErrorComponent';
import { LoadingComponent } from './components/simple/LoadingComponent';
import { Kpi } from './components/simple/Kpi';
import { Visualization, VisualizationEnvironment } from './components/uri/Visualization';
import { ErrorStates, ErrorCodes } from './constants/errorStates';
import { VisualizationTypes, ChartType } from './constants/visualizationTypes';
import { Execute } from './execution/Execute';
import { IDrillableItem } from './interfaces/DrillEvents';
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
import { Table } from './components/Table';
import { Headline } from './components/Headline';
import Chart, { ILegendConfig } from './components/visualizations/chart/Chart';
import ChartTransformation from './components/visualizations/chart/ChartTransformation';

/**
 * CoreComponents
 * A collection of BaseChart, Headline, Table
 * @internal
 */
const CoreComponents = {
    BaseChart: CoreBaseChart,
    Headline: CoreHeadline,
    Table: CoreTable
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
    CoreComponents,
    ErrorCodes,
    ErrorStates,
    ErrorComponent,
    LoadingComponent,
    Execute,
    generateDimensions,
    Headline,
    IBaseChartProps,
    ICommonVisualizationProps,
    IDataSourceProviderInjectedProps,
    IDrillableItem,
    ILegendConfig,
    isEmptyResult,
    IVisualizationProperties,
    Kpi,
    LineChart,
    AreaChart,
    PieChart,
    PoPHelper,
    PropTypes,
    Table,
    VisEvents,
    Visualization,
    VisualizationEnvironment,
    VisualizationTypes,
    ChartTransformation,
    Chart
};
