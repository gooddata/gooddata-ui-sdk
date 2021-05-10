// (C) 2020 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import isNumber from "lodash/isNumber";
import isString from "lodash/isString";
import { EmbeddedGdc } from "../iframe/common";
import { GdcExecuteAFM } from "@gooddata/api-model-bear";

export const EXTERNAL_DATE_FILTER_FORMAT = "YYYY-MM-DD";

export interface IExternalFiltersObject {
    attributeFilters: ITransformedAttributeFilterItem[];
    dateFilters: ITransformedDateFilterItem[];
    rankingFilter?: ITransformedRankingFilter;
}

export interface ITransformedRankingFilter {
    measureLocalIdentifier: string;
    attributeLocalIdentifiers?: string[];
    operator: EmbeddedGdc.RankingFilterOperator;
    value: number;
}

export interface ITransformedDateFilterItem {
    granularity?: string;
    from: string | number;
    to: string | number;
    datasetUri?: string;
    datasetIdentifier?: string;
}

export interface ITransformedAttributeFilterItem {
    negativeSelection: boolean;
    attributeElements: string[];
    dfIdentifier?: string;
    dfUri?: string;
}

const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;
export const ALL_TIME_GRANULARITY = "ALL_TIME_GRANULARITY";

export type ITransformedFilterItem = ITransformedDateFilterItem | ITransformedAttributeFilterItem;

function validateDataSet(dataSet: EmbeddedGdc.ObjQualifier | undefined): boolean {
    if (!dataSet) {
        return false;
    }

    const { uri, identifier } = getObjectUriIdentifier(dataSet);
    return isString(uri) || isString(identifier);
}

export function isValidDateFilterFormat(
    filterItem: EmbeddedGdc.DateFilterItem,
    shouldValidateDataSet: boolean = true,
): boolean {
    if (EmbeddedGdc.isAbsoluteDateFilter(filterItem)) {
        const {
            absoluteDateFilter: { from, to, dataSet },
        } = filterItem;

        const isValidDataSet = shouldValidateDataSet ? validateDataSet(dataSet) : true;
        return (
            isValidDataSet &&
            isString(from) &&
            isString(to) &&
            DATE_FORMAT_REGEX.test(from) &&
            DATE_FORMAT_REGEX.test(to)
        );
    } else {
        const {
            relativeDateFilter: { from, to, dataSet },
        } = filterItem;

        const isValidDataSet = shouldValidateDataSet ? validateDataSet(dataSet) : true;
        return isValidDataSet && isNumber(from) && isNumber(to);
    }
}

function isValidAttributeFilterFormat(filterItem: unknown): boolean {
    if (!EmbeddedGdc.isAttributeFilter(filterItem)) {
        return false;
    }

    if (EmbeddedGdc.isPositiveAttributeFilter(filterItem)) {
        const {
            positiveAttributeFilter: { displayForm, in: attributeElements },
        } = filterItem;
        const { uri, identifier } = getObjectUriIdentifier(displayForm);
        return (
            (isString(uri) || isString(identifier)) &&
            Array.isArray(attributeElements) &&
            attributeElements.length !== 0
        );
    } else {
        const {
            negativeAttributeFilter: { displayForm, notIn: attributeElements },
        } = filterItem;
        const { uri, identifier } = getObjectUriIdentifier(displayForm);
        // attributeElements could be empty in case of setting All Value
        return (isString(uri) || isString(identifier)) && Array.isArray(attributeElements);
    }
}

function isValidRankingFilterOperator(operator: unknown): boolean {
    return operator === "TOP" || operator === "BOTTOM";
}

function isValidRankingFilterValue(value: unknown): boolean {
    return typeof value === "number" && value > 0 && value <= 99_999 && value % 1 === 0;
}

function isValidLocalIdentifier(localIdentifier: unknown): boolean {
    return (
        GdcExecuteAFM.isLocalIdentifierQualifier(localIdentifier) &&
        typeof localIdentifier.localIdentifier === "string"
    );
}

function isValidRankingFilterAttributes(attributes?: EmbeddedGdc.ILocalIdentifierQualifier[]): boolean {
    return (
        !attributes ||
        (Array.isArray(attributes) && attributes.length > 0 && attributes.every(isValidLocalIdentifier))
    );
}

function isValidRankingFilterFormat(rankingFilterItem: EmbeddedGdc.IRankingFilter): boolean {
    const { measure, attributes, value, operator } = rankingFilterItem.rankingFilter;
    return (
        isValidLocalIdentifier(measure) &&
        isValidRankingFilterAttributes(attributes) &&
        isValidRankingFilterOperator(operator) &&
        isValidRankingFilterValue(value)
    );
}

// `dataSet` is required in AD only.
// In AD, we call this function with `shouldValidateDataSet = true`
// In KD, we call this function with `shouldValidateDataSet = false`
export function isValidFilterItemFormat(filterItem: unknown, shouldValidateDataSet: boolean = true): boolean {
    if (EmbeddedGdc.isDateFilter(filterItem)) {
        return isValidDateFilterFormat(filterItem, shouldValidateDataSet);
    } else if (EmbeddedGdc.isAttributeFilter(filterItem)) {
        return isValidAttributeFilterFormat(filterItem);
    } else if (EmbeddedGdc.isRankingFilter(filterItem)) {
        return isValidRankingFilterFormat(filterItem);
    }
    return false;
}

export function isValidRemoveFilterItemFormat(filterItem: unknown): boolean {
    if (EmbeddedGdc.isRemoveDateFilter(filterItem)) {
        const { dataSet } = filterItem;
        const { uri, identifier } = getObjectUriIdentifier(dataSet);
        return isString(uri) || isString(identifier);
    } else if (EmbeddedGdc.isRemoveAttributeFilter(filterItem)) {
        const { displayForm } = filterItem;
        const { uri, identifier } = getObjectUriIdentifier(displayForm);
        return isString(uri) || isString(identifier);
    } else if (EmbeddedGdc.isRemoveRankingFilter(filterItem)) {
        return true;
    }

    return false;
}

