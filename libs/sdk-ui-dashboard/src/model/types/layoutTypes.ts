// (C) 2021 GoodData Corporation

import { IDashboardLayoutItem, IDashboardLayoutSection, IDashboardWidget } from "@gooddata/sdk-backend-spi";
import isEmpty from "lodash/isEmpty";

/**
 * @alpha
 */
export type KpiPlaceholderWidget = {
    readonly type: "kpiPlaceholder";
};

/**
 * Tests whether an object is a {@link KpiPlaceholderWidget}.
 *
 * @param obj - object to test
 * @alpha
 */
export function isKpiPlaceholderWidget(obj: unknown): obj is KpiPlaceholderWidget {
    return !isEmpty(obj) && (obj as KpiPlaceholderWidget).type === "kpiPlaceholder";
}

/**
 * @alpha
 */
export type InsightPlaceholderWidget = {
    readonly type: "insightPlaceholder";
};

/**
 * Tests whether an object is a {@link InsightPlaceholderWidget}.
 *
 * @param obj - object to test
 * @alpha
 */
export function isInsightPlaceholderWidget(obj: unknown): obj is InsightPlaceholderWidget {
    return !isEmpty(obj) && (obj as InsightPlaceholderWidget).type === "insightPlaceholder";
}

/**
 * Extension of the default {@link @gooddata/sdk-backend-spi#DashboardWidget} type to also include view-only
 * widget types for KPI placeholder and Insight placeholder.
 *
 * @alpha
 */
export type ExtendedDashboardWidget = IDashboardWidget | KpiPlaceholderWidget | InsightPlaceholderWidget;

/**
 * Specialization of the IDashboardLayoutItem which also includes the extended dashboard widgets - KPI and
 * Insight placeholders.
 *
 * @alpha
 */
export type ExtendedDashboardItem = IDashboardLayoutItem<ExtendedDashboardWidget>;

/**
 * Identifier of a stashed dashboard items. When removing one or more item, the caller may decide to 'stash' these items
 * under some identifier. This stashed items can then be used in subsequent command that places items on the layout by
 * providing the stash identifier.
 *
 * @alpha
 */
export type StashedDashboardItemsId = string;

/**
 * Tests whether object is an instance of {@link StashedDashboardItemsId};
 *
 * @param obj - object to test
 * @alpha
 */
export function isStashedDashboardItemsId(obj: unknown): obj is StashedDashboardItemsId {
    return typeof obj === "string";
}

/**
 * This is a mark-up type that is used for properties and arguments that can contain relative index: a zero-based index
 * with added convenience of referencing last spot using index of `-1`.
 *
 * @alpha
 */
export type RelativeIndex = number;

/**
 * Definition of items that may be placed into the dashboard sections.
 *
 * @alpha
 */
export type DashboardItemDefinition = ExtendedDashboardItem | StashedDashboardItemsId;

/**
 * Dashboard layout section that can contain extended set of items - including KPI and Insight placeholders.
 *
 * @alpha
 */
export type ExtendedDashboardLayoutSection = IDashboardLayoutSection<ExtendedDashboardWidget>;
