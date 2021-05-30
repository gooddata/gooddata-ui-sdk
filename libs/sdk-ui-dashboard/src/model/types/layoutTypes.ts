// (C) 2021 GoodData Corporation

import { DashboardWidget, IDashboardLayoutItem } from "@gooddata/sdk-backend-spi";

/**
 * @internal
 */
export type KpiPlaceholderWidget = {
    readonly type: "kpiPlaceholder";
};

/**
 * @internal
 */
export type InsightPlaceholderWidget = {
    readonly type: "insightPlaceholder";
};

/**
 * Extension of the default DashboardWidget type to also include view-only widget types for KPI placeholder
 * and Insight placeholder.
 *
 * @internal
 */
export type ExtendedDashboardWidget = DashboardWidget | KpiPlaceholderWidget | InsightPlaceholderWidget;

/**
 * Specialization of the IDashboardLayoutItem which also includes the extended dashboard widgets - KPI and
 * Insight placeholders.
 *
 * @internal
 */
export type ExtendedDashboardItem = IDashboardLayoutItem<ExtendedDashboardWidget>;
