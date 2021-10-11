// (C) 2007-2021 GoodData Corporation
import values from "lodash/fp/values";
import first from "lodash/first";
import flow from "lodash/flow";
import { GdcMetadata } from "./GdcMetadata";
import { GdcDashboard } from "../dashboard/GdcDashboard";
import { GdcFilterContext } from "../filterContext/GdcFilterContext";
import { GdcScheduledMail } from "../scheduledMail/GdcScheduledMail";
import { GdcProjectDashboard } from "../projectDashboard/GdcProjectDashboard";
import { GdcExtendedDateFilters } from "../extendedDateFilters/GdcExtendedDateFilters";
import { GdcVisualizationWidget } from "../visualizationWidget/GdcVisualizationWidget";
import { GdcVisualizationObject } from "../visualizationObject/GdcVisualizationObject";
import { GdcVisualizationClass } from "../visualizationObject/GdcVisualizationClass";
import { GdcKpi } from "../kpi/GdcKpi";
import { GdcDataSets } from "../dataSets/GdcDataSets";
import { GdcReport } from "../report/GdcReport";
import { GdcDashboardPlugin } from "../dashboardPlugin/GdcDashboardPlugin";

/**
 * @public
 */
export namespace GdcMetadataObject {
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

    export function unwrapMetadataObject(object: WrappedObject): IObject {
        return flow(values, first)(object);
    }
}
