// (C) 2019-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import * as m from "@gooddata/sdk-model";

/**
 * Classification of the screen size according to its size with respect to the set breakpoints.
 * @deprecated Use {@link @gooddata/sdk-model#ScreenSize}
 * @alpha
 */
export type ScreenSize = m.ScreenSize;

/**
 * Default dashboard widgets - kpi widget, insight widget, or nested layout.
 * @deprecated Use {@link @gooddata/sdk-model#IDashboardWidget}
 * @alpha
 */
export type IDashboardWidget = m.IDashboardWidget;

/**
 * Type-guard testing whether the provided object is an instance of {@link IDashboardWidget}.
 * @deprecated Use {@link @gooddata/sdk-model#isDashboardWidget}
 * @alpha
 */
export const isDashboardWidget = m.isDashboardWidget;

/**
 * Dashboard layout item - usually contains kpi widget, insight widget or another nested layout.
 * Generic TWidget param is here to support type checking with custom widgets (e.g. in Dashboard component).
 *
 * @deprecated Use {@link @gooddata/sdk-model#IDashboardLayoutItem}
 * @alpha
 */
export interface IDashboardLayoutItem<TWidget = m.IDashboardWidget> extends m.IDashboardLayoutItem<TWidget> {}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDashboardLayoutItem}.
 * @deprecated Use {@link @gooddata/sdk-model#isDashboardLayoutItem}
 * @alpha
 */
export const isDashboardLayoutItem = m.isDashboardLayoutItem;

/**
 * Dashboard layout describes the data to be displayed on the dashboard, and their structure for UI rendering.
 * Generic TWidget param is here to support type checking with custom widgets (e.g. in Dashboard component).
 *
 * @deprecated Use {@link @gooddata/sdk-model#IDashboardLayout}
 * @alpha
 */
export interface IDashboardLayout<TWidget = m.IDashboardWidget> extends m.IDashboardLayout<TWidget> {}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDashboardLayout}.
 * @deprecated Use {@link @gooddata/sdk-model#isDashboardLayout}
 * @alpha
 */
export const isDashboardLayout = m.isDashboardLayout;

/**
 * Dashboard layout size configuration, defined by screen type.
 * @deprecated Use {@link @gooddata/sdk-model#IDashboardLayoutSizeByScreenSize}
 * @alpha
 */
export interface IDashboardLayoutSizeByScreenSize extends m.IDashboardLayoutSizeByScreenSize {}

/**
 * Dashboard layout size definition.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IDashboardLayoutSize}
 * @alpha
 */
export interface IDashboardLayoutSize extends m.IDashboardLayoutSize {}

/**
 * Dashboard layout section represents a group of widgets on the dashboard with a title and description.
 * @deprecated Use {@link @gooddata/sdk-model#IDashboardLayoutSection}
 * @alpha
 */
export interface IDashboardLayoutSection<TWidget = m.IDashboardWidget>
    extends m.IDashboardLayoutSection<TWidget> {}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDashboardLayoutSection}.
 * @deprecated Use {@link @gooddata/sdk-model#isDashboardLayoutSection}
 * @alpha
 */
export const isDashboardLayoutSection = m.isDashboardLayoutSection;

/**
 * Dashboard layout section header definition.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IDashboardLayoutSectionHeader}
 * @alpha
 */
export interface IDashboardLayoutSectionHeader extends m.IDashboardLayoutSectionHeader {}
