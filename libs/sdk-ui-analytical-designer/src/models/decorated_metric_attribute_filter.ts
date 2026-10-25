// (C) 2007-2026 GoodData Corporation

import { compact, union } from "lodash-es";
import { type IntlShape } from "react-intl";

import { type IAttributeFilterConfigs, type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import { type TextFilterOperator, getTextFilterStateParts } from "@gooddata/sdk-ui-filters";

import { type IBucketsMetaState } from "../store/buckets/buckets_meta_state.js";
import {
    type TextModeFilterData,
    isArbitraryFilterData,
    isMatchFilterData,
    isTextFilterAll,
} from "../store/filter_bar/filter_bar_types.js";
import { type IBucketItemMetricFilter } from "../typings/bucket_item_filter.js";
import { type ICatalogEntries, type ICatalogEntry } from "../typings/state_objects.js";
import { shortenText } from "../utils/base.js";

import { type IDateDatasetsMetaItem } from "./date_datasets_meta_item.js";
import { DATE_DATASET_ATTRIBUTE, createDateItem } from "./date_item.js";
import {
    type IDecoratedAttributeElement,
    decoratedAttributeElement,
} from "./decorated_attribute_elements.js";
import { getGranularityLabel } from "./granularity.js";
import { findAttributeCacheItem, findAttributeCacheItemByRef } from "./item_cache_lookup.js";

const MAX_TITLE_LENGTH = 1000;
const SAMPLE_DELIMITER = ", ";
const MAX_LISTED_FILTER_ATTRIBUTE_VALUES = 3;

const metricAttributeFilterBase: IBucketItemMetricFilter = {
    attribute: null,
    allElements: [],
    selectedElements: [],
    isInverted: true,
    totalElementsCount: 0,
    noData: false,
    textModeFilter: null,
};

/**
 * STATE-shape factory: the result lands in the buckets subtree
 * (data.buckets[i].items[j].filters[k]).
 */
export function metricAttributeFilter(props?: IBucketItemMetricFilter): IBucketItemMetricFilter {
    return { ...metricAttributeFilterBase, ...props };
}

export interface IDecoratedMetricAttributeFilter {
    /** itemCache entry / synthetic date item — PLAIN. */
    attribute: ICatalogEntry;
    /**
     * Title of the date dataset a date attribute belongs to, when the filter is on a date attribute
     * (an additional date filter) and the dataset is known. The filter is then titled the way the
     * date filter names a date attribute, with the granularity translated.
     */
    dateDatasetTitle?: string;
    allElements: unknown;
    selectedElements: IDecoratedAttributeElement[];
    isInverted: boolean;
    totalElementsCount: number;
    noData: boolean;
    textModeFilter: TextModeFilterData | null;
    isModified: boolean;
    /**
     * The raw bucket filter, as stored in `data.buckets[i].items[j].filters[k]`. Write-back paths
     * dispatch it verbatim.
     */
    original: IBucketItemMetricFilter | null;
    expression: string;
    allSelected: boolean;
    isDate: false;
    selectionSize: number;
}

function elementUris(elements: IDecoratedAttributeElement[]) {
    return elements.map((element) => element.uri);
}

function getAttribute(filter: IBucketItemMetricFilter | null, itemCache: ICatalogEntries) {
    const attribute = filter?.attribute;
    if (attribute === DATE_DATASET_ATTRIBUTE) {
        return createDateItem();
    }

    const displayFormRef = filter?.displayFormRef;
    return (
        (displayFormRef
            ? findAttributeCacheItemByRef(itemCache, attribute, displayFormRef)
            : findAttributeCacheItem(itemCache, attribute)) ?? itemCache?.[attribute]
    );
}

function getSelectedElements(filter: IBucketItemMetricFilter | null): IDecoratedAttributeElement[] {
    const elements: ReadonlyArray<unknown> = filter?.selectedElements ?? [];
    return elements.map(decoratedAttributeElement);
}

// Not all elements in filter must be available after load.
// We ignore them on UI but must preserve them in model and when
// updating visualization object.
// The "available" flag is set in metadata.ts when the visualization object is processed.
function getAvailableSelectionSize(filter: IDecoratedMetricAttributeFilter) {
    return filter.selectedElements.filter((element) => element.available).length;
}

function isAllSelected(filter: IBucketItemMetricFilter | null) {
    return (filter?.selectedElements?.length ?? 0) === 0;
}

function getSampleElements(selection: IAttributeFilterSelection, intl: IntlShape) {
    return selection.selectedElements
        .filter((element) => element.available)
        .map(
            (element) =>
                element.formattedTitle || element.title || `(${intl.formatMessage({ id: "empty_value" })})`,
        );
}

function getInvertedPrefix(intl: IntlShape, isInverted: boolean) {
    return isInverted ? `${intl.formatMessage({ id: "is_not" })} ` : "";
}

function getSelectionSample(
    selection: IAttributeFilterSelection,
    intl: IntlShape,
    maxChars: number,
    maxListedValues?: number,
) {
    const sampleItems = getSampleElements(selection, intl);
    const prefix = getInvertedPrefix(intl, selection.isInverted);
    const sample =
        prefix +
        compact(maxListedValues ? sampleItems.slice(0, maxListedValues) : sampleItems).join(SAMPLE_DELIMITER);
    if (sample.length > maxChars) {
        return shortenText(sample, { maxLength: maxChars - 2 });
    }

    return sample;
}

function toTextFilterOperator(data: TextModeFilterData): TextFilterOperator {
    if (isArbitraryFilterData(data)) {
        return data.negativeSelection ? "isNot" : "is";
    }

    const negated = data.negativeSelection ?? false;
    switch (data.operator) {
        case "contains":
            return negated ? "doesNotContain" : "contains";
        case "startsWith":
            return negated ? "doesNotStartWith" : "startsWith";
        case "endsWith":
            return negated ? "doesNotEndWith" : "endsWith";
        default:
            return "contains";
    }
}

function getTextModeFilterTitle(textModeFilter: TextModeFilterData, intl: IntlShape): string | null {
    // "All" condition should not produce a text-mode title — let the caller
    // fall through to the standard "All" display.
    if (isTextFilterAll(textModeFilter)) {
        return null;
    }

    const operator = toTextFilterOperator(textModeFilter);
    const values = isArbitraryFilterData(textModeFilter) ? textModeFilter.values : [];
    const literal = isMatchFilterData(textModeFilter) ? textModeFilter.literal : "";
    const parts = getTextFilterStateParts(operator, values, literal, intl);
    // Skip "is" operator in metric alias — positive selection needs no prefix
    const operatorPrefix = operator === "is" ? "" : parts.operator;

    // For arbitrary filters with more than 3 values, show count instead of listing all items
    if (isArbitraryFilterData(textModeFilter) && values.length > MAX_LISTED_FILTER_ATTRIBUTE_VALUES) {
        const count = `(${values.length})`;
        return operatorPrefix ? `${operatorPrefix} ${count}` : count;
    }

    return operatorPrefix ? `${operatorPrefix} ${parts.value}` : parts.value;
}

interface IAttributeFilterSelection {
    isAllSelected: boolean;
    isInverted: boolean;
    selectedElements: {
        title: string;
        available: boolean;
        formattedTitle?: string;
    }[];
}

export function getSelectionTitle(
    attributeTitle: string,
    selection: IAttributeFilterSelection,
    intl: IntlShape,
) {
    if (selection.isAllSelected) {
        return intl.formatMessage({ id: "all" });
    }
    const maxChars = MAX_TITLE_LENGTH - attributeTitle.length;
    return getSelectionSample(selection, intl, maxChars);
}

export function buildFilterSelection(filter: IDecoratedMetricAttributeFilter): IAttributeFilterSelection {
    return {
        isAllSelected: filter.allSelected,
        isInverted: filter.isInverted,
        // a date attribute value is shown the way the backend formats it, as in the filter bar
        selectedElements: filter.selectedElements.map((element) => ({
            title: element.title,
            available: element.available === true,
            ...(element.formattedTitle ? { formattedTitle: element.formattedTitle } : {}),
        })),
    };
}

function selectionEquals(
    filter: IDecoratedMetricAttributeFilter,
    selectedElements: IDecoratedAttributeElement[],
    isInverted: boolean,
) {
    const thisUris = elementUris(filter.selectedElements);
    const checkUris = elementUris(selectedElements);

    return (
        thisUris.length === checkUris.length &&
        filter.isInverted === isInverted &&
        union(thisUris, checkUris).length === thisUris.length
    );
}

function filterValuesAreSummarized(filter: IDecoratedMetricAttributeFilter) {
    return getAvailableSelectionSize(filter) > MAX_LISTED_FILTER_ATTRIBUTE_VALUES;
}

function getAttributeTitle(filter: IDecoratedMetricAttributeFilter) {
    return filter.attribute?.title;
}

/**
 * The title a filter is shown with. A date attribute's own title comes from the backend untranslated
 * ("Order date - Quarter of Year"), so an additional date filter is titled from its dataset and the
 * translated granularity instead, as the date filter titles it.
 */
function getDisplayTitle(filter: IDecoratedMetricAttributeFilter, intl: IntlShape) {
    const { attribute, dateDatasetTitle } = filter;
    if (dateDatasetTitle && attribute?.dateType) {
        return `${dateDatasetTitle} - ${getGranularityLabel(attribute.dateType, intl)}`;
    }
    return getAttributeTitle(filter);
}

/** The date dataset whose attributes include `attribute`; matched by the attribute ref, else its label ref. */
function findOwningDateDatasetTitle(
    attribute: ICatalogEntry | undefined,
    dateDatasetsMeta: ReadonlyArray<IDateDatasetsMetaItem> | undefined,
): string | undefined {
    if (!attribute?.dateType || !dateDatasetsMeta?.length) {
        return undefined;
    }
    const owner = dateDatasetsMeta.find((dateDataset) =>
        (dateDataset.attributes ?? []).some(
            (candidate) =>
                (!!attribute.ref && areObjRefsEqual(candidate.ref, attribute.ref)) ||
                (!!attribute.dfRef && areObjRefsEqual(candidate.dfRef, attribute.dfRef)),
        ),
    );
    return owner?.title;
}

function getTitle(filter: IDecoratedMetricAttributeFilter, intl: IntlShape) {
    // variants:
    // filter_name: argument, argument, argument
    // filter_name (argsCnt)
    // metric_name: All
    // filter_name: <operator> <value> (text-mode filters)
    const attributeTitle = `${getDisplayTitle(filter, intl)}`;

    const textFilter = filter.textModeFilter;
    if (textFilter) {
        const textTitle = getTextModeFilterTitle(textFilter, intl);
        if (textTitle) {
            return `${attributeTitle}: ${shortenText(textTitle, { maxLength: MAX_TITLE_LENGTH - attributeTitle.length - 2 })}`;
        }
        return `${attributeTitle}: ${intl.formatMessage({ id: "all" })}`;
    }

    if (!filter.allSelected) {
        if (filterValuesAreSummarized(filter)) {
            const prefix = getInvertedPrefix(intl, filter.isInverted);
            return `${attributeTitle} (${prefix + getAvailableSelectionSize(filter)})`;
        }
        return `${attributeTitle}: ${getSelectionSample(
            buildFilterSelection(filter),
            intl,
            MAX_TITLE_LENGTH - attributeTitle.length,
            MAX_LISTED_FILTER_ATTRIBUTE_VALUES,
        )}`;
    }

    return `${attributeTitle}: ${intl.formatMessage({ id: "all" })}`;
}

function getEllipsedTitle(filter: IDecoratedMetricAttributeFilter, intl: IntlShape) {
    const textFilter = filter.textModeFilter;
    if (textFilter) {
        const textTitle = getTextModeFilterTitle(textFilter, intl);
        if (textTitle) {
            return `${getDisplayTitle(filter, intl)}: ${textTitle}`;
        }
        return `${getDisplayTitle(filter, intl)}: ${intl.formatMessage({ id: "all" })}`;
    }

    const selection = buildFilterSelection(filter);
    const displayTitle = `${getDisplayTitle(filter, intl)}`;
    const selectionTitle = getSelectionTitle(displayTitle, selection, intl);
    return `${displayTitle}: ${selectionTitle}`;
}

export const DecoratedMetricAttributeFilter = {
    getTitle,
    getEllipsedTitle,
    getAttributeTitle,
    filterValuesAreSummarized,
    selectionEquals,
};

/**
 * Points the raw filter at the display form the filter config says it must be SHOWN as. Identity both
 * when there is no such config and when the filter already carries that display form — `original` is
 * what the write-back paths dispatch verbatim, so a rebuild here dirties the filter subtree.
 */
function withDisplayAsDisplayForm(filter: IBucketItemMetricFilter, displayAsLabel: ObjRef | undefined) {
    if (!displayAsLabel || filter?.displayAsDisplayFormRef === displayAsLabel) {
        return filter;
    }
    return { ...filter, displayAsDisplayFormRef: displayAsLabel };
}

function isModified(bucketsMeta: Partial<IBucketsMetaState> | undefined, filter: IBucketItemMetricFilter) {
    return bucketsMeta?.modified?.[filter?.attribute] ?? false;
}

function normalizeTextModeFilter(raw: TextModeFilterData | null | undefined): TextModeFilterData | null {
    return raw || null;
}

export function createDecoratedMetricAttributeFilter(
    filter: IBucketItemMetricFilter = metricAttributeFilter(),
    itemCache: ICatalogEntries = {},
    bucketsMeta: Partial<IBucketsMetaState> | undefined = {},
    isMeasure = false,
    attributeFilterConfigs: IAttributeFilterConfigs = {},
    dateDatasetsMeta?: ReadonlyArray<IDateDatasetsMetaItem>,
): IDecoratedMetricAttributeFilter {
    const filterConfig = attributeFilterConfigs[filter?.localIdentifier];
    const attribute = getAttribute(filter, itemCache);
    const dateDatasetTitle = findOwningDateDatasetTitle(attribute, dateDatasetsMeta);

    const rawTextModeFilter = filter?.textModeFilter;
    const isTextModeFilter = !!rawTextModeFilter;

    const decorated: IDecoratedMetricAttributeFilter = {
        allElements: filter?.allElements ?? [],
        isInverted: filter?.isInverted ?? true,
        totalElementsCount: filter?.totalElementsCount ?? 0,
        noData: filter?.noData ?? false,
        expression: filter?.expression ?? "",
        original: withDisplayAsDisplayForm(filter, filterConfig?.displayAsLabel),
        isModified: isMeasure ? true : isModified(bucketsMeta, filter),
        attribute,
        ...(dateDatasetTitle ? { dateDatasetTitle } : {}),
        textModeFilter: normalizeTextModeFilter(rawTextModeFilter),
        isDate: false,
        // Text-mode filters (arbitrary/match) don't use element-based selection,
        // skip element operations entirely and set sensible defaults.
        selectedElements: [],
        selectionSize: 0,
        allSelected: false,
    };

    if (!isTextModeFilter) {
        decorated.selectedElements = getSelectedElements(filter);
        decorated.selectionSize =
            filter?.totalElementsCount === undefined ? 0 : getAvailableSelectionSize(decorated);
        decorated.allSelected = isAllSelected(filter);
    }

    return decorated;
}
