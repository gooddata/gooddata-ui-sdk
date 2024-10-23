// (C) 2024 GoodData Corporation

import {
    attributeAlias,
    bucketAttributes,
    bucketMeasures,
    IAlertComparisonOperator,
    IAlertRelativeArithmeticOperator,
    IAlertRelativeOperator,
    IAttribute,
    IAutomationAlert,
    IAutomationAlertComparisonCondition,
    IAutomationAlertCondition,
    IAutomationAlertExecutionDefinition,
    IAutomationAlertRelativeCondition,
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IAutomationRecipient,
    IBucket,
    ICatalogMeasure,
    IFilter,
    IInsight,
    IMeasure,
    insightBucket,
    insightVisualizationType,
    IPoPMeasureDefinition,
    IPreviousPeriodMeasureDefinition,
    isArithmeticMeasure,
    isAttributeElementsByValue,
    isLocalIdRef,
    isNegativeAttributeFilter,
    isPoPMeasure,
    isPositiveAttributeFilter,
    isPreviousPeriodMeasure,
    isSimpleMeasure,
    measureAlias,
    measureIdentifier,
    measureTitle,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { IntlShape } from "react-intl";

import {
    AlertAttribute,
    AlertMetric,
    AlertMetricComparator,
    AlertMetricComparatorType,
} from "../../types.js";

import {
    COMPARISON_OPERATORS,
    RELATIVE_OPERATORS,
    ARITHMETIC_OPERATORS,
    DEFAULT_MEASURE_FORMAT,
} from "./constants.js";
import { messages } from "./messages.js";

/**
 * @internal
 */
export const getMeasureTitle = (measure: IMeasure) => {
    return measure ? measureAlias(measure) ?? measureTitle(measure) : undefined;
};

/**
 * @internal
 */
export const getAttributeTitle = (attribute: IAttribute) => {
    return attribute ? attributeAlias(attribute) : undefined;
};

export const getOperatorTitle = (intl: IntlShape, alert?: IAutomationAlert) => {
    if (alert?.condition.type === "relative") {
        return getRelativeOperatorTitle(alert.condition.operator, alert.condition.measure.operator, intl);
    }
    if (alert?.condition.type === "comparison") {
        return getComparisonOperatorTitle(alert.condition.operator, intl);
    }
    return "";
};

/**
 * @internal
 */
const getComparisonOperatorTitle = (operator: IAlertComparisonOperator, intl: IntlShape): string => {
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
const getRelativeOperatorTitle = (
    operator: IAlertRelativeOperator,
    art: IAlertRelativeArithmeticOperator,
    intl: IntlShape,
): string => {
    const titleByOperator: Record<`${IAlertRelativeArithmeticOperator}.${IAlertRelativeOperator}`, string> = {
        [`${ARITHMETIC_OPERATORS.ARITHMETIC_OPERATOR_CHANGE}.${RELATIVE_OPERATORS.RELATIVE_OPERATOR_INCREASE_BY}` as const]:
            messages.comparisonOperatorChangeIncreasesBy.id,
        [`${ARITHMETIC_OPERATORS.ARITHMETIC_OPERATOR_CHANGE}.${RELATIVE_OPERATORS.RELATIVE_OPERATOR_DECREASE_BY}` as const]:
            messages.comparisonOperatorChangeDecreasesBy.id,
        [`${ARITHMETIC_OPERATORS.ARITHMETIC_OPERATOR_CHANGE}.${RELATIVE_OPERATORS.RELATIVE_OPERATOR_CHANGES_BY}` as const]:
            messages.comparisonOperatorChangeChangesBy.id,
        [`${ARITHMETIC_OPERATORS.ARITHMETIC_OPERATOR_DIFFERENCE}.${RELATIVE_OPERATORS.RELATIVE_OPERATOR_INCREASE_BY}` as const]:
            messages.comparisonOperatorDifferenceIncreasesBy.id,
        [`${ARITHMETIC_OPERATORS.ARITHMETIC_OPERATOR_DIFFERENCE}.${RELATIVE_OPERATORS.RELATIVE_OPERATOR_DECREASE_BY}` as const]:
            messages.comparisonOperatorDifferenceDecreasesBy.id,
        [`${ARITHMETIC_OPERATORS.ARITHMETIC_OPERATOR_DIFFERENCE}.${RELATIVE_OPERATORS.RELATIVE_OPERATOR_CHANGES_BY}` as const]:
            messages.comparisonOperatorDifferenceChangesBy.id,
    };

    return intl.formatMessage({ id: titleByOperator[`${art}.${operator}`] });
};

/**
 * @internal
 */
export const createDefaultAlert = (
    filters: IFilter[],
    metrics: AlertMetric[],
    measure: AlertMetric,
    notificationChannelId: string,
    currentUser: IAutomationRecipient,
    catalogMeasures: ICatalogMeasure[] = [],
    comparisonOperator: IAlertComparisonOperator = "GREATER_THAN",
): IAutomationMetadataObjectDefinition => {
    const condition: IAutomationAlertCondition = {
        type: "comparison",
        left: {
            id: measure.measure.measure.localIdentifier,
            format: getMeasureFormat(measure.measure, catalogMeasures),
            title: getMeasureTitle(measure.measure),
        },
        operator: comparisonOperator,
        right: undefined!,
    };
    const execution = {
        attributes: [],
        measures: [measure.measure],
        filters,
    };

    return {
        type: "automation",
        title: getMeasureTitle(measure.measure),
        notificationChannel: notificationChannelId,
        alert: {
            condition,
            execution: {
                ...execution,
                ...transformAlertExecutionByMetric(
                    metrics,
                    condition,
                    {
                        attributes: [],
                        measures: [measure.measure],
                        filters,
                    },
                    measure,
                ),
            },
            trigger: {
                state: "ACTIVE",
            },
        },
        recipients: [currentUser],
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
    const insightType = insight ? (insightVisualizationType(insight) as InsightType) : null;

    const { primaries, others } = collectAllMetric(insight);

    const simpleMetrics = [
        ...(primaries.map<AlertMetric | undefined>(transformMeasure(true)).filter(Boolean) as AlertMetric[]),
        ...(others.map<AlertMetric | undefined>(transformMeasure(false)).filter(Boolean) as AlertMetric[]),
    ];

    //NOTE: For now only headline insight support previous period and same period previous year,
    // if we want to support other insight types, just add the logic here or remove the condition at
    // all to support all insight types
    if (insightType === "headline") {
        transformPreviousPeriodMeasure(primaries, simpleMetrics, true);
        transformPreviousPeriodMeasure(others, simpleMetrics, false);
        transformPoPMeasure(primaries, simpleMetrics, true);
        transformPoPMeasure(others, simpleMetrics, false);
    }

    return simpleMetrics;
};

export const getSupportedInsightAttributesByInsight = (
    insight: IInsight | null | undefined,
): AlertAttribute[] => {
    const attributes = collectAllAttributes(insight);

    return attributes
        .map<AlertAttribute | undefined>(transformAttribute())
        .filter(Boolean) as AlertAttribute[];
};

function transformMeasure(isPrimary: boolean) {
    return (measure: IMeasure) => {
        if (isSimpleMeasure(measure) || isArithmeticMeasure(measure)) {
            return {
                measure,
                isPrimary,
                comparators: [],
            };
        }
        return undefined;
    };
}

function transformAttribute() {
    return (attribute: IAttribute) => {
        return {
            attribute,
        };
    };
}

function transformPreviousPeriodMeasure(
    metrics: IMeasure[],
    simpleMetrics: AlertMetric[],
    isPrimary: boolean,
) {
    const previousPeriodMetrics = metrics.filter((measure) =>
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
                isPrimary,
                comparator: AlertMetricComparatorType.PreviousPeriod,
            });
        }
    });
}

