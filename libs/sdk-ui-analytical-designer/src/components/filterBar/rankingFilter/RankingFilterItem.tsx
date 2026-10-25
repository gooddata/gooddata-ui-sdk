// (C) 2020-2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import classNames from "classnames";
import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";

import {
    type IFilter,
    type IRankingFilter as IRankingFilterModel,
    type ObjRef,
    type ObjRefInScope,
    areObjRefsEqual,
    isLocalIdRef,
    isRankingFilter,
    localIdRef,
    newRankingFilter,
} from "@gooddata/sdk-model";
import {
    type IAttributeDropdownItem,
    type ICustomGranularitySelection,
    type IMeasureDropdownItem,
} from "@gooddata/sdk-ui-filters";
import { type IBucketItemDescriptors } from "@gooddata/sdk-ui-kit";

import { isComputedAttributeItem } from "../../../models/bucket_item.js";
import {
    getAttribute,
    getAttributeByIdentifier,
    getDateDataset,
    getGranularity,
} from "../../../models/decorated_bucket_item.js";
import { attributeCacheNamespace } from "../../../models/item_cache_lookup.js";
import {
    highlightBucketAndFilterItems,
    resetHighlightedBucketAndFilterItems,
} from "../../../sagas/highlighting/highlighting_ui_actions.js";
import { getProjectId } from "../../../selectors/bootstrap_selector.js";
import {
    getAllMeasureBucketItems,
    getAllSlicingAttributeBucketItems,
    getMeasureDescriptions,
} from "../../../selectors/buckets_selector.js";
import {
    enableComputedAttributes as enableComputedAttributesSelector,
    enableImprovedRankingFilter as enableImprovedRankingFilterSelector,
    enableRankingStrictLimit as enableRankingStrictLimitSelector,
    enableRankingWithMvf as enableRankingWithMvfSelector,
} from "../../../selectors/feature_flag_selector.js";
import { getInsightWithBucketsViaMd } from "../../../selectors/insight_selectors.js";
import { getIntl } from "../../../selectors/intl_selector.js";
import { getItemCache } from "../../../selectors/item_cache_selector.js";
import { getMeasureSequenceNumbers } from "../../../selectors/measure_sequence_numbers_selector.js";
import { getTagsConfiguration } from "../../../selectors/route_selector.js";
import { selectedDateDatasetsSelector } from "../../../selectors/selected_date_datasets_selector.js";
import { BucketItemService } from "../../../services/bucket_item_service.js";
import { updateRankingFilter as updateRankingFilterAction } from "../../../store/bucket_filters/bucket_filters_actions.js";
import { getCatalogMeasures } from "../../../store/catalog/catalog_selector.js";
import { hasActiveMeasureValueFilter as getHasActiveMeasureValueFilter } from "../../../store/filter_bar/filter_bar_selector.js";
import { type IRankingFilter as IRankingFilterState } from "../../../store/filter_bar/filter_bar_types.js";
import { getAboutToBeRemovedBucketAndFilterItems } from "../../../store/highlighting/highlighting_selector.js";
import { type AppDispatch, type IAppState } from "../../../store/types.js";
import { type ICacheItem, type ICatalogEntries } from "../../../typings/state_objects.js";
import { fromSdkModelDimensionality, toSdkModelDimensionality } from "../../../utils/dimensionality.js";
import { getRouteParams } from "../../../utils/location.js";
import { getAttributeItems, getBucketItemNames } from "../../sort/chart_sort_bucket_items.js";
import { FilterItem } from "../FilterItem.js";
import { buildRankingAvailabilityItems } from "../measure_value_filter_item_utils.js";
import { useFilterDimensionality } from "../useFilterDimensionality.js";

import { RankingFilter } from "./RankingFilter.js";
import { RankingMeasureDropdownBody } from "./RankingMeasureDropdownBody.js";

