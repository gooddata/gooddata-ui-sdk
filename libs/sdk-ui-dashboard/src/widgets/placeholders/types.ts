// (C) 2021-2022 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { ICustomWidget, newCustomWidget } from "../../model";

/**
 * @alpha
 */
export interface KpiPlaceholderWidget extends ICustomWidget {
    readonly customType: "kpiPlaceholder";
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
    return !isEmpty(obj) && (obj as KpiPlaceholderWidget).customType === "kpiPlaceholder";
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
    return newCustomWidget(KPI_PLACEHOLDER_WIDGET_ID, "kpiPlaceholder", {
        sectionIndex,
        itemIndex,
        isLastInSection,
    }) as KpiPlaceholderWidget;
}

/**
 * @alpha
 */
export interface InsightPlaceholderWidget extends ICustomWidget {
    readonly customType: "insightPlaceholder";
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
    return !isEmpty(obj) && (obj as InsightPlaceholderWidget).customType === "insightPlaceholder";
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
    return newCustomWidget(INSIGHT_PLACEHOLDER_WIDGET_ID, "insightPlaceholder", {
        sectionIndex,
        itemIndex,
        isLastInSection,
    }) as InsightPlaceholderWidget;
}

/**
 * @alpha
 */
export interface PlaceholderWidget extends ICustomWidget {
    readonly customType: "placeholder";
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
    return !isEmpty(obj) && (obj as PlaceholderWidget).customType === "placeholder";
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
    return newCustomWidget(PLACEHOLDER_WIDGET_ID, "placeholder", {
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
