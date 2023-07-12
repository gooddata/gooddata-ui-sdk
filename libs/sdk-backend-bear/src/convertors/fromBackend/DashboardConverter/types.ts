// (C) 2019-2022 GoodData Corporation

import { IFilterContext, ITempFilterContext, IWidget } from "@gooddata/sdk-model";
import {
    IVisualization,
    IWrappedDashboardPlugin,
    IWrappedFilterContext,
    IWrappedKPI,
    IWrappedTempFilterContext,
    IWrappedVisualizationWidget,
} from "@gooddata/api-model-bear";

export type DashboardDependency = IWidget | IFilterContext | ITempFilterContext;

export type BearDashboardDependency =
    | IWrappedVisualizationWidget
    | IWrappedKPI
    | IWrappedFilterContext
    | IWrappedTempFilterContext
    | IVisualization
    | IWrappedDashboardPlugin;