export const createRankingFilterModel = (rankingFilterState: IRankingFilterState): IRankingFilterModel => {
    const {
        measureLocalIdentifier,
        measureRef,
        attributes,
        operator,
        value,
        applyOnResult,
        strictLimitOfRows,
    } = rankingFilterState;
    // Bucket measures are referenced by localIdentifier; catalog measures by ObjRef.
    const measure: ObjRefInScope | string = measureRef ?? measureLocalIdentifier;
    // Bucket attributes (strings) and catalog attributes (ObjRef) are normalized to ObjRefInScope[].
    const sdkAttributes = toSdkModelDimensionality(attributes);
    const baseFilter =
        sdkAttributes?.length > 0
            ? newRankingFilter(measure, sdkAttributes, operator, value)
            : newRankingFilter(measure, operator, value);

    // Preserve applyOnResult / strictLimitOfRows if set
    return {
        rankingFilter: {
            ...baseFilter.rankingFilter,
            ...(applyOnResult === undefined ? {} : { applyOnResult }),
            ...(strictLimitOfRows === undefined ? {} : { strictLimitOfRows }),
        },
    };
};

export const createRankingFilterItem = (
    rankingFilterState: IRankingFilterState,
    rankingFilterComponent: IRankingFilterModel,
): IRankingFilterState => {
    const { measure, attributes, operator, value, applyOnResult, strictLimitOfRows } =
        rankingFilterComponent.rankingFilter;
    const { type, localIdentifier } = rankingFilterState;

    // Keep bucket attributes as local-id strings and catalog attributes as ObjRef. fromSdkModelDimensionality
    // returns undefined for an empty array, so omit the key entirely rather than emitting
    // { attributes: undefined } for a present-but-empty selection.
    const convertedAttributes = attributes ? fromSdkModelDimensionality(attributes) : undefined;
    const attributesProp = convertedAttributes?.length ? { attributes: convertedAttributes } : {};

    const applyOnResultProp = applyOnResult === undefined ? {} : { applyOnResult };
    const strictLimitOfRowsProp = strictLimitOfRows === undefined ? {} : { strictLimitOfRows };

    // A local id ref means the ranked measure lives in the buckets; any other ObjRef means it is a
    // catalog measure referenced by ref.
    const measureProp = isLocalIdRef(measure)
        ? { measureLocalIdentifier: measure.localIdentifier }
        : { measureRef: measure };

    return {
        ...attributesProp,
        type,
        localIdentifier,
        ...measureProp,
        operator,
        value,
        ...applyOnResultProp,
        ...strictLimitOfRowsProp,
    };
};

export interface IRankingFilterItemProps {
    filter: IRankingFilterState;
    className?: string;
    isHighlighted?: boolean;
    /** the user just added this filter, so its configuration opens right away */
    isAutoOpen?: boolean;
    /** apply and cancel both end the configuration; the filter bar releases its auto-open hand-over on it */
    onClose?: () => void;
}

// Rewrites the ranking filter on the insight passed to date-dataset loading so it carries the in-progress
// "out of" attributes (mirrors the measure value filter). AD allows a single ranking filter, so matching by
// type is sufficient; other insight filters pass through unchanged.
const applyAttributesToRanking = (
    insightFilter: IFilter,
    _filter: IRankingFilterState,
    override: ObjRefInScope[],
): IFilter =>
    isRankingFilter(insightFilter)
        ? { rankingFilter: { ...insightFilter.rankingFilter, attributes: override } }
        : insightFilter;

const getBucketMeasureItems = createSelector(
    getAllMeasureBucketItems,
    getMeasureDescriptions,
    getMeasureSequenceNumbers,
    getIntl,
    (measureBucketItems, measureDescriptions, sequenceNumbers, intl): IMeasureDropdownItem[] => {
        return measureBucketItems.map((measureBucketItem) => {
            const { localIdentifier } = measureBucketItem;
            const { title, alias } = measureDescriptions[localIdentifier];
            return {
                title: alias || title,
                ref: localIdRef(localIdentifier),
                sequenceNumber: intl.formatMessage(
                    { id: "bucket.title.measureSequenceNumber" },
                    { measureSequenceNumber: sequenceNumbers[localIdentifier] },
                ),
            };
        });
    },
);

