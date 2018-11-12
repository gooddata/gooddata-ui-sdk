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
import { PivotTable as CorePivotTable, IPivotTableProps } from './components/core/PivotTable';
import { ICommonVisualizationProps } from './components/core/base/VisualizationLoadingHOC';
import { ErrorComponent } from './components/simple/ErrorComponent';
import { LoadingComponent } from './components/simple/LoadingComponent';
import { Kpi } from './components/simple/Kpi';
import { Visualization, VisualizationEnvironment } from './components/uri/Visualization';
import { ErrorStates, ErrorCodes } from './constants/errorStates';
import { VisualizationTypes, ChartType } from './constants/visualizationTypes';
import { Execute } from './execution/Execute';
import { IDrillableItem } from './interfaces/DrillEvents';
import { IPushData, IColorsData } from './interfaces/PushData';
import { AttributeFilter } from './components/filters/AttributeFilter/AttributeFilter';
import { AttributeElements } from './components/filters/AttributeFilter/AttributeElements';
import * as PropTypes from './proptypes/index';
import { generateDimensions } from './helpers/dimensions';
import * as BucketNames from './constants/bucketNames';
import * as MeasureTitleHelper from './helpers/measureTitleHelper';
import * as SortsHelper from './helpers/sorts';
import DerivedMeasureTitleSuffixFactory from './factory/DerivedMeasureTitleSuffixFactory';
import ArithmeticMeasureTitleFactory from './factory/ArithmeticMeasureTitleFactory';
import { IDataSourceProviderInjectedProps } from './components/afm/DataSourceProvider';

import { BarChart } from './components/BarChart';
import { ColumnChart } from './components/ColumnChart';
import { LineChart } from './components/LineChart';
import { AreaChart } from './components/AreaChart';
import { PieChart } from './components/PieChart';
import { Treemap } from './components/Treemap';
import { DonutChart } from './components/DonutChart';
import { BubbleChart } from './components/BubbleChart';
import { PivotTable } from './components/PivotTable';
import { Table } from './components/Table';
import { Headline } from './components/Headline';
import { ScatterPlot } from './components/ScatterPlot';
import { ComboChart } from './components/ComboChart';
import { FunnelChart } from './components/FunnelChart';
import { Heatmap } from './components/Heatmap';
import {
    ILegendConfig,
    IChartConfig,
    IColorPalette,
    IColorPaletteItem
} from './interfaces/Config';
// tslint:disable-next-line:no-duplicate-imports
import * as ChartConfiguration from './interfaces/Config';
import Chart from './components/visualizations/chart/Chart';
import ChartTransformation from './components/visualizations/chart/ChartTransformation';
import { RuntimeError } from './errors/RuntimeError';
import { IMeasureTitleProps, IArithmeticMeasureTitleProps } from './interfaces/MeasureTitle';
import { OverTimeComparisonType, OverTimeComparisonTypes } from './interfaces/OverTimeComparison';
import { getColorByGuid } from './components/visualizations/utils/color';
import * as PredicateUtils from './helpers/predicatesFactory';

/**
 * CoreComponents
 * A collection of BaseChart, Headline, Table, ScatterPlot, FunnelChart
 * @internal
 */
const CoreComponents = {
    BaseChart: CoreBaseChart,
    Headline: CoreHeadline,
    Table: CoreTable,
    PivotTable: CorePivotTable,
    ScatterPlot: CoreScatterPlot,
    FunnelChart: CoreFunnelChart
};

const gdUtils = {
    getColorByGuid
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
    IPivotTableProps,
    ICommonVisualizationProps,
    IDataSourceProviderInjectedProps,
    IDrillableItem,
    ILegendConfig,
    IChartConfig,
    IColorPalette,
    IColorPaletteItem,
    IPushData,
    IColorsData,
    isEmptyResult,
    Kpi,
    LoadingComponent,
    LineChart,
    AreaChart,
    PieChart,
    Treemap,
    BubbleChart,
    DonutChart,
    Heatmap,
    IMeasureTitleProps,
    IArithmeticMeasureTitleProps,
    MeasureTitleHelper,
    DerivedMeasureTitleSuffixFactory,
    ArithmeticMeasureTitleFactory,
    PropTypes,
    RuntimeError,
    PivotTable,
    Table,
    VisEvents,
    Visualization,
    VisualizationEnvironment,
    VisualizationTypes,
    ChartTransformation,
    Chart,
    OverTimeComparisonType,
    OverTimeComparisonTypes,
    SortsHelper,
    ChartConfiguration,
    gdUtils,
    PredicateUtils
};
