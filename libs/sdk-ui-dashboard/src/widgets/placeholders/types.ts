// (C) 2021-2022 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { ICustomWidget, newCustomWidget } from "../../model";

/**
 * @alpha
 */
export interface KpiPlaceholderWidget extends ICustomWidget {
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
 * @alpha
 */
export function newInsightPlaceholderWidget(
    sectionIndex: number,
    itemIndex: number,
    isLastInSection: boolean,
): InsightPlaceholderWidget {
    return newCustomWidget("__insightPlaceholder__", "insightPlaceholder", {
        sectionIndex,
        itemIndex,
        isLastInSection,
    }) as InsightPlaceholderWidget;
}