const getBucketMeasureRefs = createSelector(getAllMeasureBucketItems, (measureBucketItems): ObjRef[] =>
    measureBucketItems.map((item) => item.ref).filter(Boolean),
);

/**
 * Measure items offered in the ranking filter measure dropdown. Bucket measures are always offered
 * (referenced by local id). When the improved ranking filter is enabled, catalog measures not present
 * in the buckets are offered too (referenced by ObjRef), so a ranking filter can rank by a catalog metric.
 *
 * Exported so tests can resolve it when they stub `useSelector`.
 */
export const getMeasuresSelector = createSelector(
    getBucketMeasureItems,
    getBucketMeasureRefs,
    getCatalogMeasures,
    enableImprovedRankingFilterSelector,
    (
        bucketMeasureItems,
        bucketMeasureRefs,
        catalogMeasures,
        improvedRankingFilterEnabled,
    ): IMeasureDropdownItem[] => {
        if (!improvedRankingFilterEnabled) {
            return bucketMeasureItems;
        }

        const catalogMeasureItems: IMeasureDropdownItem[] = catalogMeasures
            .filter(
                (catalogMeasure) =>
                    !bucketMeasureRefs.some((ref) => areObjRefsEqual(ref, catalogMeasure.measure.ref)),
            )
            .map((catalogMeasure) => ({
                title: catalogMeasure.measure.title,
                ref: catalogMeasure.measure.ref,
            }));

        return [...bucketMeasureItems, ...catalogMeasureItems];
    },
);

/**
 * Bucket attribute/date items offered in the ranking filter "out of" dropdown.
 *
 * Exported so tests can resolve it when they stub `useSelector`.
 */
export const getMultipleDatesAttributeSelector = createSelector(
    getAllSlicingAttributeBucketItems,
    getItemCache,
    selectedDateDatasetsSelector,
    (attributeDecoratedBucketItems, itemCache, selectedDateDataset): IAttributeDropdownItem[] => {
        return attributeDecoratedBucketItems.map((attributeDecoratedBucketItem) => {
            const { localIdentifier } = attributeDecoratedBucketItem;
            const isDate = BucketItemService.isDateItem(attributeDecoratedBucketItem);
            let title: string;

            if (isDate) {
                const attribute = getAttribute(attributeDecoratedBucketItem, itemCache);
                const dateDataset = getDateDataset(
                    attribute,
                    selectedDateDataset.globalDateDatasets,
                    attributeDecoratedBucketItem,
                );
                const granularity = getGranularity(attributeDecoratedBucketItem, attribute, dateDataset);
                title = BucketItemService.getDateDatasetItemTitle(granularity, dateDataset);
            } else {
                const { attribute } = attributeDecoratedBucketItem;
                const cacheItem = getAttributeByIdentifier(
                    attribute,
                    itemCache,
                    attributeCacheNamespace(isComputedAttributeItem(attributeDecoratedBucketItem)),
                ) as ICacheItem;
                title = cacheItem.title;
            }

            return {
                type: isDate ? "DATE" : "ATTRIBUTE",
                title,
                ref: localIdRef(localIdentifier),
            };
        });
    },
);

// Stable empty defaults for the flag-off path, so the useSelector reference checks do not churn.
const EMPTY_BUCKET_ITEM_DESCRIPTORS: IBucketItemDescriptors = {};
const EMPTY_ITEM_CACHE: ICatalogEntries = {};
// the drag layer renders the item without a close listener
const noop = () => {};

