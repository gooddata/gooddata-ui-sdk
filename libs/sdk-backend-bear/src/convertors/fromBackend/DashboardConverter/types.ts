// (C) 2019-2022 GoodData Corporation

import { IFilterContext, ITempFilterContext, IWidget } from "@gooddata/sdk-model";
import * as GdcDashboardPlugin from "@gooddata/api-model-bear/GdcDashboardPlugin";
import * as GdcFilterContext from "@gooddata/api-model-bear/GdcFilterContext";
import * as GdcKpi from "@gooddata/api-model-bear/GdcKpi";
import * as GdcVisualizationWidget from "@gooddata/api-model-bear/GdcVisualizationWidget";

import * as GdcVisualizationObject from "@gooddata/api-model-bear/GdcVisualizationObject";

export type DashboardDependency = IWidget | IFilterContext | ITempFilterContext;

export type BearDashboardDependency =
    | GdcVisualizationWidget.IWrappedVisualizationWidget
    | GdcKpi.IWrappedKPI
    | GdcFilterContext.IWrappedFilterContext
    | GdcFilterContext.IWrappedTempFilterContext
    | GdcVisualizationObject.IVisualization
    | GdcDashboardPlugin.IWrappedDashboardPlugin;
