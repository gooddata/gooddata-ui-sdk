// (C) 2022-2024 GoodData Corporation
import {
    areObjRefsEqual,
    attributeAlias,
    IAlertComparisonOperator,
    IAlertRelativeArithmeticOperator,
    IAlertRelativeOperator,
    IAttribute,
    IAttributeMetadataObject,
    IAutomationAlert,
    IAutomationMetadataObject,
    ICatalogAttribute,
    ICatalogDateAttribute,
    ICatalogDateDataset,
    ICatalogMeasure,
    IFilter,
    IMeasure,
    isAttributeElementsByValue,
    isLocalIdRef,
    isNegativeAttributeFilter,
    isPositiveAttributeFilter,
    measureAlias,
    measureIdentifier,
    measureTitle,
} from "@gooddata/sdk-model";
import { IntlShape } from "react-intl";

import { AlertAttribute, AlertMetric } from "../../../types.js";
import { messages } from "../messages.js";
import {
    ARITHMETIC_OPERATORS,
    COMPARISON_OPERATORS,
    DEFAULT_MEASURE_FORMAT,
    RELATIVE_OPERATORS,
} from "../constants.js";

import { isChangeOperator, isDifferenceOperator } from "./guards.js";

/**
 * @internal
 */
export function getMeasureFormat(measure: IMeasure | undefined, catalogMeasures?: ICatalogMeasure[]) {
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
}

/**
 * @internal
 */
export function getAttributeRelatedFilterInfo(
    attributes: AlertAttribute[],
    alert?: IAutomationMetadataObject,
    attr?: IAttribute,
): {
    attribute: AlertAttribute | undefined;
    filterDefinition: IFilter | undefined;
    filterValue: string | null | undefined;
} {
    const attribute = attributes.find(
        (a) => a.attribute.attribute.localIdentifier === attr?.attribute.localIdentifier,
    );

    return {
        attribute,
        ...getAttributeRelatedFilter(attribute, alert),
    };
}

/**
 * @internal
 */
export function getMeasureTitle(measure: IMeasure) {
    return measure ? measureAlias(measure) ?? measureTitle(measure) : undefined;
}

/**
 * @internal
 */
export function getAttributeTitle(attribute: IAttribute) {
    return attribute ? attributeAlias(attribute) : undefined;
}

/**
 * @internal
 */
export function getOperatorTitle(intl: IntlShape, alert?: IAutomationAlert) {
    if (alert?.condition.type === "relative") {
        return getRelativeOperatorTitle(alert.condition.operator, alert.condition.measure.operator, intl);
    }
    if (alert?.condition.type === "comparison") {
        return getComparisonOperatorTitle(alert.condition.operator, intl);
    }
    return "";
}

/**
 * @internal
 */
export function getValueSuffix(alert?: IAutomationAlert): string | undefined {
    if (isChangeOperator(alert)) {
        return "%";
    }
    if (isDifferenceOperator(alert)) {
        return undefined;
    }
    return undefined;
}

/**
 * @internal
 */
export function getAlertThreshold(alert?: IAutomationAlert): number | undefined {
    if (alert?.condition?.type === "relative") {
        return alert.condition.threshold;
    }
    return alert?.condition?.right;
}

/**
 * @internal
 */
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

/**
 * @internal
 */
export function getAlertAttribute(
    attributes: AlertAttribute[],
    alert?: IAutomationMetadataObject,
): [AlertAttribute | undefined, string | null | undefined] {
    const attr = alert?.alert?.execution.attributes[0];
    if (attr?.attribute) {
        const { attribute, filterValue } = getAttributeRelatedFilterInfo(attributes, alert, attr);
        return [attribute, filterValue];
    }
    return [undefined, undefined];
}

/**
 * @internal
 */
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

/**
 * @internal
 */
export function getAlertCompareOperator(alert?: IAutomationAlert): IAlertComparisonOperator | undefined {
    if (alert?.condition.type === "comparison") {
        return alert.condition.operator;
    }
    return undefined;
}

/**
 * @internal
 */
export function getAlertRelativeOperator(
    alert?: IAutomationAlert,
): [IAlertRelativeOperator, IAlertRelativeArithmeticOperator] | undefined {
    if (alert?.condition.type === "relative") {
        return [alert.condition.operator, alert.condition.measure.operator];
    }
    return undefined;
}

/**
 * @internal
 */
export function getSelectedCatalogAttribute(
    catalogAttributes: ICatalogAttribute[],
    catalogDateDatasets: ICatalogDateDataset[],
    attribute: AlertAttribute,
) {
    const catalogDateAttributes = catalogDateDatasets.flatMap((dateDataset) => dateDataset.dateAttributes);
    const item = getCatalogAttribute([...catalogAttributes, ...catalogDateAttributes], attribute.attribute);

    if (!item) {
        return undefined;
    }

    return {
        ...item.attribute,
        title: getAttributeTitle(attribute.attribute) ?? item.attribute?.title,
    };
}

/**
 * @internal
 */
export function getSelectedCatalogAttributeValue(
    attribute: IAttributeMetadataObject | undefined,
    getAttributeValue: (attr: IAttributeMetadataObject) => {
        title: string;
        value: string;
        name: string;
    }[],
    selectedValue: string | null | undefined,
) {
    if (!attribute) {
        return undefined;
    }

    const values = getAttributeValue(attribute);
    return (
        values.find((value) => value.name === selectedValue) ??
        values.find((value) => value.value === selectedValue)
    );
}

/**
 * @internal
 */
export function getCatalogAttribute<T extends ICatalogDateAttribute | ICatalogAttribute>(
    attributes: T[],
    attribute: IAttribute,
) {
    return attributes.find((attr) => {
        return (
            areObjRefsEqual(attr.attribute.ref, attribute.attribute.displayForm) ||
            attr.attribute.displayForms.some((displayForm) =>
                areObjRefsEqual(displayForm.ref, attribute.attribute.displayForm),
            )
        );
    });
}

//utils

function getComparisonOperatorTitle(operator: IAlertComparisonOperator, intl: IntlShape): string {
    const titleByOperator: Record<IAlertComparisonOperator, string> = {
        [COMPARISON_OPERATORS.COMPARISON_OPERATOR_LESS_THAN]: messages.comparisonOperatorLessThan.id,
        [COMPARISON_OPERATORS.COMPARISON_OPERATOR_LESS_THAN_OR_EQUAL_TO]:
            messages.comparisonOperatorLessThanOrEquals.id,
        [COMPARISON_OPERATORS.COMPARISON_OPERATOR_GREATER_THAN]: messages.comparisonOperatorGreaterThan.id,
        [COMPARISON_OPERATORS.COMPARISON_OPERATOR_GREATER_THAN_OR_EQUAL_TO]:
            messages.comparisonOperatorGreaterThanOrEquals.id,
    };

    return intl.formatMessage({ id: titleByOperator[operator] });
}

function getRelativeOperatorTitle(
    operator: IAlertRelativeOperator,
    art: IAlertRelativeArithmeticOperator,
    intl: IntlShape,
): string {
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
            filterValue: filter.positiveAttributeFilter.in.values[0],
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

function findMeasureInCatalog(
    measure: IMeasure,
    catalogMeasures?: ICatalogMeasure[],
): ICatalogMeasure | undefined {
    return catalogMeasures?.find((m) => m.measure.id === measureIdentifier(measure));
}
