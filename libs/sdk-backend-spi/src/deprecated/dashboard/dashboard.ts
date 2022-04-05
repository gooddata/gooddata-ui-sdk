// (C) 2019-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import * as m from "@gooddata/sdk-model";

/**
 * Date filter configuration mode
 * @deprecated Use {@link @gooddata/sdk-model#DashboardDateFilterConfigMode}
 * @alpha
 */
export type DashboardDateFilterConfigMode = m.DashboardDateFilterConfigMode;

/**
 * Date filter presets to add to the date filter for the current dashboard
 * @deprecated Use {@link @gooddata/sdk-model#IDashboardDateFilterAddedPresets}
 * @alpha
 */
export interface IDashboardDateFilterAddedPresets extends m.IDashboardDateFilterAddedPresets {}

/**
 * Extended date filter config
 * @deprecated Use {@link @gooddata/sdk-model#IDashboardDateFilterConfig}
 * @alpha
 */
export interface IDashboardDateFilterConfig extends m.IDashboardDateFilterConfig {}

/**
 * Dashboard common properties
 * @deprecated Use {@link @gooddata/sdk-model#IDashboardBase}
 * @alpha
 */
export interface IDashboardBase extends m.IDashboardBase {}

/**
 * @deprecated Use {@link @gooddata/sdk-model#IDashboardPluginBase}
 * @alpha
 */
export interface IDashboardPluginBase extends m.IDashboardPluginBase {}

/**
 * @deprecated Use {@link @gooddata/sdk-model#IDashboardPlugin}
 * @alpha
 */
export interface IDashboardPlugin extends m.IDashboardPlugin {}

/**
 * @deprecated Use {@link @gooddata/sdk-model#IDashboardPluginDefinition}
 * @alpha
 */
export interface IDashboardPluginDefinition extends m.IDashboardPluginDefinition {}

/**
 * A link between dashboard and a plugin that it uses. Optionally contains parameters that should
 * be passed to the plugin at load time.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IDashboardPluginLink}
 * @alpha
 */
export interface IDashboardPluginLink extends m.IDashboardPluginLink {}

/**
 * Object share status
 *
 * @remarks
 * private - object accessible only by its creator
 * shared - object shared with closed set of users/groups
 * public - accessible by everyone in project
 *
 * @deprecated Use {@link @gooddata/sdk-model#ShareStatus}
 * @alpha
 */
export type ShareStatus = m.ShareStatus;

/**
 * Common properties for objects with controlled access
 * @deprecated Use {@link @gooddata/sdk-model#IAccessControlAware}
 * @alpha
 */
export interface IAccessControlAware extends m.IAccessControlAware {}

/**
 * Analytical dashboard consists of widgets
 * (widgets are kpis or insights with additional settings - drilling and alerting),
 * layout (which defines rendering and ordering of these widgets),
 * and filter context (configured attribute and date filters).
 * It's also possible to setup scheduled emails for the dashboard
 * (user will receive an email with the exported dashboard attached at the specified time interval),
 * and optionally extended date filter config.
 * @deprecated Use {@link @gooddata/sdk-model#IDashboard}
 * @alpha
 */
export interface IDashboard<TWidget = m.IDashboardWidget> extends m.IDashboard<TWidget> {}

/**
 * Dashboard definition represents modified or created dashboard
 *
 * @deprecated Use {@link @gooddata/sdk-model#IDashboardDefinition}
 * @alpha
 */
export interface IDashboardDefinition<TWidget = m.IDashboardWidget> extends m.IDashboardDefinition<TWidget> {}

/**
 * Tests whether the provided object is an instance of {@link IDashboard}.
 *
 * @param obj - object to test
 * @deprecated Use {@link @gooddata/sdk-model#isDashboard}
 * @alpha
 */
export const isDashboard = m.isDashboard;

/**
 * Tests whether the provided object is an instance of {@link IDashboardDefinition}.
 *
 * @param obj - object to test
 * @deprecated Use {@link @gooddata/sdk-model#isDashboardDefinition}
 * @alpha
 */
export const isDashboardDefinition = m.isDashboardDefinition;

/**
 * Availability of {@link IListedDashboard}.
 * Either full (the listed dashboard is also available as a fully accessible metadata object) or
 * only via link (full metadata object is not accessible, only the listed dashboard record).
 * @deprecated Use {@link @gooddata/sdk-model#ListedDashboardAvailability}
 * @alpha
 */
export type ListedDashboardAvailability = m.ListedDashboardAvailability;

/**
 * Listed dashboard - to display the dashboard in the list
 * Only a subset of dashboard data is available,
 * for the full definition see {@link IDashboard}
 * @deprecated Use {@link @gooddata/sdk-model#IListedDashboard}
 * @alpha
 */
export interface IListedDashboard extends m.IListedDashboard {}
