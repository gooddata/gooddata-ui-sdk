// (C) 2007-2019 GoodData Corporation
import * as VisEvents from "./base/interfaces/Events";
import CatalogHelper from "./base/helpers/CatalogHelper";
// import { ICommonVisualizationProps } from "./_defunct/to_delete/VisualizationLoadingHOC";
import { ErrorComponent } from "./base/simple/ErrorComponent";
import { LoadingComponent } from "./base/simple/LoadingComponent";
import { Kpi } from "./kpi/Kpi";
// import { Visualization } from "./_defunct/uri/Visualization";
import { ErrorStates } from "./base/constants/errorStates";
import { VisualizationTypes, ChartType, VisualizationEnvironment } from "./base/constants/visualizationTypes";
// import { Execute } from "./execution/Execute";
import { IDrillableItem } from "./base/interfaces/DrillEvents";
import { IHeaderPredicate } from "./base/interfaces/HeaderPredicate";
import { IPushData, IColorsData } from "./base/interfaces/PushData";
import { AttributeFilter, AttributeElements } from "./filters";
import { generateDimensions } from "./base/helpers/dimensions";
import * as BucketNames from "./base/constants/bucketNames";
import * as MeasureTitleHelper from "./base/helpers/measureTitleHelper";
import * as SortsHelper from "./base/helpers/sorts";
import DerivedMeasureTitleSuffixFactory from "./base/factory/DerivedMeasureTitleSuffixFactory";
import ArithmeticMeasureTitleFactory from "./base/factory/ArithmeticMeasureTitleFactory";
// import { IDataSourceProviderInjectedProps } from "./_defunct/afm/DataSourceProvider";

import { withExecution } from "./execution/withExecution";
import { Executor } from "./execution/Executor";
// tslint:disable-next-line:no-duplicate-imports
import { RuntimeError } from "./base/errors/RuntimeError";
import { IMeasureTitleProps, IArithmeticMeasureTitleProps } from "./base/interfaces/MeasureTitle";
import { OverTimeComparisonType, OverTimeComparisonTypes } from "./base/interfaces/OverTimeComparison";
import * as HeaderPredicateFactory from "./base/factory/HeaderPredicateFactory";
import * as MappingHeader from "./base/interfaces/MappingHeader";

import { InsightView } from "./insightView/InsightView";

export {
    AttributeElements,
    AttributeFilter,
    BucketNames,
    CatalogHelper,
    ChartType,
    ErrorStates,
    ErrorComponent,
    Kpi,
    Executor,
    withExecution,
    generateDimensions,
    // ICommonVisualizationProps,
    IDrillableItem,
    IPushData,
    IColorsData,
    LoadingComponent,
    IMeasureTitleProps,
    IArithmeticMeasureTitleProps,
    MeasureTitleHelper,
    DerivedMeasureTitleSuffixFactory,
    ArithmeticMeasureTitleFactory,
    RuntimeError,
    VisEvents,
    VisualizationEnvironment,
    VisualizationTypes,
    OverTimeComparisonType,
    OverTimeComparisonTypes,
    SortsHelper,
    IHeaderPredicate,
    HeaderPredicateFactory,
    MappingHeader,
    InsightView,
};

export * from "./charts";
export * from "./highcharts";
export * from "./pivotTable";

export { ILocale } from "./base/interfaces/Locale";
