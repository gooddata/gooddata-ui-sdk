// (C) 2007-2019 GoodData Corporation
import * as VisEvents from "./interfaces/Events";
import CatalogHelper from "./helpers/CatalogHelper";
import { isEmptyResult } from "./helpers/errorHandlers";
import * as Model from "./helpers/model";
import { ICommonVisualizationProps } from "./_defunct/to_delete/VisualizationLoadingHOC";
import { ErrorComponent } from "./components/simple/ErrorComponent";
import { LoadingComponent } from "./components/simple/LoadingComponent";
// import { Kpi } from "./_defunct/kpi/Kpi";
// import { Visualization } from "./_defunct/uri/Visualization";
import { ErrorStates, ErrorCodes } from "./constants/errorStates";
import { VisualizationTypes, ChartType, VisualizationEnvironment } from "./constants/visualizationTypes";
// import { Execute } from "./execution/Execute";
import { IDrillableItem } from "./interfaces/DrillEvents";
import { IHeaderPredicate } from "./interfaces/HeaderPredicate";
import { IPushData, IColorsData } from "./interfaces/PushData";
import { AttributeFilter } from "./components/filters/AttributeFilter/AttributeFilter";
import { AttributeElements } from "./components/filters/AttributeFilter/AttributeElements";
import * as PropTypes from "./proptypes/index";
import { generateDimensions } from "./helpers/dimensions";
import * as BucketNames from "./constants/bucketNames";
import * as MeasureTitleHelper from "./helpers/measureTitleHelper";
import * as SortsHelper from "./helpers/sorts";
import DerivedMeasureTitleSuffixFactory from "./factory/DerivedMeasureTitleSuffixFactory";
import ArithmeticMeasureTitleFactory from "./factory/ArithmeticMeasureTitleFactory";
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
import { withJsxExport } from "./components/withJsxExport";
import * as ChartConfiguration from "./interfaces/Config";
// tslint:disable-next-line:no-duplicate-imports
import { ILegendConfig, IChartConfig, IColorPalette, IColorPaletteItem } from "./interfaces/Config";
import Chart from "./components/visualizations/chart/Chart";
import ChartTransformation from "./components/visualizations/chart/ChartTransformation";
import { RuntimeError } from "./errors/RuntimeError";
import { IMeasureTitleProps, IArithmeticMeasureTitleProps } from "./interfaces/MeasureTitle";
import { OverTimeComparisonType, OverTimeComparisonTypes } from "./interfaces/OverTimeComparison";
import ColorUtils from "./components/visualizations/utils/color";
import * as HeaderPredicateFactory from "./factory/HeaderPredicateFactory";
import * as MappingHeader from "./interfaces/MappingHeader";
// import { BucketExecutor } from "./execution/BucketExecutor";

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
    // Execute,
    // BucketExecutor,
    generateDimensions,
    Headline,
    ICommonVisualizationProps,
    IDrillableItem,
    ILegendConfig,
    IChartConfig,
    IColorPalette,
    IColorPaletteItem,
    IPushData,
    IColorsData,
    isEmptyResult,
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
    ChartConfiguration,
    ColorUtils,
    IHeaderPredicate,
    HeaderPredicateFactory,
    MappingHeader,
    withJsxExport,
};
