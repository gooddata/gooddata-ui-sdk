// (C) 2024 GoodData Corporation

import {
    bucketMeasures,
    IAlertComparisonOperator,
    IAutomationAlert,
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IBucket,
    IFilter,
    IInsight,
    IMeasure,
    insightBucket,
    insightVisualizationType,
    IPoPMeasureDefinition,
    IPreviousPeriodMeasureDefinition,
    isArithmeticMeasure,
    isPoPMeasure,
    isPreviousPeriodMeasure,
    isSimpleMeasure,
    measureAlias,
    measureTitle,
} from "@gooddata/sdk-model";
import { BucketNames, VisType } from "@gooddata/sdk-ui";
import { IntlShape } from "react-intl";

import { AlertMetric, AlertMetricComparatorType } from "../../types.js";

import {
    COMPARISON_OPERATORS,
    COMPARISON_OPERATOR_OPTIONS,
    CHANGE_COMPARISON_OPERATOR_OPTIONS,
    DIFFERENCE_COMPARISON_OPERATOR_OPTIONS,
} from "./constants.js";
import { messages } from "./messages.js";

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
    measure: AlertMetric,
    notificationChannelId: string,
    comparisonOperator: IAlertComparisonOperator = "GREATER_THAN",
): IAutomationMetadataObjectDefinition => {
    return {
        type: "automation",
        title: getMeasureTitle(measure.measure),
        notificationChannel: notificationChannelId,
        alert: {
            condition: {
                type: "comparison",
                left: measure.measure.measure.localIdentifier,
                operator: comparisonOperator,
                right: undefined!,
            },
            execution: {
                attributes: [],
                measures: [measure.measure],
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

export const getSupportedInsightMeasuresByInsight = (insight: IInsight | null | undefined): AlertMetric[] => {
    const allMetrics = collectAllMetric(insight);

    const simpleMetrics = allMetrics
        .map<AlertMetric | undefined>((measure) => {
            if (isSimpleMeasure(measure) || isArithmeticMeasure(measure)) {
                return {
                    measure,
                    comparators: [],
                };
            }
            return undefined;
        })
        .filter(Boolean) as AlertMetric[];

    const previousPeriodMetrics = allMetrics.filter((measure) =>
        isPreviousPeriodMeasure(measure),
    ) as IMeasure<IPreviousPeriodMeasureDefinition>[];
    previousPeriodMetrics.forEach((measure) => {
        const found = simpleMetrics.find(
            (simpleMetric) =>
                simpleMetric.measure.measure.localIdentifier ===
                measure.measure.definition.previousPeriodMeasure.measureIdentifier,
        );
        if (found) {
            found.comparators.push({
                measure,
                comparator: AlertMetricComparatorType.PreviousPeriod,
            });
        }
    });

    const popMetrics = allMetrics.filter((measure) =>
        isPoPMeasure(measure),
    ) as IMeasure<IPoPMeasureDefinition>[];
    popMetrics.forEach((measure) => {
        const found = simpleMetrics.find(
            (simpleMetric) =>
                simpleMetric.measure.measure.localIdentifier ===
                measure.measure.definition.popMeasureDefinition.measureIdentifier,
        );
        if (found) {
            found.comparators.push({
                measure,
                comparator: AlertMetricComparatorType.SamePeriodPreviousYear,
            });
        }
    });

    return simpleMetrics;
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

function collectAllMetric(insight: IInsight | null | undefined) {
    const visualizationUrl = insight?.insight.visualizationUrl;
    const insightType = visualizationUrl?.split(":")[1] as InsightType;

    switch (insightType) {
        case "headline":
        case "bar":
        case "column":
        case "line":
        case "area":
        case "combo2":
        case "scatter":
        case "bubble": {
            const insightMeasuresBucket: IBucket | undefined = insight
                ? insightBucket(insight, BucketNames.MEASURES)
                : undefined;
            const insightSecondaryMeasuresBucket: IBucket | undefined = insight
                ? insightBucket(insight, BucketNames.SECONDARY_MEASURES)
                : undefined;
            const insightTertiaryMeasuresBucket: IBucket | undefined = insight
                ? insightBucket(insight, BucketNames.TERTIARY_MEASURES)
                : undefined;
            return [
                ...(insightMeasuresBucket ? bucketMeasures(insightMeasuresBucket) : []),
                ...(insightSecondaryMeasuresBucket ? bucketMeasures(insightSecondaryMeasuresBucket) : []),
                ...(insightTertiaryMeasuresBucket ? bucketMeasures(insightTertiaryMeasuresBucket) : []),
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
}

export function getValueSuffix(alert?: IAutomationAlert): string | undefined {
    if (isChangeOperator(alert)) {
        return "%";
    }
    if (isDifferenceOperator(alert)) {
        return undefined;
    }
    return undefined;
}

export function isChangeOperator(alert?: IAutomationAlert): boolean {
    const changeOperators = CHANGE_COMPARISON_OPERATOR_OPTIONS.map((operator) => operator.id);
    return Boolean(alert && changeOperators.includes(alert.condition.operator));
}

export function isDifferenceOperator(alert?: IAutomationAlert): boolean {
    const changeOperators = DIFFERENCE_COMPARISON_OPERATOR_OPTIONS.map((operator) => operator.id);
    return Boolean(alert && changeOperators.includes(alert.condition.operator));
}

export function isChangeOrDifferenceOperator(alert?: IAutomationAlert): boolean {
    return isChangeOperator(alert) || isDifferenceOperator(alert);
}

//alerts transformations

export function transformAlertByMetric(
    alert: IAutomationMetadataObject,
    measure: AlertMetric,
): IAutomationMetadataObject {
    const isChangeOperator = isChangeOrDifferenceOperator(alert.alert);
    const hasComparisonOperator = measure.comparators.find(
        (c) =>
            c.comparator === AlertMetricComparatorType.PreviousPeriod ||
            c.comparator === AlertMetricComparatorType.SamePeriodPreviousYear,
    );

    return {
        ...alert,
        title: getMeasureTitle(measure.measure) ?? "",
        alert: {
            ...alert.alert!,
            condition: {
                ...alert.alert!.condition,
                ...(isChangeOperator && !hasComparisonOperator
                    ? {
                          operator: COMPARISON_OPERATOR_OPTIONS[0].id,
                      }
                    : {}),
                left: measure.measure.measure.localIdentifier,
            },
            execution: {
                ...alert.alert!.execution,
                measures: [measure.measure],
            },
        },
    };
}

export function transformAlertByComparisonOperator(
    alert: IAutomationMetadataObject,
    comparisonOperator: IAlertComparisonOperator,
): IAutomationMetadataObject {
    return {
        ...alert,
        alert: {
            ...alert.alert!,
            condition: {
                ...alert.alert!.condition,
                operator: comparisonOperator,
            },
        },
    };
}

export function transformAlertByValue(
    alert: IAutomationMetadataObject,
    value: number,
): IAutomationMetadataObject {
    return {
        ...alert,
        alert: {
            ...alert.alert!,
            condition: {
                ...alert.alert!.condition,
                right: value,
            },
        },
    };
}

export function transformAlertByDestination(
    alert: IAutomationMetadataObject,
    notificationChannel: string,
): IAutomationMetadataObject {
    return {
        ...alert,
        notificationChannel,
    };
}
