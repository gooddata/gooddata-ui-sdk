// (C) 2021-2022 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import { ICustomWidget, newCustomWidget } from "../../model/types/layoutTypes.js";

/**
 * @alpha
 */
export interface KpiPlaceholderWidget extends ICustomWidget {
    readonly customType: "gd-kpi-placeholder";
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
export function newKpiPlaceholderWidget(): KpiPlaceholderWidget {
    return newCustomWidget(KPI_PLACEHOLDER_WIDGET_ID, "gd-kpi-placeholder");
}

/**
 * @alpha
 */
export interface InsightPlaceholderWidget extends ICustomWidget {
    readonly customType: "gd-insight-placeholder";
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
export function newInsightPlaceholderWidget(): InsightPlaceholderWidget {
    return newCustomWidget(INSIGHT_PLACEHOLDER_WIDGET_ID, "gd-insight-placeholder");
}

/**
 * @alpha
 */
export interface PlaceholderWidget extends ICustomWidget {
    readonly customType: "gd-widget-placeholder";
    readonly isInitial?: boolean;
    readonly isLoading?: boolean;
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
 * Tests whether an object is a {@link PlaceholderWidget} and is initial.
 *
 * @param obj - object to test
 * @internal
 */
export function isInitialPlaceholderWidget(obj: unknown): obj is PlaceholderWidget {
    return isPlaceholderWidget(obj) && !!obj.isInitial;
}

/**
 * Tests whether an object is a {@link PlaceholderWidget} and is loading.
 *
 * @param obj - object to test
 * @internal
 */
export function isLoadingPlaceholderWidget(obj: unknown): obj is PlaceholderWidget {
    return isPlaceholderWidget(obj) && !!obj.isLoading;
}

/**
 * @internal
 */
export const PLACEHOLDER_WIDGET_ID = "__placeholder__";

/**
 * @alpha
 */
export function newPlaceholderWidget(): PlaceholderWidget {
    return newCustomWidget(PLACEHOLDER_WIDGET_ID, "gd-widget-placeholder");
}

/**
 * @internal
 */
export function newInitialPlaceholderWidget(): PlaceholderWidget {
    return newCustomWidget(PLACEHOLDER_WIDGET_ID, "gd-widget-placeholder", {
        isInitial: true,
    }) as PlaceholderWidget;
}

/**
 * @internal
 */
export function newLoadingPlaceholderWidget(): PlaceholderWidget {
    return newCustomWidget(PLACEHOLDER_WIDGET_ID, "gd-widget-placeholder", {
        isLoading: true,
    }) as PlaceholderWidget;
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
