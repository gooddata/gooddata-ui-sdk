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
    insightVisualizationType,
    measureAlias,
    measureTitle,
} from "@gooddata/sdk-model";
import { COMPARISON_OPERATORS } from "./constants.js";
import { BucketNames, VisType } from "@gooddata/sdk-ui";
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
        [COMPARISON_OPERATORS.COMPARISON_OPERATOR_LESS_THAN_OR_EQUAL_TO]:
            messages.comparisonOperatorLessThanOrEquals.id,
        [COMPARISON_OPERATORS.COMPARISON_OPERATOR_GREATER_THAN]: messages.comparisonOperatorGreaterThan.id,
        [COMPARISON_OPERATORS.COMPARISON_OPERATOR_GREATER_THAN_OR_EQUAL_TO]:
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
        notificationChannel: notificationChannelId,
        alert: {
            condition: {
                type: "comparison",
                left: measure.measure.localIdentifier,
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

export const getSupportedInsightMeasuresByInsight = (insight: IInsight | null | undefined) => {
    const visualizationUrl = insight?.insight.visualizationUrl;
    const insightType = visualizationUrl?.split(":")[1] as InsightType;

    switch (insightType) {
        case "headline":
        case "bar":
        case "column":
        case "line":
        case "area": {
            const insightMeasuresBucket: IBucket | undefined = insight
                ? insightBucket(insight, BucketNames.MEASURES)
                : undefined;
            return insightMeasuresBucket ? bucketMeasures(insightMeasuresBucket) : [];
        }
        case "combo2":
        case "scatter":
        case "bubble": {
            const insightMeasuresBucket: IBucket | undefined = insight
                ? insightBucket(insight, BucketNames.MEASURES)
                : undefined;
            const insightSecondaryMeasuresBucket: IBucket | undefined = insight
                ? insightBucket(insight, BucketNames.SECONDARY_MEASURES)
                : undefined;
            return [
                ...(insightMeasuresBucket ? bucketMeasures(insightMeasuresBucket) : []),
                ...(insightSecondaryMeasuresBucket ? bucketMeasures(insightSecondaryMeasuresBucket) : []),
            ];
        }
        case "repeater": {
            const insightColumnsBucket: IBucket | undefined = insight
                ? insightBucket(insight, BucketNames.COLUMNS)
                : undefined;

            return insightColumnsBucket ? bucketMeasures(insightColumnsBucket) : [];
        }
        case "donut":
        case "treemap":
        case "heatmap":
        case "bullet":
        case "table":
        case "pushpin":
        case "pie":
        case "sankey":
        case "dependencywheel":
        case "funnel":
        case "pyramid":
        case "waterfall":
        default: {
            return [];
        }
    }
};

export const isSupportedInsightVisType = (insight: IInsight | null | undefined): boolean => {
    const type = insight ? (insightVisualizationType(insight) as VisType) : null;

    switch (type) {
        case "headline":
        case "bar":
        case "column":
        case "line":
        case "area":
        case "combo2":
        case "scatter":
        case "bubble":
        case "repeater":
            return true;
        default:
            return false;
    }
};
