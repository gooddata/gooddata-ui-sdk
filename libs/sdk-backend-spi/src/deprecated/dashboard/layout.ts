// (C) 2019-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import * as m from "@gooddata/sdk-model";

/**
 * Classification of the screen size according to its size with respect to the set breakpoints.
 * @deprecated Use {@link @gooddata/sdk-model#ScreenSize}
 * @public
 */
export type ScreenSize = m.ScreenSize;

/**
 * Default dashboard widgets - kpi widget, insight widget, or nested layout.
 * @deprecated Use {@link @gooddata/sdk-model#IDashboardWidget}
 * @public
 */
export type IDashboardWidget = m.IDashboardWidget;

/**
 * Type-guard testing whether the provided object is an instance of {@link IDashboardWidget}.
 * @deprecated Use {@link @gooddata/sdk-model#isDashboardWidget}
 * @public
 */
export const isDashboardWidget = m.isDashboardWidget;

/**
 * Dashboard layout item - usually contains kpi widget, insight widget or another nested layout.
 * Generic TWidget param is here to support type checking with custom widgets (e.g. in Dashboard component).
 *
 * @deprecated Use {@link @gooddata/sdk-model#IDashboardLayoutItem}
 * @public
 */
export interface IDashboardLayoutItem<TWidget = m.IDashboardWidget> extends m.IDashboardLayoutItem<TWidget> {}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDashboardLayoutItem}.
 * @deprecated Use {@link @gooddata/sdk-model#isDashboardLayoutItem}
 * @public
 */
export const isDashboardLayoutItem = m.isDashboardLayoutItem;

/**
 * Dashboard layout describes the data to be displayed on the dashboard, and their structure for UI rendering.
 * Generic TWidget param is here to support type checking with custom widgets (e.g. in Dashboard component).
 *
 * @deprecated Use {@link @gooddata/sdk-model#IDashboardLayout}
 * @public
 */
export interface IDashboardLayout<TWidget = m.IDashboardWidget> extends m.IDashboardLayout<TWidget> {}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDashboardLayout}.
 * @deprecated Use {@link @gooddata/sdk-model#isDashboardLayout}
 * @public
 */
export const isDashboardLayout = m.isDashboardLayout;

/**
 * Dashboard layout size configuration, defined by screen type.
 * @deprecated Use {@link @gooddata/sdk-model#IDashboardLayoutSizeByScreenSize}
 * @public
 */
export interface IDashboardLayoutSizeByScreenSize extends m.IDashboardLayoutSizeByScreenSize {}

/**
 * Dashboard layout size definition.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IDashboardLayoutSize}
 * @public
 */
export interface IDashboardLayoutSize extends m.IDashboardLayoutSize {}

/**
 * Dashboard layout section represents a group of widgets on the dashboard with a title and description.
 * @deprecated Use {@link @gooddata/sdk-model#IDashboardLayoutSection}
 * @public
 */
export interface IDashboardLayoutSection<TWidget = m.IDashboardWidget>
    extends m.IDashboardLayoutSection<TWidget> {}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDashboardLayoutSection}.
 * @deprecated Use {@link @gooddata/sdk-model#isDashboardLayoutSection}
 * @public
 */
export const isDashboardLayoutSection = m.isDashboardLayoutSection;

/**
 * Dashboard layout section header definition.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IDashboardLayoutSectionHeader}
 * @public
 */
export interface IDashboardLayoutSectionHeader extends m.IDashboardLayoutSectionHeader {}
