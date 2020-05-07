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
        | GdcScheduledMail.IScheduledMail
        | GdcProjectDashboard.IProjectDashboard
        | GdcExtendedDateFilters.IDateFilterConfig
        | GdcVisualizationWidget.IVisualizationWidget
        | GdcVisualizationObject.IVisualizationObject;

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
        | GdcScheduledMail.IWrappedScheduledMail
        | GdcProjectDashboard.IWrappedProjectDashboard
        | GdcExtendedDateFilters.IWrappedDateFilterConfig
        | GdcVisualizationWidget.IWrappedVisualizationWidget
        | GdcVisualizationObject.IVisualizationObjectResponse;

    export function unwrapMetadataObject(object: WrappedObject): IObject {
        const unwrappedObject: IObject = flow(values, first)(object);

        return unwrappedObject;
    }
}
