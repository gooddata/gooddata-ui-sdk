// (C) 2019-2021 GoodData Corporation

import { IWidget, IFilterContext, ITempFilterContext } from "@gooddata/sdk-backend-spi";
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
