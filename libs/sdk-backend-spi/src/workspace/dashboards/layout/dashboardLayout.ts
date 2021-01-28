// (C) 2019-2021 GoodData Corporation
import { IWidget, IWidgetDefinition, isWidget, isWidgetDefinition } from "../widget";
import { IFluidLayout, IFluidLayoutColumn, IFluidLayoutRow, isFluidLayout } from "./fluidLayout";

/**
 * Dashboard layout content - widget, widget definition, or another layout.
 *
 * @alpha
 */
export type IDashboardLayoutContent = IWidget | IWidgetDefinition | IDashboardLayout;

/**
 * Type-guard testing whether the provided object is an instance of {@link IDashboardLayoutContent}.
 * @alpha
 */
export const isDashboardLayoutContent = (obj: unknown): obj is IDashboardLayoutContent =>
    [isFluidLayout, isWidget, isWidgetDefinition].some((guard) => guard(obj));

/**
 * Dashboard layout column definition.
 *
 * @alpha
 */
export type IDashboardLayoutColumn = IFluidLayoutColumn<IDashboardLayoutContent>;

/**
 * Dashboard layout row definition.
 *
 * @alpha
 */
export type IDashboardLayoutRow = IFluidLayoutRow<IDashboardLayoutContent>;

/**
 * Dashboard layout definition.
 *
 * @alpha
 */
export type IDashboardLayout = IFluidLayout<IDashboardLayoutContent>;
