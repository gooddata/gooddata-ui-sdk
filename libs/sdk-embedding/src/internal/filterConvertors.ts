// (C) 2020-2025 GoodData Corporation
import { isEmpty, isNumber, isString } from "lodash-es";

import { ILowerBoundedFilter, IUpperBoundedFilter, ObjRef, idRef } from "@gooddata/sdk-model";

import {
    AttributeFilterItem,
    DateFilterItem,
    FilterItem,
    ILocalIdentifierQualifier,
    IRankingFilter,
    ObjQualifier,
    RankingFilterOperator,
    isAbsoluteDateFilter,
    isAttributeFilter,
    isDateFilter,
    isLocalIdentifierQualifier,
    isObjIdentifierQualifier,
    isObjectUriQualifier,
    isPositiveAttributeFilter,
    isRankingFilter,
    isRemoveAttributeFilter,
    isRemoveDateFilter,
    isRemoveRankingFilter,
} from "../iframe/index.js";

export const EXTERNAL_DATE_FILTER_FORMAT = "YYYY-MM-DD";

export interface IExternalFiltersObject {
    attributeFilters: ITransformedAttributeFilterItem[];
    dateFilters: ITransformedDateFilterItem[];
    rankingFilter?: ITransformedRankingFilter;
}

export interface ITransformedRankingFilter {
    measureLocalIdentifier: string;
    attributeLocalIdentifiers?: string[];
    operator: RankingFilterOperator;
    value: number;
}

export interface ITransformedDateFilterItem {
    granularity?: string;
    from: string | number;
    to: string | number;
    boundedFilter?: IUpperBoundedFilter | ILowerBoundedFilter;
    datasetUri?: string;
    datasetIdentifier?: string;
    localIdentifier?: string; // to support multiple date filters
}

export interface ITransformedAttributeFilterItem {
    negativeSelection: boolean;
    attributeElements: string[];
    dfIdentifier?: string;
    dfUri?: string;
    displayAsLabel?: ObjRef;
}

const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DATE_FORMAT_REGEX_TIME_SUPPORT = /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2})?$/;
export const ALL_TIME_GRANULARITY = "ALL_TIME_GRANULARITY";

export type ITransformedFilterItem = ITransformedDateFilterItem | ITransformedAttributeFilterItem;

function validateDataSet(dataSet: ObjQualifier | undefined): boolean {
    if (!dataSet) {
        return false;
    }

    const { uri, identifier } = getObjectUriIdentifier(dataSet);
    return isString(uri) || isString(identifier);
}

