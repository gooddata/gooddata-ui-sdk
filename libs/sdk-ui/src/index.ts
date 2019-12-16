// (C) 2007-2019 GoodData Corporation
import * as VisEvents from "./base/vis/Events";
import CatalogHelper from "./base/helpers/CatalogHelper";
// import { ICommonVisualizationProps } from "./_defunct/to_delete/VisualizationLoadingHOC";
import { Kpi } from "./kpi/Kpi";
// import { Visualization } from "./_defunct/uri/Visualization";
import { VisualizationTypes, ChartType, VisualizationEnvironment } from "./base/vis/visualizationTypes";
// import { Execute } from "./execution/Execute";
import { IDrillableItem } from "./base/vis/DrillEvents";
import { withExecution } from "./execution/withExecution";
import { Executor } from "./execution/Executor";
// tslint:disable-next-line:no-duplicate-imports
import { OverTimeComparisonType, OverTimeComparisonTypes } from "./base/interfaces/OverTimeComparison";

export {
    CatalogHelper,
    ChartType,
    Kpi,
    Executor,
    withExecution,
    IDrillableItem,
    VisEvents,
    VisualizationEnvironment,
    VisualizationTypes,
    OverTimeComparisonType,
    OverTimeComparisonTypes,
};

// new exports

export * from "./base";
export * from "./charts";
export * from "./highcharts";
export * from "./pivotTable";
export * from "./filters";

import { InsightView } from "./insightView/InsightView";
export { InsightView };