export function isValidRemoveFiltersFormat(filters: unknown[]): boolean {
    return !isEmpty(filters) && filters.every(isValidRemoveFilterItemFormat);
}

export function isValidFiltersFormat(filters: unknown[], shouldValidateDataSet: boolean = true): boolean {
    return (
        !isEmpty(filters) && filters.every((filter) => isValidFilterItemFormat(filter, shouldValidateDataSet))
    );
}

export function getObjectUriIdentifier(obj: EmbeddedGdc.ObjQualifier | undefined): {
    uri?: string;
    identifier?: string;
} {
    if (!obj) {
        return {};
    }

    return {
        uri: EmbeddedGdc.isObjectUriQualifier(obj) ? obj.uri : undefined,
        identifier: EmbeddedGdc.isObjIdentifierQualifier(obj) ? obj.identifier : undefined,
    };
}

function transformDateFilterItem(dateFilterItem: EmbeddedGdc.DateFilterItem): ITransformedDateFilterItem {
    if (EmbeddedGdc.isAbsoluteDateFilter(dateFilterItem)) {
        const {
            absoluteDateFilter: { dataSet, from, to },
        } = dateFilterItem;
        const { uri: datasetUri, identifier: datasetIdentifier } = getObjectUriIdentifier(dataSet);
        return {
            to,
            from,
            datasetUri,
            datasetIdentifier,
        };
    } else {
        const {
            relativeDateFilter: { granularity, dataSet, from, to },
        } = dateFilterItem;
        const { uri: datasetUri, identifier: datasetIdentifier } = getObjectUriIdentifier(dataSet);
        return {
            to,
            from,
            granularity,
            datasetUri,
            datasetIdentifier,
        };
    }
}

function transformAttributeFilterItem(
    attributeFilterItem: EmbeddedGdc.AttributeFilterItem,
): ITransformedAttributeFilterItem {
    if (EmbeddedGdc.isPositiveAttributeFilter(attributeFilterItem)) {
        const {
            positiveAttributeFilter: { in: attributeElements, displayForm },
        } = attributeFilterItem;
        const { uri: dfUri, identifier: dfIdentifier } = getObjectUriIdentifier(displayForm);
        return {
            negativeSelection: false,
            attributeElements,
            dfIdentifier,
            dfUri,
        };
    } else {
        const {
            negativeAttributeFilter: { notIn: attributeElements, displayForm },
        } = attributeFilterItem;
        const { uri: dfUri, identifier: dfIdentifier } = getObjectUriIdentifier(displayForm);
        return {
            negativeSelection: true,
            attributeElements,
            dfIdentifier,
            dfUri,
        };
    }
}

function transformRankingFilterItem(
    rankingFilterItem: EmbeddedGdc.IRankingFilter,
): ITransformedRankingFilter {
    const { measure, attributes, value, operator } = rankingFilterItem.rankingFilter;
    const attributesProp = attributes
        ? { attributeLocalIdentifiers: attributes.map((attribute) => attribute.localIdentifier) }
        : {};

    return {
        measureLocalIdentifier: measure.localIdentifier,
        ...attributesProp,
        value,
        operator,
    };
}

export function transformFilterContext(filters: EmbeddedGdc.FilterItem[]): IExternalFiltersObject {
    const defaultFiltersObject: IExternalFiltersObject = {
        attributeFilters: [],
        dateFilters: [],
    };
    if (isEmpty(filters)) {
        return defaultFiltersObject;
    }

    return filters.reduce(
        (
            externalFilters: IExternalFiltersObject,
            filterItem: EmbeddedGdc.FilterItem,
        ): IExternalFiltersObject => {
            if (EmbeddedGdc.isDateFilter(filterItem)) {
                const dateFilter = transformDateFilterItem(filterItem);
                externalFilters.dateFilters.push(dateFilter);
            } else if (EmbeddedGdc.isAttributeFilter(filterItem)) {
                const attributeFilter = transformAttributeFilterItem(filterItem);
                externalFilters.attributeFilters.push(attributeFilter);
            } else if (EmbeddedGdc.isRankingFilter(filterItem)) {
                const rankingFilter = transformRankingFilterItem(filterItem);
                externalFilters.rankingFilter = rankingFilter;
            }

            return externalFilters;
        },
        defaultFiltersObject,
    );
}

export function isTransformedDateFilterItem(
    filterItem: ITransformedFilterItem,
): filterItem is ITransformedDateFilterItem {
    const { from, to } = filterItem as ITransformedDateFilterItem;
    return !isEmpty(filterItem) && from !== undefined && to !== undefined;
}

export function isTransformedAttributeFilterItem(
    filterItem: ITransformedFilterItem,
): filterItem is ITransformedAttributeFilterItem {
    const { attributeElements } = filterItem as ITransformedAttributeFilterItem;
    return !isEmpty(filterItem) && attributeElements !== undefined;
}

export function isAllTimeDateFilterItem(filterItem: ITransformedFilterItem): boolean {
    return (
        !isEmpty(filterItem) &&
        (filterItem as ITransformedDateFilterItem).granularity === ALL_TIME_GRANULARITY
    );
}

export function isAllValueAttributeFilterItem(filterItem: ITransformedFilterItem): boolean {
    return (
        !isEmpty(filterItem) &&
        isTransformedAttributeFilterItem(filterItem) &&
        !filterItem.attributeElements.length
    );
}
