// (C) 2022-2024 GoodData Corporation
import {
    IAlertComparisonOperator,
    IAlertRelativeArithmeticOperator,
    IAlertRelativeOperator,
    IAutomationAlertComparisonCondition,
    IAutomationAlertCondition,
    IAutomationAlertExecutionDefinition,
    IAutomationAlertRelativeCondition,
    IAutomationMetadataObject,
    IAutomationRecipient,
    ICatalogMeasure,
    IFilter,
    isArithmeticMeasure,
} from "@gooddata/sdk-model";

import {
    AlertAttribute,
    AlertMetric,
    AlertMetricComparator,
    AlertMetricComparatorType,
} from "../../../types.js";
import { ARITHMETIC_OPERATORS, COMPARISON_OPERATORS, RELATIVE_OPERATORS } from "../constants.js";

import { getAttributeRelatedFilterInfo, getMeasureFormat, getMeasureTitle } from "./getters.js";

//alerts transformations

/**
 * This function transforms alert by metric. It changes title, condition and execution based on selected metric.
 * @param metrics - all available metrics
 * @param alert - alert to transform
 * @param measure - selected metric
 * @param catalogMeasures - all available measures from catalog
 */
export function transformAlertByMetric(
    metrics: AlertMetric[],
    alert: IAutomationMetadataObject,
    measure: AlertMetric,
    catalogMeasures?: ICatalogMeasure[],
): IAutomationMetadataObject {
    const periodMeasure = measure.comparators.find(
        (c) =>
            c.comparator === AlertMetricComparatorType.PreviousPeriod ||
            c.comparator === AlertMetricComparatorType.SamePeriodPreviousYear,
    );

    if (alert.alert?.condition.type === "relative" && periodMeasure) {
        const cond = transformToRelativeCondition(alert.alert!.condition);
        const condition = {
            ...cond,
            measure: {
                ...cond.measure,
                ...transformRelativeCondition(measure, periodMeasure, catalogMeasures),
            },
        } as IAutomationAlertRelativeCondition;
        return {
            ...alert,
            title: getMeasureTitle(measure.measure) ?? "",
            alert: {
                ...alert.alert!,
                condition,
                execution: transformAlertExecutionByMetric(
                    metrics,
                    condition,
                    alert.alert!.execution,
                    measure,
                ),
            },
        };
    }

    const cond = transformToComparisonCondition(alert.alert!.condition);
    const condition = {
        ...cond,
        left: {
            id: measure.measure.measure.localIdentifier,
            format: getMeasureFormat(measure.measure, catalogMeasures),
            title: getMeasureTitle(measure.measure),
        },
    } as IAutomationAlertComparisonCondition;
    return {
        ...alert,
        title: getMeasureTitle(measure.measure) ?? "",
        alert: {
            ...alert.alert!,
            condition,
            execution: transformAlertExecutionByMetric(metrics, condition, alert.alert!.execution, measure),
        },
    };
}

/**
 * This function get selected attributed and optionally value amd added this attribute to execution.
 * If value is provided, it creates positive attribute filter with this value, otherwise it creates negative attribute filter
 * that is empty for now.
 * @param attributes - all available attributes
 * @param alert - alert to transform
 * @param attr - optionally selected attribute
 * @param value - optionally selected value
 */
export function transformAlertByAttribute(
    attributes: AlertAttribute[],
    alert: IAutomationMetadataObject,
    attr: AlertAttribute | undefined,
    value:
        | {
              title: string;
              value: string;
              name: string;
          }
        | undefined,
): IAutomationMetadataObject {
    const { filterDefinition } = getAttributeRelatedFilterInfo(
        attributes,
        alert,
        alert.alert?.execution.attributes[0],
    );
    const originalFilters = alert.alert?.execution.filters.filter((f) => f !== filterDefinition) ?? [];

    const customFilters: IFilter[] = [];
    if (attr) {
        if (value !== undefined) {
            customFilters.push({
                positiveAttributeFilter: {
                    displayForm: {
                        localIdentifier: attr.attribute.attribute.localIdentifier,
                    },
                    in: {
                        values: [value.name],
                    },
                },
            });
        } else {
            customFilters.push({
                negativeAttributeFilter: {
                    displayForm: {
                        localIdentifier: attr.attribute.attribute.localIdentifier,
                    },
                    notIn: {
                        values: [],
                    },
                },
            });
        }
    }

    return {
        ...alert,
        alert: {
            ...alert.alert!,
            execution: {
                ...alert.alert!.execution,
                attributes: attr ? [attr.attribute] : [],
                filters: [...originalFilters, ...customFilters],
            },
        },
    };
}