function transformPoPMeasure(metrics: IMeasure[], simpleMetrics: AlertMetric[], isPrimary: boolean) {
    const popMetrics = metrics.filter((measure) =>
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
                isPrimary,
                comparator: AlertMetricComparatorType.SamePeriodPreviousYear,
            });
        }
    });
}

function collectAllMetric(insight: IInsight | null | undefined): {
    primaries: IMeasure[];
    others: IMeasure[];
} {
    const insightType = insight ? (insightVisualizationType(insight) as InsightType) : null;

    if (!insight) {
        return {
            primaries: [],
            others: [],
        };
    }

    switch (insightType) {
        case "headline":
        case "bar":
        case "column":
        case "line":
        case "area":
        case "combo2":
        case "scatter":
        case "bubble":
        case "bullet":
        case "pie":
        case "donut":
        case "treemap":
        case "funnel":
        case "pyramid":
        case "heatmap":
        case "waterfall":
        case "dependencywheel":
        case "sankey":
        case "table": {
            return collectAllMetricsDefault(insight);
        }
        case "pushpin": {
            return collectAllMetricsPushpin(insight);
        }
        case "repeater": {
            return collectAllMetricsRepeater(insight);
        }
        default: {
            return {
                primaries: [],
                others: [],
            };
        }
    }
}

