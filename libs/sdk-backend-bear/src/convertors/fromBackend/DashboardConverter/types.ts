// (C) 2019-2022 GoodData Corporation

import { IFilterContext, ITempFilterContext, IWidget } from "@gooddata/sdk-model";
import {
    GdcVisualizationWidget,
    GdcKpi,
    GdcFilterContext,
    GdcVisualizationObject,
    GdcDashboardPlugin,
} from "@gooddata/api-model-bear";

export type DashboardDependency = IWidget | IFilterContext | ITempFilterContext;

export type BearDashboardDependency =
    | GdcVisualizationWidget.IWrappedVisualizationWidget
    | GdcKpi.IWrappedKPI
    | GdcFilterContext.IWrappedFilterContext
    | GdcFilterContext.IWrappedTempFilterContext
    | GdcVisualizationObject.IVisualization
    | GdcDashboardPlugin.IWrappedDashboardPlugin;
