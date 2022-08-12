// (C) 2021-2022 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { ICustomWidget, newCustomWidget } from "../../model/types/layoutTypes";

/**
 * @alpha
 */
export interface KpiPlaceholderWidget extends ICustomWidget {
    readonly customType: "gd-kpi-placeholder";
    readonly sectionIndex: number;
    readonly itemIndex: number;
    readonly isLastInSection: boolean;
}

/**
 * Tests whether an object is a {@link KpiPlaceholderWidget}.
 *
 * @param obj - object to test
 * @alpha
 */
export function isKpiPlaceholderWidget(obj: unknown): obj is KpiPlaceholderWidget {
    return !isEmpty(obj) && (obj as KpiPlaceholderWidget).customType === "gd-kpi-placeholder";
}

/**
 * @internal
 */
export const KPI_PLACEHOLDER_WIDGET_ID = "__kpiPlaceholder__";

/**
 * @alpha
 */
export function newKpiPlaceholderWidget(
    sectionIndex: number,
    itemIndex: number,
    isLastInSection: boolean,
): KpiPlaceholderWidget {
    return newCustomWidget(KPI_PLACEHOLDER_WIDGET_ID, "gd-kpi-placeholder", {
        sectionIndex,
        itemIndex,
        isLastInSection,
    }) as KpiPlaceholderWidget;
}

/**
 * @alpha
 */
export interface InsightPlaceholderWidget extends ICustomWidget {
    readonly customType: "gd-insight-placeholder";
    readonly sectionIndex: number;
    readonly itemIndex: number;
    readonly isLastInSection: boolean;
}

/**
 * Tests whether an object is a {@link InsightPlaceholderWidget}.
 *
 * @param obj - object to test
 * @alpha
 */
export function isInsightPlaceholderWidget(obj: unknown): obj is InsightPlaceholderWidget {
    return !isEmpty(obj) && (obj as InsightPlaceholderWidget).customType === "gd-insight-placeholder";
}

/**
 * @internal
 */
export const INSIGHT_PLACEHOLDER_WIDGET_ID = "__insightPlaceholder__";

/**
 * @alpha
 */
export function newInsightPlaceholderWidget(
    sectionIndex: number,
    itemIndex: number,
    isLastInSection: boolean,
): InsightPlaceholderWidget {
    return newCustomWidget(INSIGHT_PLACEHOLDER_WIDGET_ID, "gd-insight-placeholder", {
        sectionIndex,
        itemIndex,
        isLastInSection,
    }) as InsightPlaceholderWidget;
}

/**
 * @alpha
 */
export interface PlaceholderWidget extends ICustomWidget {
    readonly customType: "gd-widget-placeholder";
    readonly sectionIndex: number;
    readonly itemIndex: number;
    readonly isLastInSection: boolean;
}

/**
 * Tests whether an object is a {@link PlaceholderWidget}.
 *
 * @param obj - object to test
 * @alpha
 */
export function isPlaceholderWidget(obj: unknown): obj is PlaceholderWidget {
    return !isEmpty(obj) && (obj as PlaceholderWidget).customType === "gd-widget-placeholder";
}

/**
 * @internal
 */
export const PLACEHOLDER_WIDGET_ID = "__placeholder__";

/**
 * @alpha
 */
export function newPlaceholderWidget(
    sectionIndex: number,
    itemIndex: number,
    isLastInSection: boolean,
): InsightPlaceholderWidget {
    return newCustomWidget(PLACEHOLDER_WIDGET_ID, "gd-widget-placeholder", {
        sectionIndex,
        itemIndex,
        isLastInSection,
    }) as InsightPlaceholderWidget;
}

/**
 * Tests whether an object is any type of placeholder widgets.
 *
 * @param obj - object to test
 * @alpha
 */
export function isAnyPlaceholderWidget(
    obj: unknown,
): obj is PlaceholderWidget | InsightPlaceholderWidget | KpiPlaceholderWidget {
    return isPlaceholderWidget(obj) || isInsightPlaceholderWidget(obj) || isKpiPlaceholderWidget(obj);
}