function collectAllMetricsDefault(insight: IInsight) {
    const insightMeasuresBucket: IBucket | undefined = insight
        ? insightBucket(insight, BucketNames.MEASURES)
        : undefined;
    const insightSecondaryMeasuresBucket: IBucket | undefined = insight
        ? insightBucket(insight, BucketNames.SECONDARY_MEASURES)
        : undefined;
    const insightTertiaryMeasuresBucket: IBucket | undefined = insight
        ? insightBucket(insight, BucketNames.TERTIARY_MEASURES)
        : undefined;

    return {
        primaries: insightMeasuresBucket ? bucketMeasures(insightMeasuresBucket) : [],
        others: [
            ...(insightSecondaryMeasuresBucket ? bucketMeasures(insightSecondaryMeasuresBucket) : []),
            ...(insightTertiaryMeasuresBucket ? bucketMeasures(insightTertiaryMeasuresBucket) : []),
        ],
    };
}

function collectAllMetricsPushpin(insight: IInsight) {
    const insightSizeBucket: IBucket | undefined = insight
        ? insightBucket(insight, BucketNames.SIZE)
        : undefined;
    const insightColorBucket: IBucket | undefined = insight
        ? insightBucket(insight, BucketNames.COLOR)
        : undefined;

    return {
        primaries: [
            ...(insightSizeBucket ? bucketMeasures(insightSizeBucket) : []),
            ...(insightColorBucket ? bucketMeasures(insightColorBucket) : []),
        ],
        others: [],
    };
}

function collectAllMetricsRepeater(insight: IInsight) {
    const insightColumnsBucket: IBucket | undefined = insight
        ? insightBucket(insight, BucketNames.COLUMNS)
        : undefined;

    return {
        primaries: insightColumnsBucket ? bucketMeasures(insightColumnsBucket) : [],
        others: [],
    };
}

function collectAllAttributes(insight: IInsight | null | undefined) {
    const insightType = insight ? (insightVisualizationType(insight) as InsightType) : null;

    if (!insight) {
        return [];
    }

    switch (insightType) {
        case "headline":
        case "line": {
            return collectAllAttributesDefault(insight);
        }
        default: {
            return [];
        }
    }
}

function collectAllAttributesDefault(insight: IInsight) {
    const insightAttributeBucket: IBucket | undefined = insight
        ? insightBucket(insight, BucketNames.ATTRIBUTE)
        : undefined;
    const insightAttributesBucket: IBucket | undefined = insight
        ? insightBucket(insight, BucketNames.ATTRIBUTES)
        : undefined;
    const insightTrendBucket: IBucket | undefined = insight
        ? insightBucket(insight, BucketNames.TREND)
        : undefined;
    const insightSegmentBucket: IBucket | undefined = insight
        ? insightBucket(insight, BucketNames.SEGMENT)
        : undefined;

    return [
        ...(insightAttributeBucket ? bucketAttributes(insightAttributeBucket) : []),
        ...(insightAttributesBucket ? bucketAttributes(insightAttributesBucket) : []),
        ...(insightTrendBucket ? bucketAttributes(insightTrendBucket) : []),
        ...(insightSegmentBucket ? bucketAttributes(insightSegmentBucket) : []),
    ];
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
    if (alert?.condition?.type === "relative") {
        return alert.condition.measure.operator === ARITHMETIC_OPERATORS.ARITHMETIC_OPERATOR_CHANGE;
    }
    return false;
}

export function isDifferenceOperator(alert?: IAutomationAlert): boolean {
    if (alert?.condition?.type === "relative") {
        return alert.condition.measure.operator === ARITHMETIC_OPERATORS.ARITHMETIC_OPERATOR_DIFFERENCE;
    }
    return false;
}

export function isChangeOrDifferenceOperator(alert?: IAutomationAlert): boolean {
    return isChangeOperator(alert) || isDifferenceOperator(alert);
}

export function isAlertValueDefined(alert?: IAutomationAlert): boolean {
    if (alert?.condition?.type === "relative") {
        return typeof alert.condition.threshold !== "undefined";
    }
    return typeof alert?.condition?.right !== "undefined";
}

export function isAlertRecipientsValid(alert?: IAutomationMetadataObject): boolean {
    return !!alert?.recipients?.length;
}

export function getAlertThreshold(alert?: IAutomationAlert): number | undefined {
    if (alert?.condition?.type === "relative") {
        return alert.condition.threshold;
    }
    return alert?.condition?.right;
}

export function getAlertMeasure(measures: AlertMetric[], alert?: IAutomationAlert): AlertMetric | undefined {
    const condition = alert?.condition;
    if (condition?.type === "relative") {
        return (
            measures.find((m) => m.measure.measure.localIdentifier === condition.measure.left.id) ??
            measures.find((m) => m.measure.measure.localIdentifier === condition.measure.right.id)
        );
    }
    return measures.find((m) => m.measure.measure.localIdentifier === condition?.left.id);
}