export function isValidDateFilterFormat(
    filterItem: DateFilterItem,
    shouldValidateDataSet: boolean = true,
    isTimeSupported: boolean = false,
): boolean {
    if (isAbsoluteDateFilter(filterItem)) {
        const {
            absoluteDateFilter: { from, to, dataSet },
        } = filterItem;

        const isValidDataSet = shouldValidateDataSet ? validateDataSet(dataSet) : true;
        const valueFormatRegex = isTimeSupported ? DATE_FORMAT_REGEX_TIME_SUPPORT : DATE_FORMAT_REGEX;
        return (
            isValidDataSet &&
            isString(from) &&
            isString(to) &&
            valueFormatRegex.test(from) &&
            valueFormatRegex.test(to)
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
    if (!isAttributeFilter(filterItem)) {
        return false;
    }

    if (isPositiveAttributeFilter(filterItem)) {
        const {
            positiveAttributeFilter: { displayForm, in: attributeElements, selectionMode = "multi" },
        } = filterItem;

        // because of untyped postMessages
        if (selectionMode !== "single" && selectionMode !== "multi") {
            return false;
        }
        const { uri, identifier } = getObjectUriIdentifier(displayForm);

        const validElementsForSelectionMode =
            selectionMode === "single" ? attributeElements.length <= 1 : attributeElements.length !== 0;

        return (
            (isString(uri) || isString(identifier)) &&
            Array.isArray(attributeElements) &&
            validElementsForSelectionMode
        );
    } else {
        const {
            negativeAttributeFilter: { displayForm, notIn: attributeElements, selectionMode = "multi" },
        } = filterItem;

        const { uri, identifier } = getObjectUriIdentifier(displayForm);

        const validSelectionMode = selectionMode === "multi";
        // attributeElements could be empty in case of setting All Value
        return (
            (isString(uri) || isString(identifier)) && Array.isArray(attributeElements) && validSelectionMode
        );
    }
}

function isValidRankingFilterOperator(operator: unknown): boolean {
    return operator === "TOP" || operator === "BOTTOM";
}

function isValidRankingFilterValue(value: unknown): boolean {
    return typeof value === "number" && value > 0 && value <= 99_999 && value % 1 === 0;
}

function isValidLocalIdentifier(localIdentifier: unknown): boolean {
    return isLocalIdentifierQualifier(localIdentifier) && typeof localIdentifier.localIdentifier === "string";
}

function isValidRankingFilterAttributes(attributes?: ILocalIdentifierQualifier[]): boolean {
    return (
        !attributes ||
        (Array.isArray(attributes) && attributes.length > 0 && attributes.every(isValidLocalIdentifier))
    );
}

function isValidRankingFilterFormat(rankingFilterItem: IRankingFilter): boolean {
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
export function isValidFilterItemFormat(
    filterItem: unknown,
    shouldValidateDataSet: boolean = true,
    isTimeSupported: boolean = false,
): boolean {
    if (isDateFilter(filterItem)) {
        return isValidDateFilterFormat(filterItem, shouldValidateDataSet, isTimeSupported);
    } else if (isAttributeFilter(filterItem)) {
        return isValidAttributeFilterFormat(filterItem);
    } else if (isRankingFilter(filterItem)) {
        return isValidRankingFilterFormat(filterItem);
    }
    return false;
}

export function isValidRemoveFilterItemFormat(filterItem: unknown): boolean {
    if (isRemoveDateFilter(filterItem)) {
        const { dataSet } = filterItem;
        const { uri, identifier } = getObjectUriIdentifier(dataSet);
        return isString(uri) || isString(identifier);
    } else if (isRemoveAttributeFilter(filterItem)) {
        const { displayForm } = filterItem;
        const { uri, identifier } = getObjectUriIdentifier(displayForm);
        return isString(uri) || isString(identifier);
    } else if (isRemoveRankingFilter(filterItem)) {
        return true;
    }

    return false;
}

export function isValidRemoveFiltersFormat(filters: unknown[]): boolean {
    return !isEmpty(filters) && filters.every(isValidRemoveFilterItemFormat);
}

export function isValidFiltersFormat(
    filters: unknown[],
    shouldValidateDataSet: boolean = true,
    isTimeSupported: boolean = false,
): boolean {
    return (
        !isEmpty(filters) &&
        filters.every((filter) => isValidFilterItemFormat(filter, shouldValidateDataSet, isTimeSupported))
    );
}

export function getObjectUriIdentifier(obj: ObjQualifier | undefined): {
    uri?: string;
    identifier?: string;
} {
    if (!obj) {
        return {};
    }

    return {
        uri: isObjectUriQualifier(obj) ? obj.uri : undefined,
        identifier: isObjIdentifierQualifier(obj) ? obj.identifier : undefined,
    };
}

function transformDateFilterItem(dateFilterItem: DateFilterItem): ITransformedDateFilterItem {
    if (isAbsoluteDateFilter(dateFilterItem)) {
        const {
            absoluteDateFilter: { dataSet, from, to },
            localIdentifier,
        } = dateFilterItem;
        const { uri: datasetUri, identifier: datasetIdentifier } = getObjectUriIdentifier(dataSet);
        return {
            to,
            from,
            datasetUri,
            datasetIdentifier,
            ...(localIdentifier ? { localIdentifier } : {}),
        };
    } else {
        const {
            relativeDateFilter: { granularity, dataSet, from, to, boundedFilter },
            localIdentifier,
        } = dateFilterItem;
        const { uri: datasetUri, identifier: datasetIdentifier } = getObjectUriIdentifier(dataSet);
        return {
            to,
            from,
            granularity,
            datasetUri,
            datasetIdentifier,
            ...(boundedFilter ? { boundedFilter } : {}),
            ...(localIdentifier ? { localIdentifier } : {}),
        };
    }
}

function transformAttributeFilterItem(
    attributeFilterItem: AttributeFilterItem,
): ITransformedAttributeFilterItem {
    if (isPositiveAttributeFilter(attributeFilterItem)) {
        const {
            positiveAttributeFilter: { in: attributeElements, displayForm },
            displayAsLabel,
        } = attributeFilterItem;
        const { uri: dfUri, identifier: dfIdentifier } = getObjectUriIdentifier(displayForm);
        const { identifier: displayAsLabelIdentifier } = getObjectUriIdentifier(displayAsLabel);
        return {
            negativeSelection: false,
            attributeElements,
            dfIdentifier,
            dfUri,
            ...(displayAsLabelIdentifier
                ? { displayAsLabel: idRef(displayAsLabelIdentifier, "displayForm") }
                : {}),
        };
    } else {
        const {
            negativeAttributeFilter: { notIn: attributeElements, displayForm },
            displayAsLabel,
        } = attributeFilterItem;
        const { uri: dfUri, identifier: dfIdentifier } = getObjectUriIdentifier(displayForm);
        const { identifier: displayAsLabelIdentifier } = getObjectUriIdentifier(displayAsLabel);
        return {
            negativeSelection: true,
            attributeElements,
            dfIdentifier,
            dfUri,
            ...(displayAsLabelIdentifier
                ? { displayAsLabel: idRef(displayAsLabelIdentifier, "displayForm") }
                : {}),
        };
    }
}

function transformRankingFilterItem(rankingFilterItem: IRankingFilter): ITransformedRankingFilter {
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

export function transformFilterContext(filters: FilterItem[]): IExternalFiltersObject {
    const defaultFiltersObject: IExternalFiltersObject = {
        attributeFilters: [],
        dateFilters: [],
    };
    if (isEmpty(filters)) {
        return defaultFiltersObject;
    }

    return filters.reduce(
        (externalFilters: IExternalFiltersObject, filterItem: FilterItem): IExternalFiltersObject => {
            if (isDateFilter(filterItem)) {
                const dateFilter = transformDateFilterItem(filterItem);
                externalFilters.dateFilters.push(dateFilter);
            } else if (isAttributeFilter(filterItem)) {
                const attributeFilter = transformAttributeFilterItem(filterItem);
                externalFilters.attributeFilters.push(attributeFilter);
            } else if (isRankingFilter(filterItem)) {
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
