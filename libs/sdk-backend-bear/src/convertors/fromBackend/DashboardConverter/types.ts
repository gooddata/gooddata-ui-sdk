// (C) 2019-2020 GoodData Corporation

import { IWidget, IFilterContext, ITempFilterContext } from "@gooddata/sdk-backend-spi";
import {
    GdcVisualizationWidget,
    GdcKpi,
    GdcFilterContext,
    GdcVisualizationObject,
} from "@gooddata/gd-bear-model";

export type DashboardDependency = IWidget | IFilterContext | ITempFilterContext;

export type BearDashboardDependency =
    | GdcVisualizationWidget.IWrappedVisualizationWidget
    | GdcKpi.IWrappedKPI
    | GdcFilterContext.IWrappedFilterContext
    | GdcFilterContext.IWrappedTempFilterContext
    | GdcVisualizationObject.IVisualization;
