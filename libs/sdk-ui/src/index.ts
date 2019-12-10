// (C) 2007-2019 GoodData Corporation
import * as VisEvents from "./base/interfaces/Events";
import CatalogHelper from "./base/helpers/CatalogHelper";
// import { ICommonVisualizationProps } from "./_defunct/to_delete/VisualizationLoadingHOC";
import { Kpi } from "./kpi/Kpi";
// import { Visualization } from "./_defunct/uri/Visualization";
import { VisualizationTypes, ChartType, VisualizationEnvironment } from "./base/constants/visualizationTypes";
// import { Execute } from "./execution/Execute";
import { IDrillableItem } from "./base/interfaces/DrillEvents";
import { IHeaderPredicate } from "./base/interfaces/HeaderPredicate";
import { IPushData, IColorsData } from "./base/interfaces/PushData";
import { generateDimensions } from "./base/helpers/dimensions";
import * as BucketNames from "./base/constants/bucketNames";
import * as MeasureTitleHelper from "./base/helpers/measureTitleHelper";
import * as SortsHelper from "./base/helpers/sorts";
import DerivedMeasureTitleSuffixFactory from "./base/factory/DerivedMeasureTitleSuffixFactory";
import ArithmeticMeasureTitleFactory from "./base/factory/ArithmeticMeasureTitleFactory";

import { withExecution } from "./execution/withExecution";
import { Executor } from "./execution/Executor";
// tslint:disable-next-line:no-duplicate-imports
import { IMeasureTitleProps, IArithmeticMeasureTitleProps } from "./base/interfaces/MeasureTitle";
import { OverTimeComparisonType, OverTimeComparisonTypes } from "./base/interfaces/OverTimeComparison";
import * as HeaderPredicateFactory from "./base/factory/HeaderPredicateFactory";
import * as MappingHeader from "./base/interfaces/MappingHeader";

import { InsightView } from "./insightView/InsightView";

export {
    BucketNames,
    CatalogHelper,
    ChartType,
    Kpi,
    Executor,
    withExecution,
    generateDimensions,
    // ICommonVisualizationProps,
    IDrillableItem,
    IPushData,
    IColorsData,
    IMeasureTitleProps,
    IArithmeticMeasureTitleProps,
    MeasureTitleHelper,
    DerivedMeasureTitleSuffixFactory,
    ArithmeticMeasureTitleFactory,
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

export { BackendProvider, useBackend, withBackend } from "./context/BackendContext";
export { WorkspaceProvider, useWorkspace, withWorkspace } from "./context/WorkspaceContext";

export * from "./base";
export * from "./charts";
export * from "./highcharts";
export * from "./pivotTable";
export * from "./filters";
