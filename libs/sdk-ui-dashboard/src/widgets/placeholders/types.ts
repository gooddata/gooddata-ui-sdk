// (C) 2021-2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type ICustomWidget, newCustomWidget } from "../../model/types/layoutTypes.js";

/**
 * @alpha
 */
export interface IKpiPlaceholderWidget extends ICustomWidget {
    readonly customType: "gd-kpi-placeholder";
}

/**
 * Tests whether an object is a {@link IKpiPlaceholderWidget}.
 *
 * @param obj - object to test
 * @alpha
 */
export function isKpiPlaceholderWidget(obj: unknown): obj is IKpiPlaceholderWidget {
    return !isEmpty(obj) && (obj as IKpiPlaceholderWidget).customType === "gd-kpi-placeholder";
}

/**
 * @internal
 */
export const KPI_PLACEHOLDER_WIDGET_ID = "__kpiPlaceholder__";

/**
 * @alpha
 */
export function newKpiPlaceholderWidget(): IKpiPlaceholderWidget {
    return newCustomWidget(KPI_PLACEHOLDER_WIDGET_ID, "gd-kpi-placeholder");
}

/**
 * @alpha
 */
export interface IInsightPlaceholderWidget extends ICustomWidget {
    readonly customType: "gd-insight-placeholder";
}

/**
 * Tests whether an object is a {@link IInsightPlaceholderWidget}.
 *
 * @param obj - object to test
 * @alpha
 */
export function isInsightPlaceholderWidget(obj: unknown): obj is IInsightPlaceholderWidget {
    return !isEmpty(obj) && (obj as IInsightPlaceholderWidget).customType === "gd-insight-placeholder";
}

/**
 * @internal
 */
export const INSIGHT_PLACEHOLDER_WIDGET_ID = "__insightPlaceholder__";

/**
 * @alpha
 */
export function newInsightPlaceholderWidget(): IInsightPlaceholderWidget {
    return newCustomWidget(INSIGHT_PLACEHOLDER_WIDGET_ID, "gd-insight-placeholder");
}

/**
 * @alpha
 */
export interface IPlaceholderWidget extends ICustomWidget {
    readonly customType: "gd-widget-placeholder";
    readonly isInitial?: boolean;
    readonly isLoading?: boolean;
}

/**
 * Tests whether an object is a {@link IPlaceholderWidget}.
 *
 * @param obj - object to test
 * @alpha
 */
export function isPlaceholderWidget(obj: unknown): obj is IPlaceholderWidget {
    return !isEmpty(obj) && (obj as IPlaceholderWidget).customType === "gd-widget-placeholder";
}

/**
 * Tests whether an object is a {@link IPlaceholderWidget} and is initial.
 *
 * @param obj - object to test
 * @internal
 */
export function isInitialPlaceholderWidget(obj: unknown): obj is IPlaceholderWidget {
    return isPlaceholderWidget(obj) && !!obj.isInitial;
}

/**
 * Tests whether an object is a {@link IPlaceholderWidget} and is loading.
 *
 * @param obj - object to test
 * @internal
 */
export function isLoadingPlaceholderWidget(obj: unknown): obj is IPlaceholderWidget {
    return isPlaceholderWidget(obj) && !!obj.isLoading;
}

/**
 * @internal
 */
export const PLACEHOLDER_WIDGET_ID = "__placeholder__";

/**
 * @alpha
 */
export function newPlaceholderWidget(): IPlaceholderWidget {
    return newCustomWidget(PLACEHOLDER_WIDGET_ID, "gd-widget-placeholder");
}

/**
 * @internal
 */
export function newInitialPlaceholderWidget(): IPlaceholderWidget {
    return newCustomWidget(PLACEHOLDER_WIDGET_ID, "gd-widget-placeholder", {
        isInitial: true,
    }) as IPlaceholderWidget;
}

/**
 * @internal
 */
export function newLoadingPlaceholderWidget(): IPlaceholderWidget {
    return newCustomWidget(PLACEHOLDER_WIDGET_ID, "gd-widget-placeholder", {
        isLoading: true,
    }) as IPlaceholderWidget;
}

/**
 * Tests whether an object is any type of placeholder widgets.
 *
 * @param obj - object to test
 * @alpha
 */
export function isAnyPlaceholderWidget(
    obj: unknown,
): obj is IPlaceholderWidget | IInsightPlaceholderWidget | IKpiPlaceholderWidget {
    return isPlaceholderWidget(obj) || isInsightPlaceholderWidget(obj) || isKpiPlaceholderWidget(obj);
}
