// (C) 2024 GoodData Corporation

import {
    bucketMeasures,
    IAlertComparisonOperator,
    IAutomationMetadataObjectDefinition,
    IBucket,
    IFilter,
    IInsight,
    IMeasure,
    insightBucket,
    measureAlias,
    measureTitle,
} from "@gooddata/sdk-model";
import { COMPARISON_OPERATORS } from "./constants.js";
import { BucketNames } from "@gooddata/sdk-ui";
import { messages } from "./messages.js";
import { IntlShape } from "react-intl";

/**
 * @internal
 */
export const getMeasureTitle = (measure: IMeasure) => {
    return measure ? measureTitle(measure) ?? measureAlias(measure) : undefined;
};

/**
 * @internal
 */
export const getComparisonOperatorTitle = (operator: IAlertComparisonOperator, intl: IntlShape): string => {
    const titleByOperator: Record<IAlertComparisonOperator, string> = {
        [COMPARISON_OPERATORS.COMPARISON_OPERATOR_LESS_THAN]: messages.comparisonOperatorLessThan.id,
        [COMPARISON_OPERATORS.COMPARISON_OPERATOR_LESS_THAN_OR_EQUALS]:
            messages.comparisonOperatorLessThanOrEquals.id,
        [COMPARISON_OPERATORS.COMPARISON_OPERATOR_GREATER_THAN]: messages.comparisonOperatorGreaterThan.id,
        [COMPARISON_OPERATORS.COMPARISON_OPERATOR_GREATER_THAN_OR_EQUALS]:
            messages.comparisonOperatorGreaterThanOrEquals.id,
    };

    return intl.formatMessage({ id: titleByOperator[operator] });
};

/**
 * @internal
 */
export const createDefaultAlert = (
    filters: IFilter[],
    measure: IMeasure,
    notificationChannelId: string,
    comparisonOperator: IAlertComparisonOperator = "GREATER_THAN",
): IAutomationMetadataObjectDefinition => {
    return {
        type: "automation",
        title: getMeasureTitle(measure),
        description: "",
        webhook: notificationChannelId,
        alert: {
            condition: {
                type: "comparison",
                left: measure,
                operator: comparisonOperator,
                right: undefined!,
            },
            execution: {
                attributes: [],
                measures: [measure],
                filters,
            },
            trigger: {
                state: "ACTIVE",
            },
        },
    };
};

type InsightType =
    | "headline"
    | "scatter"
    | "donut"
    | "treemap"
    | "combo2"
    | "heatmap"
    | "bubble"
    | "bullet"
    | "bar"
    | "table"
    | "area"
    | "column"
    | "line"
    | "pushpin"
    | "pie"
    | "sankey"
    | "dependencywheel"
    | "funnel"
    | "pyramid"
    | "waterfall"
    | "repeater";

export const getSupportedInsightMeasuresByInsight = (insight: IInsight) => {
    const visualizationUrl = insight?.insight.visualizationUrl;
    const insightType = visualizationUrl?.split(":")[1] as InsightType;

    switch (insightType) {
        case "headline": {
            const insightMeasuresBucket: IBucket | undefined = insight
                ? insightBucket(insight, BucketNames.MEASURES)
                : undefined;
            return insightMeasuresBucket ? bucketMeasures(insightMeasuresBucket) : [];
        }
        case "scatter":
        case "donut":
        case "treemap":
        case "combo2":
        case "heatmap":
        case "bubble":
        case "bullet":
        case "bar":
        case "table":
        case "area":
        case "column":
        case "line":
        case "pushpin":
        case "pie":
        case "sankey":
        case "dependencywheel":
        case "funnel":
        case "pyramid":
        case "waterfall":
        case "repeater":
        default: {
            return [];
        }
    }
};
