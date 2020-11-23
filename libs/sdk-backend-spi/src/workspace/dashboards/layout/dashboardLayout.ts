// (C) 2019-2020 GoodData Corporation
import { IWidget, IWidgetDefinition } from "../widget";
import { IFluidLayout, IFluidLayoutColumn, IFluidLayoutRow } from "./fluidLayout";

/**
 * Dashboard layout content - widget, widget definition, or another layout.
 *
 * @alpha
 */
export type IDashboardLayoutContent = IWidget | IWidgetDefinition | IDashboardLayout;

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
export type IDashboardLayoutRow = IFluidLayoutRow<IDashboardLayoutContent, IDashboardLayoutColumn>;

/**
 * Dashboard layout definition.
 *
 * @alpha
 */
export type IDashboardLayout = IFluidLayout<
    IDashboardLayoutContent,
    IDashboardLayoutColumn,
    IDashboardLayoutRow
>;
