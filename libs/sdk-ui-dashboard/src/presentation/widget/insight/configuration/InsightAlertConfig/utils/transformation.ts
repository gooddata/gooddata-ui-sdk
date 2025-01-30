// (C) 2022-2025 GoodData Corporation
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
    IRelativeDateFilter,
    IFilter,
    isArithmeticMeasure,
    isRelativeDateFilter,
    objRefToString,
} from "@gooddata/sdk-model";

import {
    AlertAttribute,
    AlertMetric,
    AlertMetricComparator,
    AlertMetricComparatorType,
} from "../../../types.js";
import { ARITHMETIC_OPERATORS, COMPARISON_OPERATORS, RELATIVE_OPERATORS } from "../constants.js";

import {
    getAttributeRelatedFilterInfo,
    getMeasureFormat,
    getMeasureTitle,
    IMeasureFormatMap,
} from "./getters.js";

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
    measureFormatMap?: IMeasureFormatMap,
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
                ...transformRelativeCondition(measure, periodMeasure, measureFormatMap),
            },
        } as IAutomationAlertRelativeCondition;

        const { execution, metadata } = transformAlertExecutionByMetric(
            metrics,
            alert,
            condition,
            measure,
            periodMeasure,
        );

        return {
            ...alert,
            title: getMeasureTitle(measure.measure) ?? "",
            alert: {
                ...alert.alert!,
                condition,
                execution,
            },
            metadata,
        };
    }

    const cond = transformToComparisonCondition(alert.alert!.condition);
    const condition = {
        ...cond,
        left: {
            id: measure.measure.measure.localIdentifier,
            format: getMeasureFormat(measure.measure, measureFormatMap),
            title: getMeasureTitle(measure.measure),
        },
    } as IAutomationAlertComparisonCondition;

    const { execution, metadata } = transformAlertExecutionByMetric(
        metrics,
        alert,
        condition,
        measure,
        undefined,
    );

    return {
        ...alert,
        title: getMeasureTitle(measure.measure) ?? "",
        alert: {
            ...alert.alert!,
            condition,
            execution,
        },
        metadata,
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

    const { execution, metadata } = transformAlertExecutionByMetric(
        metrics,
        alert,
        condition,
        measure,
        undefined,
    );

    return {
        ...alert,
        alert: {
            ...alert.alert!,
            condition,
            execution,
        },
        metadata,
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
 * @param comparatorType - selected comparator type
 */
export function transformAlertByRelativeOperator(
    metrics: AlertMetric[],
    alert: IAutomationMetadataObject,
    measure: AlertMetric,
    relativeOperator: IAlertRelativeOperator,
    arithmeticOperator: IAlertRelativeArithmeticOperator,
    measureFormatMap?: IMeasureFormatMap,
    comparatorType?: AlertMetricComparatorType,
): IAutomationMetadataObject {
    const periodMeasure = measure.comparators.filter((c) =>
        comparatorType !== undefined ? c.comparator === comparatorType : true,
    );

    const cond = transformToRelativeCondition(alert.alert!.condition);
    const condition = {
        ...cond,
        measure: {
            ...cond.measure,
            operator: arithmeticOperator,
            ...transformRelativeCondition(measure, periodMeasure[0], measureFormatMap),
        },
        operator: relativeOperator,
    } as IAutomationAlertCondition;

    const { execution, metadata } = transformAlertExecutionByMetric(
        metrics,
        alert,
        condition,
        measure,
        periodMeasure[0],
    );

    return {
        ...alert,
        alert: {
            ...alert.alert!,
            condition,
            execution,
        },
        metadata,
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
 * @param alert - alert
 * @param condition - alert condition
 * @param measure - selected metric
 * @param periodMeasure - alert comparison
 */
export function transformAlertExecutionByMetric(
    metrics: AlertMetric[],
    alert: Partial<IAutomationMetadataObject>,
    condition: IAutomationAlertCondition,
    measure: AlertMetric,
    periodMeasure: AlertMetricComparator | undefined,
): { execution: IAutomationAlertExecutionDefinition; metadata: IAutomationMetadataObject["metadata"] } {
    const execution = alert.alert?.execution;

    // Remove all filters that are create for need of alert
    const localFilters = alert.metadata?.filters ?? [];
    const originalFilters =
        execution?.filters.filter((filter) => {
            if (isRelativeDateFilter(filter)) {
                return !localFilters.includes(filter.relativeDateFilter.localIdentifier ?? "");
            }
            return true;
        }) ?? [];

    if (condition.type === "relative" && periodMeasure) {
        const addedFilters: string[] = [];

        // Add filter for period measure only if can be defined
        // For example headline not used this at all
        if (periodMeasure.dataset && periodMeasure.granularity) {
            const localIdentifier = `relativeDateFilter_${objRefToString(periodMeasure.dataset.ref)}_${
                periodMeasure.granularity
            }`;
            const filter: IRelativeDateFilter = {
                relativeDateFilter: {
                    from: 0,
                    to: 0,
                    dataSet: periodMeasure.dataset.ref,
                    granularity: periodMeasure.granularity,
                    localIdentifier,
                },
            };

            originalFilters.unshift(filter);
            addedFilters.push(localIdentifier);
        }

        return {
            execution: {
                attributes: [],
                ...execution,
                filters: [...originalFilters],
                measures: [measure.measure, periodMeasure.measure],
                auxMeasures: [
                    ...collectAllRelatedMeasures(metrics, measure.measure),
                    ...collectAllRelatedMeasures(metrics, periodMeasure.measure),
                ],
            },
            metadata: {
                ...alert.metadata,
                filters: addedFilters.length ? addedFilters : undefined,
            },
        };
    }

    return {
        execution: {
            attributes: [],
            ...execution,
            filters: [...originalFilters],
            measures: [measure.measure],
            auxMeasures: collectAllRelatedMeasures(metrics, measure.measure),
        },
        metadata: {
            ...alert.metadata,
            filters: undefined,
        },
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
    measureFormatMap?: IMeasureFormatMap,
) {
    const isNormalSetup = measure.isPrimary && !periodMeasure?.isPrimary;
    const isReverseSetup = !measure.isPrimary && periodMeasure?.isPrimary;

    //NOTE: This is case primary for headline where normal measure is in secondary bucket
    // and period measure is in primary bucket
    if (isReverseSetup) {
        return {
            left: {
                id: periodMeasure.measure.measure.localIdentifier,
                format: getMeasureFormat(periodMeasure.measure, measureFormatMap),
                title: getMeasureTitle(periodMeasure.measure),
            },
            right: {
                id: measure.measure.measure.localIdentifier,
                format: getMeasureFormat(measure.measure, measureFormatMap),
                title: getMeasureTitle(measure.measure),
            },
        };
    }

    //NOTE: This is case for normal setup where normal measure is in primary bucket
    // and period measure is in secondary bucket
    if (isNormalSetup) {
        return {
            left: {
                id: measure.measure.measure.localIdentifier,
                format: getMeasureFormat(measure.measure, measureFormatMap),
                title: getMeasureTitle(measure.measure),
            },
            right: {
                id: periodMeasure?.measure.measure.localIdentifier,
                format: getMeasureFormat(periodMeasure?.measure, measureFormatMap),
                title: periodMeasure?.measure ? getMeasureTitle(periodMeasure?.measure) : undefined,
            },
        };
    }

    //NOTE: This is case for normal setup where normal measure and period measure are
    // in same bucket, primary or secondary, but same bucket
    return {
        left: {
            id: measure.measure.measure.localIdentifier,
            format: getMeasureFormat(measure.measure, measureFormatMap),
            title: getMeasureTitle(measure.measure),
        },
        right: {
            id: periodMeasure?.measure.measure.localIdentifier,
            format: getMeasureFormat(periodMeasure?.measure, measureFormatMap),
            title: periodMeasure?.measure ? getMeasureTitle(periodMeasure?.measure) : undefined,
        },
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
