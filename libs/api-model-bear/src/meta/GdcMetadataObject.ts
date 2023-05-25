// (C) 2007-2021 GoodData Corporation
import values from "lodash/fp/values.js";
import first from "lodash/first.js";
import flow from "lodash/flow.js";
import * as GdcMetadata from "./GdcMetadata.js";
import { GdcDashboard } from "../dashboard/index.js";
import { GdcFilterContext } from "../filterContext/index.js";
import { GdcScheduledMail } from "../scheduledMail/index.js";
import { GdcProjectDashboard } from "../projectDashboard/index.js";
import { GdcExtendedDateFilters } from "../extendedDateFilters/index.js";
import { GdcVisualizationWidget } from "../visualizationWidget/index.js";
import { GdcVisualizationObject, GdcVisualizationClass } from "../visualizationObject/index.js";
import { GdcKpi } from "../kpi/index.js";
import { GdcDataSets } from "../dataSets/index.js";
import { GdcReport } from "../report/index.js";
import { GdcDashboardPlugin } from "../dashboardPlugin/index.js";

/**
 * @public
 */
export type IObject =
    | GdcMetadata.IAttribute
    | GdcMetadata.IMetric
    | GdcMetadata.IFact
    | GdcMetadata.IAttributeDisplayForm
    | GdcMetadata.IKpiAlert
    | GdcMetadata.IDataSet
    | GdcMetadata.IPrompt
    | GdcMetadata.ITheme
    | GdcDashboard.IAnalyticalDashboard
    | GdcFilterContext.IFilterContext
    | GdcFilterContext.ITempFilterContext
    | GdcKpi.IKPI
    | GdcScheduledMail.IScheduledMail
    | GdcProjectDashboard.IProjectDashboard
    | GdcExtendedDateFilters.IDateFilterConfig
    | GdcVisualizationWidget.IVisualizationWidget
    | GdcVisualizationObject.IVisualizationObject
    | GdcVisualizationClass.IVisualizationClass
    | GdcDataSets.IDataSet
    | GdcReport.IReport
    | GdcReport.IReportDefinition
    | GdcDashboardPlugin.IDashboardPlugin;

/**
 * @public
 */
export type WrappedObject =
    | GdcMetadata.IWrappedAttribute
    | GdcMetadata.IWrappedMetric
    | GdcMetadata.IWrappedFact
    | GdcMetadata.IWrappedAttributeDisplayForm
    | GdcMetadata.IWrappedKpiAlert
    | GdcMetadata.IWrappedDataSet
    | GdcMetadata.IWrappedPrompt
    | GdcMetadata.IWrappedTheme
    | GdcDashboard.IWrappedAnalyticalDashboard
    | GdcFilterContext.IWrappedFilterContext
    | GdcFilterContext.IWrappedTempFilterContext
    | GdcKpi.IWrappedKPI
    | GdcScheduledMail.IWrappedScheduledMail
    | GdcProjectDashboard.IWrappedProjectDashboard
    | GdcExtendedDateFilters.IWrappedDateFilterConfig
    | GdcVisualizationWidget.IWrappedVisualizationWidget
    | GdcVisualizationObject.IVisualization
    | GdcVisualizationClass.IVisualizationClassWrapped
    | GdcDataSets.IWrappedDataSet
    | GdcReport.IWrappedReport
    | GdcReport.IWrappedReportDefinition
    | GdcDashboardPlugin.IWrappedDashboardPlugin;

/**
 * @public
 */
export function unwrapMetadataObject(object: WrappedObject): IObject {
    return flow(values, first)(object);
}
