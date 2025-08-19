// (C) 2022-2025 GoodData Corporation
import { IntlShape } from "react-intl";

import { ClientFormatterFacade } from "@gooddata/number-formatter";
import { IExecutionResult } from "@gooddata/sdk-backend-spi";
import {
    DateAttributeGranularity,
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
    IFilter,
    IMeasure,
    IMeasureDescriptor,
    ISeparators,
    ObjRef,
    areObjRefsEqual,
    attributeAlias,
    isAttributeElementsByValue,
    isLocalIdRef,
    isMeasureGroupDescriptor,
    isNegativeAttributeFilter,
    isPositiveAttributeFilter,
    isRelativeDateFilter,
    measureAlias,
    measureIdentifier,
    measureTitle,
} from "@gooddata/sdk-model";
import { getComparisonOperatorTitle, getRelativeOperatorTitle } from "@gooddata/sdk-ui-ext";

import { isChangeOperator, isDifferenceOperator } from "./guards.js";
import { AlertAttribute, AlertMetric, AlertMetricComparator } from "../../types.js";
import { DEFAULT_MEASURE_FORMAT } from "../constants.js";

export type IMeasureFormatMap = { [key: string]: string };

/**
 * @internal
 */
export function getMeasureFormat(measure: IMeasure | undefined, measureFormatMap: IMeasureFormatMap = {}) {
    if (!measure) {
        return DEFAULT_MEASURE_FORMAT;
    }

    // custom format set in the bucket
    if (measure?.measure.format) {
        return measure.measure.format;
    }

    // measure format from the catalog
    const resolvedIdentifier = measureIdentifier(measure);
    return (resolvedIdentifier && measureFormatMap[resolvedIdentifier]) ?? DEFAULT_MEASURE_FORMAT;
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
    return measure ? (measureAlias(measure) ?? measureTitle(measure)) : undefined;
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
export function getAlertMeasureFormat(alert?: IAutomationAlert): string | undefined {
    const condition = alert?.condition;
    if (condition?.type === "relative") {
        return condition.measure.left.format ?? condition.measure.right.format ?? DEFAULT_MEASURE_FORMAT;
    }
    return condition?.left.format ?? DEFAULT_MEASURE_FORMAT;
}

/**
 * @internal
 */
export function getAlertComparison(
    measure: AlertMetric | undefined,
    alert?: IAutomationAlert,
): AlertMetricComparator | undefined {
    const condition = alert?.condition;
    if (measure && condition?.type === "relative") {
        return (
            measure.comparators.find(
                (c) => c.measure.measure.localIdentifier === condition.measure.left.id,
            ) ??
            measure.comparators.find((c) => c.measure.measure.localIdentifier === condition.measure.right.id)
        );
    }
    return undefined;
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
    const localFilters = alert?.metadata?.filters ?? [];
    const filters = alert?.alert?.execution?.filters ?? [];
    const attrs = (alert?.alert?.execution.attributes ?? []).map((a) => a.attribute.localIdentifier);

    return filters.filter((f) => {
        if (isPositiveAttributeFilter(f) && isLocalIdRef(f.positiveAttributeFilter.displayForm)) {
            return !attrs.includes(f.positiveAttributeFilter.displayForm.localIdentifier);
        }
        if (isNegativeAttributeFilter(f) && isLocalIdRef(f.negativeAttributeFilter.displayForm)) {
            return !attrs.includes(f.negativeAttributeFilter.displayForm.localIdentifier);
        }
        if (isRelativeDateFilter(f)) {
            return !localFilters.includes(f.relativeDateFilter.localIdentifier ?? "");
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

export function getFiltersAttribute(
    datasetsWithGranularity: [ObjRef, DateAttributeGranularity][],
    dataset: ICatalogDateDataset,
) {
    const found = datasetsWithGranularity.find(([ref]) => areObjRefsEqual(ref, dataset.dataSet.ref));

    if (found) {
        const attribute = dataset.dateAttributes.find((a) => a.granularity === found[1]);
        if (attribute) {
            return [attribute];
        }
    }
    return [];
}

//utils

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

/**
 * Prepare a mapping between measure identifiers and measure formats.
 * Obtain the information from the execution result measure group dimension headers.
 * @internal
 */
export function getMeasureFormatsFromExecution(execResult: IExecutionResult | undefined): IMeasureFormatMap {
    const dimensions = execResult?.dimensions ?? [];
    for (const dim of dimensions) {
        const measureGroup = dim.headers.find(isMeasureGroupDescriptor);

        if (measureGroup) {
            return measureGroup.measureGroupHeader.items.reduce(
                (acc: IMeasureFormatMap, item: IMeasureDescriptor) => {
                    const identifier = item.measureHeaderItem?.identifier;
                    const format = item.measureHeaderItem?.format;
                    if (identifier) {
                        acc[identifier] = format;
                    }

                    return acc;
                },
                {},
            );
        }
    }

    return {};
}

export function getDescription(
    intl: IntlShape,
    measures: AlertMetric[],
    alert?: IAutomationMetadataObject,
    separators?: ISeparators,
): string {
    const selectedMeasure = getAlertMeasure(measures, alert?.alert);

    const name = selectedMeasure ? (getMeasureTitle(selectedMeasure.measure) ?? "") : "";
    const valueSuffix = getValueSuffix(alert?.alert) ?? "";
    const title = getOperatorTitle(intl, alert?.alert).toLowerCase();
    const threshold = getAlertThreshold(alert?.alert);
    const formattedValue = formatValue(threshold, getMeasureFormat(selectedMeasure?.measure), separators);

    const description = [name, title, `${formattedValue}${valueSuffix}`].filter(Boolean).join(" ");

    return description[0].toUpperCase() + description.slice(1);
}

export function getSubtitle(
    intl: IntlShape,
    widgetName: string,
    alert: IAutomationMetadataObject,
    separators?: ISeparators,
): string {
    const valueSuffix = getValueSuffix(alert.alert) ?? "";
    const threshold = getAlertThreshold(alert.alert);
    const formattedValue = formatValue(threshold, getAlertMeasureFormat(alert.alert), separators);

    return [`${getOperatorTitle(intl, alert.alert)} ${formattedValue}${valueSuffix}`, widgetName]
        .filter(Boolean)
        .join(" • ");
}

function formatValue(value: string | number | undefined, format?: string, separators?: ISeparators) {
    try {
        const convertedValue = ClientFormatterFacade.convertValue(value);
        if (convertedValue !== null && isNaN(convertedValue)) {
            return "";
        }
        const { formattedValue } = ClientFormatterFacade.formatValue(convertedValue, format, separators);
        return formattedValue;
    } catch {
        return String(value);
    }
}