export function RankingFilterItem({
    filter,
    className,
    isHighlighted,
    isAutoOpen = false,
    onClose,
}: IRankingFilterItemProps) {
    const intl = useIntl();
    const dispatch = useDispatch<AppDispatch>();

    const measureItems = useSelector(getMeasuresSelector);
    const attributeItems = useSelector(getMultipleDatesAttributeSelector);
    const aboutToBeRemovedBucketAndFilterItems = useSelector(getAboutToBeRemovedBucketAndFilterItems);
    const hasActiveMeasureValueFilter = useSelector(getHasActiveMeasureValueFilter);
    const enableRankingWithMvf = useSelector(enableRankingWithMvfSelector);
    const enableRankingStrictLimit = useSelector(enableRankingStrictLimitSelector);
    const enableImprovedRankingFilter = useSelector(enableImprovedRankingFilterSelector);
    const computedAttributesEnabled = useSelector(enableComputedAttributesSelector);

    // The catalog "out of" wiring is consumed only by the improved flow. Skip the heavy selectors when the
    // flag is off (notably getInsightWithBucketsViaMd, which recomputes on every bucket/sort change), so a
    // legacy ranking filter neither recomputes nor re-renders on unrelated insight edits.
    const itemCache = useSelector((state: IAppState) =>
        enableImprovedRankingFilter ? getItemCache(state) : EMPTY_ITEM_CACHE,
    );
    const bucketItemNames = useSelector((state: IAppState) =>
        enableImprovedRankingFilter ? getBucketItemNames(state) : EMPTY_BUCKET_ITEM_DESCRIPTORS,
    );
    const insightDimensionalityItems = useSelector((state: IAppState) =>
        enableImprovedRankingFilter ? getAttributeItems(state) : EMPTY_BUCKET_ITEM_DESCRIPTORS,
    );
    const projectId = useSelector((state: IAppState) =>
        enableImprovedRankingFilter ? getProjectId(state) : "",
    );
    const insight = useSelector((state: IAppState) =>
        enableImprovedRankingFilter ? getInsightWithBucketsViaMd(state) : undefined,
    );
    const datasetId = useSelector((state: IAppState) =>
        enableImprovedRankingFilter ? getRouteParams(state).dataset : undefined,
    );
    const includeObjectsWithTags = useSelector((state: IAppState) =>
        enableImprovedRankingFilter ? getTagsConfiguration(state).includeObjectsWithTags : undefined,
    );
    const excludeObjectsWithTags = useSelector((state: IAppState) =>
        enableImprovedRankingFilter ? getTagsConfiguration(state).excludeObjectsWithTags : undefined,
    );

    const updateRankingFilter = useCallback(
        (updatedFilter: IRankingFilterState) => {
            dispatch(updateRankingFilterAction(updatedFilter));
        },
        [dispatch],
    );

    const highlightRelatedItems = useCallback(
        (bucketItemLocalIdentifiers: string[], filterLocalIdentifier?: string) => {
            dispatch(highlightBucketAndFilterItems(bucketItemLocalIdentifiers, filterLocalIdentifier));
        },
        [dispatch],
    );

    const resetHighlighted = useCallback(() => {
        dispatch(resetHighlightedBucketAndFilterItems());
    }, [dispatch]);

    // Shared catalog-dimensionality wiring (also used by the measure value filter). The availability builder
    // and the in-progress-insight rewrite (applyAttributesToRanking) are the only per-filter pieces.
    const { insightDimensionality, toTitledItems, loadCatalogDimensionality } =
        useFilterDimensionality<IRankingFilterState>({
            insight,
            insightDimensionalityItems,
            itemCache,
            bucketItemNames,
            projectId,
            datasetId,
            includeObjectsWithTags,
            excludeObjectsWithTags,
            filter,
            buildAvailabilityItems: buildRankingAvailabilityItems,
            applyOverrideToInsightFilter: applyAttributesToRanking,
            computedAttributesEnabled,
        });

    // Insight default "out of" attributes (bucket attributes/dates), used for the reset-to-defaults action.
    const insightAttributeItems = useMemo(() => insightDimensionality ?? [], [insightDimensionality]);

    // The filter's own stored "out of" attributes, resolved with catalog-aware titles.
    const storedAttributeItems = useMemo(
        () => toTitledItems(toSdkModelDimensionality(filter.attributes)) ?? [],
        [toTitledItems, filter.attributes],
    );

    // The selection shown in the dropdown: the filter's own attributes, or the insight defaults when it has
    // none ("reuses insight attributes").
    const selectedAttributeItems = useMemo(
        () => (storedAttributeItems.length > 0 ? storedAttributeItems : insightAttributeItems),
        [storedAttributeItems, insightAttributeItems],
    );

    // Catalog-aware titles of the effective "out of" attributes, for the filter pill label. Uses the same
    // selection shown in the dropdown (the filter's own attributes, or the insight defaults when it reuses
    // them) so the pill and the dropdown stay consistent.
    const attributeTitles = useMemo(
        () => selectedAttributeItems.map((item) => item.title),
        [selectedAttributeItems],
    );

    const filterItemClassNames = useMemo(() => {
        const isAboutToBeRemoved = aboutToBeRemovedBucketAndFilterItems?.includes(filter.localIdentifier);

        return classNames({
            highlight: isHighlighted,
            "about-to-be-removed": isAboutToBeRemoved,
        });
    }, [isHighlighted, aboutToBeRemovedBucketAndFilterItems, filter]);

    const onApply = (rankingFilterComponent: IRankingFilterModel) => {
        const rankingFilterItem = createRankingFilterItem(filter, rankingFilterComponent);
        updateRankingFilter(rankingFilterItem);
    };

    const onDropDownItemMouseOver = (ref: ObjRefInScope) => {
        // Only bucket measures (referenced by local id) can be highlighted in the buckets;
        // catalog measures referenced by ObjRef have no corresponding bucket item.
        if (isLocalIdRef(ref)) {
            highlightRelatedItems([ref.localIdentifier]);
        }
    };

    const customGranularitySelection: ICustomGranularitySelection = useMemo(
        () =>
            hasActiveMeasureValueFilter
                ? {
                      enable: false,
                      warningMessage: intl.formatMessage({
                          id: "ranking_filter.attribute_dropdown.measure_value_filter_used",
                      }),
                  }
                : null,
        [hasActiveMeasureValueFilter, intl],
    );

    return (
        <FilterItem identifier={filter.localIdentifier} className={filterItemClassNames}>
            <RankingFilter
                filter={createRankingFilterModel(filter)}
                measureItems={measureItems}
                attributeItems={attributeItems}
                onApply={onApply}
                onCancel={onClose ?? noop}
                onDropDownItemMouseOver={onDropDownItemMouseOver}
                onDropDownItemMouseOut={resetHighlighted}
                className={className}
                // read at mount only: a later flip of isAutoOpen only ever goes true -> false
                mountOpened={isAutoOpen}
                customGranularitySelection={customGranularitySelection}
                intl={intl}
                enableRankingWithMvf={enableRankingWithMvf}
                enableRankingStrictLimit={enableRankingStrictLimit}
                renderMeasureDropdownBody={
                    enableImprovedRankingFilter ? RankingMeasureDropdownBody : undefined
                }
                isAttributesSectionEnabled={enableImprovedRankingFilter}
                attributes={selectedAttributeItems}
                insightAttributes={insightAttributeItems}
                loadCatalogAttributes={loadCatalogDimensionality}
                // Only the improved flow drives the pill from the multi-attribute "out of" titles; the
                // legacy flow keeps its classic single-attribute pill label (resolved in getButtonModel).
                attributeTitles={enableImprovedRankingFilter ? attributeTitles : undefined}
            />
        </FilterItem>
    );
}
