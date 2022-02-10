// (C) 2021-2022 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { ICustomWidgetBase } from "../../model";

/**
 * @alpha
 */
export interface KpiPlaceholderWidget extends ICustomWidgetBase {
    readonly customType: "kpiPlaceholder";
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
 * @alpha
 */
export interface InsightPlaceholderWidget extends ICustomWidgetBase {
    readonly customType: "insightPlaceholder";
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
