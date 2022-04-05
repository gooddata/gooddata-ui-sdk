// (C) 2021-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import * as m from "@gooddata/sdk-model";

/**
 * Reserved type names used for dashboard's built-in analytical widgets.
 * @deprecated Use {@link @gooddata/sdk-model#AnalyticalWidgetType}
 * @alpha
 */
export type AnalyticalWidgetType = m.AnalyticalWidgetType;

/**
 * @deprecated Use {@link @gooddata/sdk-model#AnalyticalWidgetType}
 * @alpha
 */
export type WidgetType = m.WidgetType;

/**
 * Analytical Widgets are a sub-type of dashboard widgets that display analytics. Be it charts rendering
 * insights (reports) or KPIs rendering measure values optionally with their comparison.
 * @deprecated Use {@link @gooddata/sdk-model#IAnalyticalWidget}
 * @alpha
 */
export interface IAnalyticalWidget extends m.IAnalyticalWidget {}

/**
 * @deprecated Use {@link @gooddata/sdk-model#IKpiWidgetBase}
 * @alpha
 */
export interface IKpiWidgetBase extends m.IKpiWidgetBase {}

/**
 * @deprecated Use {@link @gooddata/sdk-model#IKpiWidget}
 * @alpha
 */
export interface IKpiWidget extends m.IKpiWidget {}

/**
 * @deprecated Use {@link @gooddata/sdk-model#IKpiWidgetDefinition}
 * @alpha
 */
export interface IKpiWidgetDefinition extends m.IKpiWidgetDefinition {}

/**
 * @deprecated Use {@link @gooddata/sdk-model#IInsightWidgetBase}
 * @alpha
 */
export interface IInsightWidgetBase extends m.IInsightWidgetBase {}

/**
 * @deprecated Use {@link @gooddata/sdk-model#IInsightWidgetConfiguration}
 * @alpha
 */
export interface IInsightWidgetConfiguration extends m.IInsightWidgetConfiguration {}

/**
 * @deprecated Use {@link @gooddata/sdk-model#IInsightWidget}
 * @alpha
 */
export interface IInsightWidget extends m.IInsightWidget {}

/**
 * @deprecated Use {@link @gooddata/sdk-model#IInsightWidgetDefinition}
 * @alpha
 */
export interface IInsightWidgetDefinition extends m.IInsightWidgetDefinition {}
