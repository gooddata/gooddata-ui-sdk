// (C) 2007-2020 GoodData Corporation
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
        | GdcDataSets.IDataSet;

    export type WrappedObject =
        | GdcMetadata.IWrappedAttribute
        | GdcMetadata.IWrappedMetric
        | GdcMetadata.IWrappedFact
        | GdcMetadata.IWrappedAttributeDisplayForm
        | GdcMetadata.IWrappedKpiAlert
        | GdcMetadata.IWrappedDataSet
        | GdcMetadata.IWrappedPrompt
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
        | GdcDataSets.IWrappedDataSet;

    export function unwrapMetadataObject(object: WrappedObject): IObject {
        const unwrappedObject: IObject = flow(values, first)(object);

        return unwrappedObject;
    }
}
