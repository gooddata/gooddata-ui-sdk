// (C) 2007-2021 GoodData Corporation
import values from "lodash/fp/values.js";
import first from "lodash/first.js";
import flow from "lodash/flow.js";

import { IAnalyticalDashboard, IWrappedAnalyticalDashboard } from "../dashboard/GdcDashboard.js";
import { IDashboardPlugin, IWrappedDashboardPlugin } from "../dashboardPlugin/GdcDashboardPlugin.js";
import {
    IFilterContext,
    ITempFilterContext,
    IWrappedFilterContext,
    IWrappedTempFilterContext,
} from "../filterContext/GdcFilterContext.js";
import {
    IAttributeDisplayForm,
    IFact,
    IKpiAlert,
    IMetadataObjectAttribute,
    IMetadataObjectDataSet,
    IMetadataObjectWrappedDataSet,
    IMetric,
    IPrompt,
    ITheme,
    IWrappedAttribute,
    IWrappedAttributeDisplayForm,
    IWrappedFact,
    IWrappedKpiAlert,
    IWrappedMetric,
    IWrappedPrompt,
    IWrappedTheme,
} from "./GdcMetadata.js";
import { IScheduledMail, IWrappedScheduledMail } from "../scheduledMail/GdcScheduledMail.js";
import { IProjectDashboard, IWrappedProjectDashboard } from "../projectDashboard/GdcProjectDashboard.js";
import { IReport, IReportDefinition, IWrappedReport, IWrappedReportDefinition } from "../report/GdcReport.js";
import { IDataSet, IWrappedDataSet } from "../dataSets/GdcDataSets.js";
import {
    IDateFilterConfig,
    IWrappedDateFilterConfig,
} from "../extendedDateFilters/GdcExtendedDateFilters.js";
import {
    IVisualizationWidget,
    IWrappedVisualizationWidget,
} from "../visualizationWidget/GdcVisualizationWidget.js";
import { IVisualization, IVisualizationObject } from "../visualizationObject/GdcVisualizationObject.js";
import {
    IVisualizationClass,
    IVisualizationClassWrapped,
} from "../visualizationObject/GdcVisualizationClass.js";
import { IKPI, IWrappedKPI } from "../kpi/GdcKpi.js";

/**
 * @public
 */
export type IObject =
    | IMetadataObjectAttribute
    | IMetric
    | IFact
    | IAttributeDisplayForm
    | IKpiAlert
    | IMetadataObjectDataSet
    | IPrompt
    | ITheme
    | IAnalyticalDashboard
    | IFilterContext
    | ITempFilterContext
    | IKPI
    | IScheduledMail
    | IProjectDashboard
    | IDateFilterConfig
    | IVisualizationWidget
    | IVisualizationObject
    | IVisualizationClass
    | IDataSet
    | IReport
    | IReportDefinition
    | IDashboardPlugin;

/**
 * @public
 */
export type WrappedObject =
    | IWrappedAttribute
    | IWrappedMetric
    | IWrappedFact
    | IWrappedAttributeDisplayForm
    | IWrappedKpiAlert
    | IMetadataObjectWrappedDataSet
    | IWrappedPrompt
    | IWrappedTheme
    | IWrappedAnalyticalDashboard
    | IWrappedFilterContext
    | IWrappedTempFilterContext
    | IWrappedKPI
    | IWrappedScheduledMail
    | IWrappedProjectDashboard
    | IWrappedDateFilterConfig
    | IWrappedVisualizationWidget
    | IVisualization
    | IVisualizationClassWrapped
    | IWrappedDataSet
    | IWrappedReport
    | IWrappedReportDefinition
    | IWrappedDashboardPlugin;

/**
 * @public
 */
export function unwrapMetadataObject(object: WrappedObject): IObject {
    return flow(values, first)(object);
}