/**
 * This function transforms alert by comparison operator. It changes operator in condition.
 * @param metrics - all available metrics
 * @param alert - alert to transform
 * @param measure - selected metric
 * @param comparisonOperator - selected comparison operator
 */
export function transformAlertByComparisonOperator(
    metrics: AlertMetric[],
    alert: IAutomationMetadataObject,
    measure: AlertMetric,
    comparisonOperator: IAlertComparisonOperator,
): IAutomationMetadataObject {
    const cond = transformToComparisonCondition(alert.alert!.condition);
    const condition = {
        ...cond,
        operator: comparisonOperator,
    };
    return {
        ...alert,
        alert: {
            ...alert.alert!,
            condition,
            execution: transformAlertExecutionByMetric(metrics, condition, alert.alert!.execution, measure),
        },
    };
}

/**
 * This function transforms alert by relative operator. It changes operator in condition and measure in condition.
 * @param metrics - all available metrics
 * @param alert - alert to transform
 * @param measure - selected metric
 * @param relativeOperator - selected relative operator
 * @param arithmeticOperator - selected arithmetic operator
 * @param catalogMeasures - all available measures from catalog
 */
export function transformAlertByRelativeOperator(
    metrics: AlertMetric[],
    alert: IAutomationMetadataObject,
    measure: AlertMetric,
    relativeOperator: IAlertRelativeOperator,
    arithmeticOperator: IAlertRelativeArithmeticOperator,
    catalogMeasures?: ICatalogMeasure[],
): IAutomationMetadataObject {
    const periodMeasure = measure.comparators.find(
        (c) =>
            c.comparator === AlertMetricComparatorType.PreviousPeriod ||
            c.comparator === AlertMetricComparatorType.SamePeriodPreviousYear,
    );

    const cond = transformToRelativeCondition(alert.alert!.condition);
    const condition = {
        ...cond,
        measure: {
            ...cond.measure,
            operator: arithmeticOperator,
            ...transformRelativeCondition(measure, periodMeasure, catalogMeasures),
        },
        operator: relativeOperator,
    } as IAutomationAlertCondition;
    return {
        ...alert,
        alert: {
            ...alert.alert!,
            condition,
            execution: transformAlertExecutionByMetric(metrics, condition, alert.alert!.execution, measure),
        },
    };
}

/**
 * This function transforms alert by threshold value. It changes threshold in condition.
 * @param alert - alert to transform
 * @param value - selected threshold value
 */
