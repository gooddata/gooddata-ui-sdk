// (C) 2007-2026 GoodData Corporation

import invariant from "invariant";
import { isEmpty } from "lodash-es";
import { type IntlShape } from "react-intl";

import { type IAttributeFilterConfigs, type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import { hasAreaDisplayForm, hasLocationDisplayForm } from "../components/catalog/utils/locationAttribute.js";
import { type GeoLabelType } from "../constants/geo.js";
import { type IBucketsMetaState } from "../store/buckets/buckets_meta_state.js";
import { filterHasTextFilterAll } from "../store/filter_bar/filter_bar_types.js";
import { type IBucketItemMetricFilter } from "../typings/bucket_item_filter.js";
import {
    type IDecoratedBucketItem,
    type IDecoratedGranularity,
    type IRawBucketItem,
} from "../typings/buckets.js";
import { type IMeasuresDescriptions as IMeasuresDescriptionsTyping } from "../typings/measure_descriptions.js";
import { type IDecoratedMetricFilter, type IDecoratedMetricFilters } from "../typings/measure_filters.js";
import {
    type ICacheItemDisplayForm,
    type ICatalogEntries,
    type ICatalogEntry,
} from "../typings/state_objects.js";
import { shortenText } from "../utils/base.js";

import {
    isArithmeticMeasure,
    isAttribute,
    isComputedAttributeItem,
    isDate,
    isDerived,
    isMeasure,
} from "./bucket_item.js";
import {
    type IDecoratedDateDatasetItem,
    type IDecoratedDateDatasetMeta,
    type ISelectedDateDatasets,
    decoratedDateDatasetMeta,
} from "./date_dataset.js";
import { DecoratedDateFilter, type IDecoratedDateFilter, createDecoratedDateFilter } from "./date_filter.js";
import { DATE_DATASET_ATTRIBUTE, createDateItem } from "./date_item.js";
import {
    DecoratedMetricAttributeFilter,
    type IDecoratedMetricAttributeFilter,
    createDecoratedMetricAttributeFilter,
} from "./decorated_metric_attribute_filter.js";
import { type ItemCacheNamespace, attributeCacheNamespace } from "./item_cache_lookup.js";

// The single IMeasuresDescriptions definition lives in typings/measure_descriptions.ts;
// aliased here to keep existing model-path imports working.
export type IMeasuresDescriptions = IMeasuresDescriptionsTyping;

const MAX_TITLE_LENGTH = 1000;

const DECORATED_BUCKET_ITEM_DEFAULTS: IDecoratedBucketItem = {
    ref: null,
    aggregation: null,
    showInPercent: null,
    showAllValues: null,
    showOnSecondaryAxis: null,
    isThresholdMeasure: null,
    isTotalMeasure: null,
    isKdaDisabled: null,
    alias: null,
    localIdentifier: null,
    masterLocalIdentifier: null,
    operator: null,
    operandLocalIdentifiers: null,
    format: null,
    sort: null,
    attribute: null,
    collapsed: true,
    dateDataset: null,
    filters: [],
    isMeasure: false,
    isArithmeticMeasure: false,
    isDate: false,
    isDerived: false,
    measureAxisLabel: "",
    measureTitle: "",
    label: "",
    original: null,
    granularity: undefined,
    uri: undefined,
};

/**
 * Plain-object builder: unknown keys are dropped and explicitly-undefined values fall back to the
 * defaults.
 */
export function newDecoratedBucketItem(props: Partial<IDecoratedBucketItem> = {}): IDecoratedBucketItem {
    return fromPartial(DECORATED_BUCKET_ITEM_DEFAULTS, props);
}

export function fromPartial<T extends object>(defaults: T, values: object): T {
    const result: T = { ...defaults };
    for (const key of Object.keys(result) as Array<keyof T>) {
        const value = (values as Partial<T>)[key];
        if (value !== undefined) {
            result[key] = value;
        }
    }
    return result;
}

function getMeasureAxisLabel(
    measureTitle: string,
    filters: IDecoratedMetricFilters,
    intl: IntlShape,
    formatLocale?: string,
) {
    const joinFilterTitles = (filters: IDecoratedMetricAttributeFilter[]) =>
        filters.map((filter) => DecoratedMetricAttributeFilter.getTitle(filter, intl)).join("; ");

    const strategies = {
        summarized(filters: IDecoratedMetricAttributeFilter[]) {
            const moreFiltersQuoted =
                filters.length > 1 ? `"${joinFilterTitles(filters)}"` : joinFilterTitles(filters);

            return `: ${moreFiltersQuoted}`;
        },

        listingSelectedElements(filters: IDecoratedMetricAttributeFilter[]) {
            return ` (${joinFilterTitles(filters)})`;
        },
    };

    const getAttributeFiltersTitles = (filters: IDecoratedMetricFilters) => {
        const attributeFilters = filters.filter((filter): filter is IDecoratedMetricAttributeFilter => {
            if (filter.isDate) {
                return false;
            }
            const attributeFilter = filter as IDecoratedMetricAttributeFilter;
            return !(attributeFilter.allSelected || filterHasTextFilterAll(attributeFilter));
        });

        if (attributeFilters.length === 0) {
            return "";
        }

        const filterValuesAreSummarized = attributeFilters.some((filter) =>
            DecoratedMetricAttributeFilter.filterValuesAreSummarized(filter),
        );

        return filterValuesAreSummarized
            ? strategies.summarized(attributeFilters)
            : strategies.listingSelectedElements(attributeFilters);
    };

    // Lists every date filter of the metric, the same way the metric subtitle in the bucket does.
    const getDateFilterTitle = (filters: IDecoratedMetricFilters) => {
        const dateFilters = filters.filter((filter): filter is IDecoratedDateFilter => filter.isDate);

        if (dateFilters.length === 0) {
            return "";
        }

        // TODO: switch to the SDK date filter title and drop the legacy preset title strings once
        // enableImprovedMetricDateFilter is removed
        const dateFilterTitles = dateFilters.map((dateFilter) =>
            DecoratedDateFilter.getTitle(dateFilter, intl, formatLocale),
        );
        return `, ${dateFilterTitles.join("; ")}`;
    };

    const attributeFilterTitles = getAttributeFiltersTitles(filters);
    const dateFilterTitle = getDateFilterTitle(filters);

    const shortenOptions = {
        maxLength: MAX_TITLE_LENGTH - measureTitle.length - dateFilterTitle.length,
    };

    return measureTitle + dateFilterTitle + shortenText(attributeFilterTitles, shortenOptions);
}

function hasLocationRefs(item: IRawBucketItem): boolean {
    return Boolean(
        item?.["locationDisplayFormRef"] ||
        (item as unknown as IDecoratedBucketItem)?.attribute?.locationDisplayFormRef,
    );
}

function hasAreaRefs(item: IRawBucketItem): boolean {
    return Boolean(
        item?.["areaDisplayFormRef"] ||
        (item as unknown as IDecoratedBucketItem)?.attribute?.areaDisplayFormRef,
    );
}

function isAreaGeoAttribute(displayForms: readonly ICacheItemDisplayForm[], item: IRawBucketItem): boolean {
    return hasAreaRefs(item) || hasAreaDisplayForm(displayForms);
}

function isLocationGeoAttribute(
    displayForms: readonly ICacheItemDisplayForm[],
    item: IRawBucketItem,
): boolean {
    if (isAreaGeoAttribute(displayForms, item)) {
        return false;
    }

    return hasLocationRefs(item) || hasLocationDisplayForm(displayForms);
}

function matchesGeoLabelType(
    displayForms: readonly ICacheItemDisplayForm[],
    item: IRawBucketItem,
    geoLabelType: GeoLabelType | undefined,
): boolean {
    if (!geoLabelType) {
        return false;
    }

    return geoLabelType === "location"
        ? isLocationGeoAttribute(displayForms, item)
        : isAreaGeoAttribute(displayForms, item);
}

export function getAttribute(
    item: IRawBucketItem,
    itemCache: ICatalogEntries,
    isLocationIconEnabled = false,
    geoLabelType?: GeoLabelType,
): ICatalogEntry {
    // This is actually not catalog attribute but both have displayForms array in the same shape
    const displayForms = item?.displayForms ?? [];
    const isLocationIconVisible =
        isLocationIconEnabled && matchesGeoLabelType(displayForms, item, geoLabelType);
    // TODO: what's this? why is this here? we don't have "displayForm" anywhere, only dfUri, dfIdentifier and dfRef
    const displayForm = item?.["displayForm"];
    const areaDisplayFormRef = item?.["areaDisplayFormRef"];
    const aggregation = item?.aggregation;
    const type = aggregation
        ? aggregation.includes("count") || aggregation.includes("approximate_count")
            ? "attribute"
            : "fact"
        : item?.type;
    // a computed attribute item is an ATTRIBUTE item, but its cache entry lives in the computed
    // attribute namespace - the flag the item carries is what points the lookup at it
    const cacheType: ItemCacheNamespace = isComputedAttributeItem(item)
        ? attributeCacheNamespace(true)
        : (type as ItemCacheNamespace);
    const itemCached = getAttributeByIdentifier(item?.attribute, itemCache, cacheType);
    const isLocationIconVisibleProp = isLocationIconVisible ? { isLocationIconVisible } : {};
    const displayFormProp = displayForm
        ? {
              displayForm,
              dfRef: item?.dfRef,
              dfUri: item?.["dfUri"],
              dfIdentifier: item?.["dfIdentifier"],
          }
        : {}; // copy possibly changed df related props from bucket item to cached item, otherwise user choice of df would be ignored
    const areaDisplayFormProp = areaDisplayFormRef ? { areaDisplayFormRef } : {};
    const decorations = {
        ...isLocationIconVisibleProp,
        ...displayFormProp,
        ...areaDisplayFormProp,
    };

    if (!itemCached) {
        return null;
    }

    // `Map.merge({})` answered `this`, and an undecorated read is the common case (no geo, no
    // display-form override), so the identity short-circuit is re-established explicitly here — a
    // spread would hand every caller a fresh entry on every decoration pass.
    return Object.keys(decorations).length === 0 ? itemCached : { ...itemCached, ...decorations };
}

// Returns the itemCache entry VERBATIM.
export function getAttributeByIdentifier(
    identifier: string,
    itemCache: ICatalogEntries,
    type: ItemCacheNamespace,
): ICatalogEntry {
    if (identifier == null) {
        return null;
    }

    if (identifier === DATE_DATASET_ATTRIBUTE) {
        return createDateItem();
    }
    const cachedItem = itemCache?.[`${type}.${identifier}`];

    invariant(cachedItem, `Item ${type}.${identifier} was not found in cache.`);

    return cachedItem;
}

function isDateAttribute(attribute: ICatalogEntry) {
    return attribute?.identifier === DATE_DATASET_ATTRIBUTE;
}

export function getDateDataset(
    attribute: ICatalogEntry,
    dateDatasets: { items: IDecoratedDateDatasetItem[] },
    item: IRawBucketItem,
) {
    if (attribute && attribute.type !== "date") {
        return null;
    }
    const itemDateDatasetRef: ObjRef = item?.dateDatasetRef;

    return dateDatasets.items.find((dateDataset) => areObjRefsEqual(dateDataset.ref, itemDateDatasetRef));
}

export function getGranularity(
    item: IRawBucketItem,
    attribute: ICatalogEntry,
    dateDataset: IDecoratedDateDatasetItem,
): IDecoratedGranularity | undefined {
    if (attribute?.type !== "date" || !dateDataset) {
        return undefined;
    }

    const granularityId = item?.granularity;

    const attributes = dateDataset.attributes ?? [];
    const matchingAttribute =
        attributes.find((granularity) => !granularityId || granularity.dateType === granularityId) ||
        undefined;

    if (!matchingAttribute) {
        // fallback to first available granularity, if none matching
        return attributes[0];
    }

    // check if bucket item has changed display form that should be used by date dataset attribute instead of the default one
    const dfRef = item?.dfRef;

    if (!dfRef) {
        return matchingAttribute;
    }

    const displayForms = matchingAttribute.displayForms ?? [];

    const displayForm =
        displayForms.find((item: ICacheItemDisplayForm) => areObjRefsEqual(item.ref, dfRef)) ??
        displayForms[0];

    if (!displayForm) {
        return matchingAttribute;
    }

    return {
        ...matchingAttribute,
        dfRef: displayForm.ref,
        dfUri: displayForm.uri,
        dfIdentifier: displayForm.id,
    };
}

/**
 * A metric date filter names its own date dataset (`dimension`); the measure-level selection,
 * which every write keeps in sync for the metric's primary (first) date filter, only stands in for
 * a filter that names none.
 */
function getDateFilterDateDatasetMetaItem(
    localIdentifier: string,
    selectedDateDatasets: ISelectedDateDatasets,
    ownDateDatasetIdentifier: string | undefined,
): IDecoratedDateDatasetMeta | null {
    const own =
        ownDateDatasetIdentifier === undefined
            ? undefined
            : selectedDateDatasets.dateDatasetsMeta?.find(
                  (dateDataset) => dateDataset.identifier === ownDateDatasetIdentifier,
              );
    const dateDatasetMetaItem = own ?? selectedDateDatasets.measureDateDatasets.get(localIdentifier);
    return dateDatasetMetaItem ? decoratedDateDatasetMeta(dateDatasetMetaItem) : null;
}

function getFilters(
    item: IRawBucketItem,
    itemCache: ICatalogEntries,
    attribute: ICatalogEntry,
    selectedDateDatasets: ISelectedDateDatasets,
    bucketsMeta: Partial<IBucketsMetaState> | undefined,
    isMeasure: boolean,
    attributeFilterConfigs: IAttributeFilterConfigs,
): IDecoratedMetricFilters {
    if (isDateAttribute(attribute)) {
        return []; // date bucket item has no filters
    }

    const filters: IBucketItemMetricFilter[] = item?.filters ?? [];
    return filters
        .filter((filter) => !isEmpty(filter?.attribute))
        .map((filter): IDecoratedMetricFilter => {
            if (filter?.attribute === DATE_DATASET_ATTRIBUTE) {
                const localIdentifier = item?.localIdentifier;
                const decoratedDateDataset = getDateFilterDateDatasetMetaItem(
                    localIdentifier,
                    selectedDateDatasets,
                    filter.dimension,
                );
                const emptyBucketsMeta = {};
                return createDecoratedDateFilter(filter, decoratedDateDataset, emptyBucketsMeta, isMeasure);
            }
            return createDecoratedMetricAttributeFilter(
                filter,
                itemCache,
                bucketsMeta,
                isMeasure,
                attributeFilterConfigs,
                selectedDateDatasets.dateDatasetsMeta,
            );
        });
}

export function getUri(attribute: ICatalogEntry, granularity: IDecoratedGranularity | undefined) {
    if (attribute?.type === "date") {
        return granularity?.uri || undefined;
    }

    return attribute?.uri;
}

function isCollapsed(item: IRawBucketItem, bucketsMeta: Partial<IBucketsMetaState> | undefined) {
    if (isDate(item) || isAttribute(item)) {
        return bucketsMeta?.attributeExpanded !== item?.localIdentifier;
    }
    return bucketsMeta?.measureExpanded !== item?.localIdentifier;
}

export function hasLocalIdentifier(bucketItem: IDecoratedBucketItem, localIdentifier: string): boolean {
    return bucketItem.localIdentifier === localIdentifier;
}

export function decoratedBucketItem(
    item: IRawBucketItem,
    itemCache: ICatalogEntries,
    selectedDateDatasets: ISelectedDateDatasets,
    measuresDescriptions: IMeasuresDescriptions,
    bucketsMeta: Partial<IBucketsMetaState> | undefined = {},
    attributeFilterConfigs: IAttributeFilterConfigs,
    intl: IntlShape,
    isLocationIconEnabled = false,
    formatLocale?: string,
    geoLabelType?: GeoLabelType,
): IDecoratedBucketItem {
    const localIdentifier = item?.localIdentifier;
    const attribute = getAttribute(item, itemCache, isLocationIconEnabled, geoLabelType);
    const dateDataset = getDateDataset(attribute, selectedDateDatasets.globalDateDatasets, item);
    const isMeasureItem = isMeasure(item);
    const granularity = getGranularity(item, attribute, dateDataset);
    const isArithmetic = isArithmeticMeasure(item);
    const filters = getFilters(
        item,
        itemCache,
        attribute,
        selectedDateDatasets,
        bucketsMeta,
        isMeasureItem,
        attributeFilterConfigs,
    );

    const decorated = fromPartial(DECORATED_BUCKET_ITEM_DEFAULTS, {
        // raw fields copied verbatim
        ref: item?.ref,
        aggregation: item?.aggregation,
        showInPercent: item?.showInPercent,
        showAllValues: item?.showAllValues,
        showOnSecondaryAxis: item?.showOnSecondaryAxis,
        isThresholdMeasure: item?.isThresholdMeasure,
        isTotalMeasure: item?.isTotalMeasure,
        isKdaDisabled: item?.isKdaDisabled,
        alias: item?.alias,
        masterLocalIdentifier: item?.masterLocalIdentifier,
        operator: item?.operator,
        operandLocalIdentifiers: item?.operandLocalIdentifiers,
        format: item?.format,
        sort: item?.["sort"],
        // decorations
        localIdentifier,
        attribute,
        collapsed: isCollapsed(item, bucketsMeta),
        dateDataset,
        filters,
        granularity,
        isArithmeticMeasure: isArithmetic,
        isDate: isDateAttribute(attribute),
        isDerived: isDerived(item),
        isMeasure: isMeasureItem,
        original: item,
        uri: getUri(attribute, granularity),
    });

    if (isMeasureItem) {
        const measureDescriptions = measuresDescriptions[localIdentifier];
        if (measureDescriptions !== undefined) {
            decorated.measureTitle = measureDescriptions.title;
            decorated.measureAxisLabel = getMeasureAxisLabel(
                measureDescriptions.title,
                filters,
                intl,
                formatLocale,
            );
            decorated.label = measureDescriptions.alias || measureDescriptions.title;
        }
    }

    return decorated;
}