export function getAlertAttribute(
    attributes: AlertAttribute[],
    alert?: IAutomationMetadataObject,
): [AlertAttribute | undefined, string | undefined] {
    const attr = alert?.alert?.execution.attributes[0];
    if (attr?.attribute) {
        const { attribute, filterValue } = getAttributeRelatedFilterInfo(attributes, alert, attr);
        return [attribute, filterValue];
    }
    return [undefined, undefined];
}

export function getAlertFilters(alert?: IAutomationMetadataObject): IFilter[] {
    const filters = alert?.alert?.execution?.filters ?? [];
    const attrs = (alert?.alert?.execution.attributes ?? []).map((a) => a.attribute.localIdentifier);

    return filters.filter((f) => {
        if (isPositiveAttributeFilter(f) && isLocalIdRef(f.positiveAttributeFilter.displayForm)) {
            return !attrs.includes(f.positiveAttributeFilter.displayForm.localIdentifier);
        }
        if (isNegativeAttributeFilter(f) && isLocalIdRef(f.negativeAttributeFilter.displayForm)) {
            return !attrs.includes(f.negativeAttributeFilter.displayForm.localIdentifier);
        }
        return true;
    });
}

export function getAlertCompareOperator(alert?: IAutomationAlert): IAlertComparisonOperator | undefined {
    if (alert?.condition.type === "comparison") {
        return alert.condition.operator;
    }
    return undefined;
}

export function getAlertRelativeOperator(
    alert?: IAutomationAlert,
): [IAlertRelativeOperator, IAlertRelativeArithmeticOperator] | undefined {
    if (alert?.condition.type === "relative") {
        return [alert.condition.operator, alert.condition.measure.operator];
    }
    return undefined;
}

//alerts transformations

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
    value: string | undefined,
): IAutomationMetadataObject {
    const { filterDefinition } = getAttributeRelatedFilterInfo(attributes, alert, attr?.attribute);
    const originalFilters = alert.alert?.execution.filters.filter((f) => f !== filterDefinition) ?? [];

    const customFilters: IFilter[] = [];
    if (attr) {
        if (value) {
            customFilters.push({
                positiveAttributeFilter: {
                    displayForm: {
                        localIdentifier: attr.attribute.attribute.localIdentifier,
                    },
                    in: {
                        values: [value],
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

function transformAlertExecutionByMetric(
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

const getMeasureFormat = (measure: IMeasure | undefined, catalogMeasures?: ICatalogMeasure[]) => {
    if (!measure) {
        return DEFAULT_MEASURE_FORMAT;
    }

    // custom format set in the bucket
    if (measure?.measure.format) {
        return measure.measure.format;
    }

    // measure format from the catalog
    const catalogMeasure = findMeasureInCatalog(measure, catalogMeasures);

    return catalogMeasure?.measure.format ?? DEFAULT_MEASURE_FORMAT;
};

const findMeasureInCatalog = (
    measure: IMeasure,
    catalogMeasures?: ICatalogMeasure[],
): ICatalogMeasure | undefined => {
    return catalogMeasures?.find((m) => m.measure.id === measureIdentifier(measure));
};

function getAttributeRelatedFilterInfo(
    attributes: AlertAttribute[],
    alert?: IAutomationMetadataObject,
    attr?: IAttribute,
): {
    attribute: AlertAttribute | undefined;
    filterDefinition: IFilter | undefined;
    filterValue: string | undefined;
} {
    const attribute = attributes.find(
        (a) => a.attribute.attribute.localIdentifier === attr?.attribute.localIdentifier,
    );

    return {
        attribute,
        ...getAttributeRelatedFilter(attribute, alert),
    };
}

function getAttributeRelatedFilter(attr: AlertAttribute | undefined, alert?: IAutomationMetadataObject) {
    const filter = alert?.alert?.execution.filters.filter((f) => {
        if (isPositiveAttributeFilter(f) && isLocalIdRef(f.positiveAttributeFilter.displayForm)) {
            return (
                f.positiveAttributeFilter.displayForm.localIdentifier ===
                attr?.attribute.attribute.localIdentifier
            );
        }
        if (isNegativeAttributeFilter(f) && isLocalIdRef(f.negativeAttributeFilter.displayForm)) {
            return (
                f.negativeAttributeFilter.displayForm.localIdentifier ===
                attr?.attribute.attribute.localIdentifier
            );
        }
        return false;
    })[0];

    if (isPositiveAttributeFilter(filter) && isAttributeElementsByValue(filter.positiveAttributeFilter.in)) {
        return {
            filterDefinition: filter,
            filterValue: filter.positiveAttributeFilter.in.values[0] ?? undefined,
        };
    }

    if (
        isNegativeAttributeFilter(filter) &&
        isAttributeElementsByValue(filter.negativeAttributeFilter.notIn)
    ) {
        return {
            filterDefinition: filter,
            filterValue: undefined,
        };
    }

    return {
        filterDefinition: undefined,
        filterValue: undefined,
    };
}