export function transformAlertByValue(
    alert: IAutomationMetadataObject,
    value: number,
): IAutomationMetadataObject {
    if (alert.alert?.condition.type === "relative") {
        return {
            ...alert,
            alert: {
                ...alert.alert!,
                condition: {
                    ...alert.alert!.condition,
                    threshold: value,
                },
            },
        };
    }
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

/**
 * This function transforms alert by notification channel. It changes notification channel in alert.
 * @param alert - alert to transform
 * @param notificationChannel - selected notification channel
 * @param recipients - optionally selected recipients
 */
export function transformAlertByDestination(
    alert: IAutomationMetadataObject,
    notificationChannel: string,
    recipients?: IAutomationRecipient[],
): IAutomationMetadataObject {
    return {
        ...alert,
        ...(recipients ? { recipients } : {}),
        notificationChannel,
    };
}

/**
 * This function transforms alert execution by metric. It changes measures and auxMeasures in execution based on selected metric.
 * @param metrics - all available metrics
 * @param condition - alert condition
 * @param execution - alert execution
 * @param measure - selected metric
 */
export function transformAlertExecutionByMetric(
    metrics: AlertMetric[],
    condition: IAutomationAlertCondition,
    execution: IAutomationAlertExecutionDefinition,
    measure: AlertMetric,
): IAutomationAlertExecutionDefinition {
    const periodMeasure = measure.comparators.find(
        (c) =>
            c.comparator === AlertMetricComparatorType.PreviousPeriod ||
            c.comparator === AlertMetricComparatorType.SamePeriodPreviousYear,
    );

    if (condition.type === "relative" && periodMeasure) {
        return {
            ...execution,
            measures: [measure.measure, periodMeasure.measure],
            auxMeasures: [
                ...collectAllRelatedMeasures(metrics, measure.measure),
                ...collectAllRelatedMeasures(metrics, periodMeasure.measure),
            ],
        };
    }

    return {
        ...execution,
        measures: [measure.measure],
        auxMeasures: collectAllRelatedMeasures(metrics, measure.measure),
    };
}

//alerts transformations utils

function transformToComparisonCondition(
    condition: IAutomationAlertCondition,
): IAutomationAlertComparisonCondition {
    if (condition.type === "relative") {
        return {
            type: "comparison",
            operator: COMPARISON_OPERATORS.COMPARISON_OPERATOR_GREATER_THAN,
            left: condition.measure.left,
            right: condition.threshold,
        };
    }

    return {
        type: "comparison",
        operator: condition.operator,
        right: condition.right,
        left: condition.left,
    };
}

function transformToRelativeCondition(
    condition: IAutomationAlertCondition,
): IAutomationAlertRelativeCondition {
    if (condition.type === "comparison") {
        return {
            type: "relative",
            operator: RELATIVE_OPERATORS.RELATIVE_OPERATOR_INCREASE_BY,
            measure: {
                operator: ARITHMETIC_OPERATORS.ARITHMETIC_OPERATOR_CHANGE,
                left: condition.left,
                right: undefined!,
            },
            threshold: condition.right,
        };
    }

    return {
        type: "relative",
        operator: condition.operator,
        measure: condition.measure,
        threshold: condition.threshold,
    };
}

function transformRelativeCondition(
    measure: AlertMetric,
    periodMeasure: AlertMetricComparator | undefined,
    catalogMeasures?: ICatalogMeasure[],
) {
    return {
        ...(periodMeasure?.isPrimary && {
            left: {
                id: periodMeasure.measure.measure.localIdentifier,
                format: getMeasureFormat(periodMeasure.measure, catalogMeasures),
                title: getMeasureTitle(periodMeasure.measure),
            },
            right: {
                id: measure.measure.measure.localIdentifier,
                format: getMeasureFormat(measure.measure, catalogMeasures),
                title: getMeasureTitle(measure.measure),
            },
        }),
        ...(!periodMeasure?.isPrimary && {
            left: {
                id: measure.measure.measure.localIdentifier,
                format: getMeasureFormat(measure.measure, catalogMeasures),
                title: getMeasureTitle(measure.measure),
            },
            right: {
                id: periodMeasure?.measure.measure.localIdentifier,
                format: getMeasureFormat(periodMeasure?.measure, catalogMeasures),
                title: periodMeasure?.measure ? getMeasureTitle(periodMeasure?.measure) : undefined,
            },
        }),
    };
}

//utils

function collectAllRelatedMeasures(metrics: AlertMetric[], measure: AlertMetric["measure"]) {
    if (isArithmeticMeasure(measure)) {
        const included = measure.measure.definition.arithmeticMeasure.measureIdentifiers;
        const related = metrics.filter((m) => {
            return included.includes(m.measure.measure.localIdentifier);
        });
        return related.map((m) => m.measure);
    }
    return [];
}
