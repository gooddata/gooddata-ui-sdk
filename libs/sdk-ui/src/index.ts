// (C) 2007-2019 GoodData Corporation
import * as VisEvents from "./base/interfaces/Events";
import CatalogHelper from "./base/helpers/CatalogHelper";
import * as Model from "./base/helpers/model";
// import { ICommonVisualizationProps } from "./_defunct/to_delete/VisualizationLoadingHOC";
import { ErrorComponent } from "./base/simple/ErrorComponent";
import { LoadingComponent } from "./base/simple/LoadingComponent";
import { Kpi } from "./kpi/Kpi";
// import { Visualization } from "./_defunct/uri/Visualization";
import { ErrorStates, ErrorCodes } from "./base/constants/errorStates";
import { VisualizationTypes, ChartType, VisualizationEnvironment } from "./base/constants/visualizationTypes";
// import { Execute } from "./execution/Execute";
import { IDrillableItem } from "./base/interfaces/DrillEvents";
import { IHeaderPredicate } from "./base/interfaces/HeaderPredicate";
import { IPushData, IColorsData } from "./base/interfaces/PushData";
import { AttributeFilter } from "./filters/AttributeFilter/AttributeFilter";
import { AttributeElements } from "./filters/AttributeFilter/AttributeElements";
import * as PropTypes from "./proptypes/index";
import { generateDimensions } from "./base/helpers/dimensions";
import * as BucketNames from "./base/constants/bucketNames";
import * as MeasureTitleHelper from "./base/helpers/measureTitleHelper";
import * as SortsHelper from "./base/helpers/sorts";
import DerivedMeasureTitleSuffixFactory from "./base/factory/DerivedMeasureTitleSuffixFactory";
import ArithmeticMeasureTitleFactory from "./base/factory/ArithmeticMeasureTitleFactory";
// import { IDataSourceProviderInjectedProps } from "./_defunct/afm/DataSourceProvider";

import { BarChart } from "./charts/barChart/BarChart";
import { ColumnChart } from "./charts/columnChart/ColumnChart";
import { LineChart } from "./charts/lineChart/LineChart";
import { AreaChart } from "./charts/areaChart/AreaChart";
import { PieChart } from "./charts/pieChart/PieChart";
import { Treemap } from "./charts/treemap/Treemap";
import { DonutChart } from "./charts/donutChart/DonutChart";
import { BubbleChart } from "./charts/bubbleChart/BubbleChart";
// import { PivotTable } from "./_defunct/pivotTable/PivotTable";
import { Headline } from "./charts/headline/Headline";
import { ScatterPlot } from "./charts/scatterPlot/ScatterPlot";
import { ComboChart } from "./charts/comboChart/ComboChart";
import { FunnelChart } from "./charts/funnelChart/FunnelChart";
import { Heatmap } from "./charts/heatmap/Heatmap";
import { withJsxExport } from "./charts/withJsxExport";
import { withExecution } from "./execution/withExecution";
import { Executor } from "./execution/Executor";
// tslint:disable-next-line:no-duplicate-imports
import { Chart, ChartTransformation, ILegendConfig, IChartConfig, ColorUtils } from "./highcharts";
import { RuntimeError } from "./base/errors/RuntimeError";
import { IMeasureTitleProps, IArithmeticMeasureTitleProps } from "./base/interfaces/MeasureTitle";
import { OverTimeComparisonType, OverTimeComparisonTypes } from "./base/interfaces/OverTimeComparison";
import * as HeaderPredicateFactory from "./base/factory/HeaderPredicateFactory";
import * as MappingHeader from "./base/interfaces/MappingHeader";
// import { BucketExecutor } from "./execution/BucketExecutor";

import { IColorPalette, IColorPaletteItem } from "./base/interfaces/Colors";

/**
 * CoreComponents
 * A collection of BaseChart, Headline, Table, ScatterPlot, FunnelChart
 * TODO: SDK8: revisit
 * @internal
 */
/*
const CoreComponents: ICoreComponents = {
    BaseChart: CoreBaseChart,
    Headline: CoreHeadline,
    Table: CoreTable,
    PivotTable: CorePivotTable,
    ScatterPlot: CoreScatterPlot,
    FunnelChart: CoreFunnelChart,
};
*/

import { InsightView } from "./insightView/InsightView";

export {
    AttributeElements,
    AttributeFilter,
    BarChart,
    BucketNames,
    CatalogHelper,
    Model,
    ChartType,
    ColumnChart,
    ScatterPlot,
    ComboChart,
    FunnelChart,
    ErrorCodes,
    ErrorStates,
    ErrorComponent,
    Kpi,
    Executor,
    withExecution,
    generateDimensions,
    Headline,
    // ICommonVisualizationProps,
    IDrillableItem,
    ILegendConfig,
    IChartConfig,
    IColorPalette,
    IColorPaletteItem,
    IPushData,
    IColorsData,
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
    VisEvents,
    VisualizationEnvironment,
    VisualizationTypes,
    ChartTransformation,
    Chart,
    OverTimeComparisonType,
    OverTimeComparisonTypes,
    SortsHelper,
    ColorUtils,
    IHeaderPredicate,
    HeaderPredicateFactory,
    MappingHeader,
    withJsxExport,
    InsightView,
};
