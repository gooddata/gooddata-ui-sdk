// (C) 2021-2023 GoodData Corporation
import {
    CustomDashboardInsightComponent,
    CustomDashboardInsightMenuButtonComponent,
    CustomDashboardInsightMenuComponent,
    CustomDashboardInsightMenuTitleComponent,
    CustomDashboardKpiComponent,
    CustomDashboardWidgetComponent,
    CustomInsightBodyComponent,
    IInsightMenuItem,
} from "../widget/types.js";
import { ExtendedDashboardWidget } from "../../model/index.js";
import {
    CustomDashboardAttributeFilterComponent,
    CustomDashboardDateFilterComponent,
} from "../filterBar/types.js";
import { RenderMode } from "../../types.js";
import {
    IInsight,
    IDashboardAttributeFilter,
    IKpiWidget,
    IInsightWidget,
    IKpi,
    IDashboardDateFilter,
} from "@gooddata/sdk-model";

/**
 * @public
 */
export type OptionalProvider<T> = T extends (...args: infer TArgs) => infer TRes
    ? (...args: TArgs) => TRes | undefined
    : never;

/**
 * @public
 */
export type WidgetComponentProvider = (widget: ExtendedDashboardWidget) => CustomDashboardWidgetComponent;

/**
 * @public
 */
export type OptionalWidgetComponentProvider = OptionalProvider<WidgetComponentProvider>;

/**
 * @public
 */
export type InsightComponentProvider = (
    insight: IInsight,
    widget: IInsightWidget,
) => CustomDashboardInsightComponent;

/**
 * @public
 */
export type OptionalInsightComponentProvider = OptionalProvider<InsightComponentProvider>;

/**
 * @alpha
 */
export type InsightBodyComponentProvider = (
    insight: IInsight,
    widget: IInsightWidget,
) => CustomInsightBodyComponent;

/**
 * @alpha
 */
export type OptionalInsightBodyComponentProvider = OptionalProvider<InsightBodyComponentProvider>;

/**
 * @alpha
 */
export type InsightMenuButtonComponentProvider = (
    insight: IInsight,
    widget: IInsightWidget,
) => CustomDashboardInsightMenuButtonComponent;

/**
 * @alpha
 */
export type OptionalInsightMenuButtonComponentProvider = OptionalProvider<InsightMenuButtonComponentProvider>;

/**
 * @alpha
 */
export type InsightMenuComponentProvider = (
    insight: IInsight,
    widget: IInsightWidget,
) => CustomDashboardInsightMenuComponent;

/**
 * @alpha
 */
export type OptionalInsightMenuComponentProvider = OptionalProvider<InsightMenuComponentProvider>;

/**
 * @internal
 */
export type InsightMenuTitleComponentProvider = (
    insight: IInsight,
    widget: IInsightWidget,
) => CustomDashboardInsightMenuTitleComponent;

/**
 * @internal
 */
export type OptionalInsightMenuTitleComponentProvider = OptionalProvider<InsightMenuTitleComponentProvider>;

/**
 * @beta
 */
export type InsightMenuItemsProvider = (
    insight: IInsight,
    widget: IInsightWidget,
    defaultItems: IInsightMenuItem[],
    closeMenu: () => void,
    renderMode: RenderMode,
) => IInsightMenuItem[];

/**
 * @public
 */
export type KpiComponentProvider = (kpi: IKpi, widget: IKpiWidget) => CustomDashboardKpiComponent;

/**
 * @public
 */
export type OptionalKpiComponentProvider = OptionalProvider<KpiComponentProvider>;

/**
 * @public
 */
export type DateFilterComponentProvider = (
    filter: IDashboardDateFilter,
) => CustomDashboardDateFilterComponent;

/**
 * @public
 */
export type OptionalDateFilterComponentProvider = OptionalProvider<DateFilterComponentProvider>;

/**
 * @public
 */
export type AttributeFilterComponentProvider = (
    filter: IDashboardAttributeFilter,
) => CustomDashboardAttributeFilterComponent;

/**
 * @public
 */
export type OptionalAttributeFilterComponentProvider = OptionalProvider<AttributeFilterComponentProvider>;
