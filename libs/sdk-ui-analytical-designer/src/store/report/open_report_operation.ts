// (C) 2026 GoodData Corporation

import {
    type IInsight,
    type IFilter as ISdkFilter,
    type ObjRef,
    areObjRefsEqual,
    filterObjRef,
    insightFilters,
    isDateFilter as isSdkDateFilter,
} from "@gooddata/sdk-model";

import { DATE } from "../../constants/bucket.js";
import { isMeasure } from "../../models/bucket_item.js";
import { DATE_DATASET_ATTRIBUTE } from "../../models/date_item.js";
import { metadataToBuckets } from "../../models/metadata.js";
import { convertFiltersToRefPoint } from "../../services/reference_point_service.js";
import { type IBucketItemMetricFilter } from "../../typings/bucket_item_filter.js";
import { type IRawBucketItem, type IRawBuckets } from "../../typings/buckets.js";
import { type IDateDataset } from "../../typings/datasets.js";
import { type ILoadedReportItems } from "../../typings/report.js";
import { convertModelInsightToADRep } from "../../utils/sdkModelToADRep/InsightConverter.js";
import { type IBucketsMetaState } from "../buckets/buckets_meta_state.js";
import { getMeasuresInBuckets } from "../buckets/buckets_read_helpers.js";
import { type IBucketsState } from "../buckets/buckets_state.js";
import { type IDateDatasetsState } from "../date_datasets/date_datasets_state.js";
import {
    setFilterItems,
    setParameterItems,
    storeAttributeFilterConfigs,
} from "../filter_bar/filter_bar_helpers.js";
import { type IFilterBarState } from "../filter_bar/filter_bar_state.js";
import { FilterBar, type IAttributeFilter, type IDateFilter } from "../filter_bar/filter_bar_types.js";
import { type IItemCacheState } from "../item_cache/item_cache_state.js";
import { setSelectedInState } from "../measure_date_datasets/measure_date_datasets_helpers.js";
import {
    type IMeasureDateDatasetsState,
    measureDateDatasetsInitialState,
} from "../measure_date_datasets/measure_date_datasets_state.js";
import { type IPropertiesState } from "../properties/properties_state.js";
import { type IReferencePointState } from "../reference_point/reference_point_state.js";
import { type IVisualizationClassState } from "../visualization_classes/visualization_classes_state.js";

import { normalizeInsightProperties } from "./report_helpers.js";

/**
 * THE OPEN-REPORT OPERATION — the pure computation applied on OPEN_REPORT_FINISHED, over explicit
 * domain values. `sagas/open_report_sagas.ts` is the boundary: it selects the input, resolves the two
 * foreign lookups, calls this, and the OPEN_REPORT_FINISHED event carries the result — each owning
 * slice consumes its own value, in ONE dispatch.
 *
 * The CONDITIONAL writes are expressed as identity: `dateDatasets` answers the INPUT value by
 * reference when no date dataset is selected for the insight, so the slice's unconditional case is a
 * no-op there.
 */

export interface IOpenReportOperationInput {
    /** current `data.itemCache` — the loaded items SHALLOW-merge over it, as `Map.merge` did */
    itemCache: IItemCacheState;
    /** current `data.bucketsMeta` — the PRE-open value feeds the reference-point filter conversion */
    bucketsMeta: IBucketsMetaState;
    /** current `data.filterBar` — the loaded filter/parameter items land over it */
    filterBar: IFilterBarState;
    /** current `data.measuresDateDatasets` — the per-measure date-dataset selections land in it */
    measuresDateDatasets: IMeasureDateDatasetsState | undefined;
    /** current `data.dateDatasets` — answered BY REFERENCE when the insight selects no dataset */
    dateDatasets: IDateDatasetsState;
}

export interface IOpenReportOperationParams {
    insight: IInsight;
    loadedItems: ILoadedReportItems;
    /**
     * The class already resolved at the boundary (`useDefaultClass` picks the workspace default,
     * otherwise the insight's URL finds it) — resolved there because the default-class rule reads
     * the enabled-classes selector, a cross-domain fact this operation has no business owning.
     */
    visualizationClass: IVisualizationClassState;
}

export interface IOpenReportOperationDeps {
    /** `data.dateDatasetsMeta` lookup for the measure date filters' dataset identifiers */
    dateDatasetUriByIdentifier: (identifier: string) => string | undefined;
    /** fresh local identifier for a loaded metric date filter — the impurity stays at the boundary */
    generateFilterLocalIdentifier: () => string;
    /** the improved metric date filter: with it off, a metric keeps its first date filter only */
    keepFurtherMetricDateFilters: boolean;
}

export interface IOpenReportResult {
    buckets: IBucketsState;
    bucketsMeta: IBucketsMetaState;
    itemCache: IItemCacheState;
    filterBar: IFilterBarState;
    measuresDateDatasets: IMeasureDateDatasetsState;
    dateDatasets: IDateDatasetsState;
    visualizationClass: IVisualizationClassState;
    visualizationProperties: IPropertiesState;
    referencePoint: IReferencePointState;
}

function findDateDatasetByAttributeUri(
    dateDatasets: ReadonlyArray<IDateDataset>,
    attributeUri: string | undefined,
): IDateDataset | undefined {
    return dateDatasets.find((dataSet) =>
        dataSet.attributes.some((dataSetAttribute) => dataSetAttribute.uri === attributeUri),
    );
}

const isMeasureDateFilter = (filter: IBucketItemMetricFilter): boolean =>
    filter.attribute === DATE_DATASET_ATTRIBUTE;

const getMeasureFilters = (measure: IRawBucketItem): ReadonlyArray<IBucketItemMetricFilter> =>
    (measure.filters ?? []) as ReadonlyArray<IBucketItemMetricFilter>;

function findDateDatasetForMeasureDateFilter(
    measure: IRawBucketItem,
    dateDatasets: ReadonlyArray<IDateDataset>,
): IDateDataset | undefined {
    const dateFilter = getMeasureFilters(measure).find(isMeasureDateFilter);

    if (!dateFilter) {
        return undefined;
    }

    return dateDatasets.find((dataSet) => dataSet.identifier === dateFilter.dimension);
}

function isDateDatasetMatching(dateDataset: IDateDataset, dateFilterDatasetRef: ObjRef): boolean {
    return areObjRefsEqual(dateDataset.ref, dateFilterDatasetRef);
}

/**
 * The insight's selected date dataset: the date bucket item's attribute decides first, then the
 * insight's own date filter, then a measure's date filter.
 */
export function getSelectedDateDataset(
    buckets: IRawBuckets,
    filters: ReadonlyArray<ISdkFilter>,
    availableDateDatasets: ReadonlyArray<IDateDataset>,
): IDateDataset | undefined {
    const dateAttribute = buckets.reduce<IRawBucketItem | undefined>(
        (result, bucket) => result ?? (bucket.items ?? []).find((item) => item.type === DATE),
        undefined,
    );

    if (dateAttribute) {
        return findDateDatasetByAttributeUri(availableDateDatasets, dateAttribute.uri);
    }

    if (filters && filters.length > 0) {
        const dateFilter = filters.find(isSdkDateFilter);

        if (dateFilter) {
            const dateDataSetRef = filterObjRef(dateFilter);
            const selectedDateDataset = availableDateDatasets.find((candidate) =>
                isDateDatasetMatching(candidate, dateDataSetRef),
            );
            if (selectedDateDataset) {
                return selectedDateDataset;
            }
        }
    }

    const measureWithDateFilter = buckets.reduce<IRawBucketItem | undefined>(
        (result, bucket) =>
            result ??
            (bucket.items ?? [])
                .filter(isMeasure)
                .find((item) => getMeasureFilters(item).some(isMeasureDateFilter)),
        undefined,
    );

    if (measureWithDateFilter) {
        return findDateDatasetForMeasureDateFilter(measureWithDateFilter, availableDateDatasets);
    }

    return undefined;
}

/**
 * A loaded metric's date filters, made ready for the store. Without the improved metric date
 * filter every date filter after the first is dropped: the legacy UI knows one date filter per
 * metric, so a further one (saved with the flag on) would run with no chip to see or remove it;
 * saving then omits it, which is the accepted outcome. Every kept date filter gets a local
 * identifier, which a saved insight lacks and which is the ONLY thing telling two of them apart
 * (two may sit on one dataset with one period), the way the filter bar's date filters are told apart.
 */
function normalizeMetricDateFilters(
    buckets: IRawBuckets,
    { generateFilterLocalIdentifier, keepFurtherMetricDateFilters }: IOpenReportOperationDeps,
): IRawBuckets {
    return buckets.map((bucket) => {
        const items = (bucket.items ?? []).map((item) => {
            const filters = item?.filters as IBucketItemMetricFilter[] | undefined;
            if (!filters?.some(isMeasureDateFilter)) {
                return item;
            }
            let seenDateFilter = false;
            const normalized = filters.flatMap((filter): IBucketItemMetricFilter[] => {
                if (!isMeasureDateFilter(filter)) {
                    return [filter];
                }
                if (seenDateFilter && !keepFurtherMetricDateFilters) {
                    return [];
                }
                seenDateFilter = true;
                return [
                    filter.localIdentifier === undefined
                        ? { ...filter, localIdentifier: generateFilterLocalIdentifier() }
                        : filter,
                ];
            });
            const unchanged =
                normalized.length === filters.length &&
                normalized.every((filter, index) => filter === filters[index]);
            return unchanged ? item : { ...item, filters: normalized };
        });
        return items.every((item, index) => item === bucket.items?.[index]) ? bucket : { ...bucket, items };
    });
}

/**
 * The per-measure date-dataset selections the loaded measures' date filters imply — the measure's
 * filter carries the dataset IDENTIFIER, the meta lookup answers the URI the subtree stores. The
 * selection follows the PRIMARY (first) date filter only: a further one carries its own dataset,
 * and a primary whose dataset does not resolve leaves the selection to the default rule.
 */
function applySelectedMeasureDateDatasets(
    measuresDateDatasets: IMeasureDateDatasetsState,
    measures: ReadonlyArray<IRawBucketItem>,
    dateDatasetUriByIdentifier: IOpenReportOperationDeps["dateDatasetUriByIdentifier"],
): IMeasureDateDatasetsState {
    return measures.reduce((subtree, measure) => {
        const measureIdentifier = measure.localIdentifier;
        const primaryDimension = getMeasureFilters(measure).find(isMeasureDateFilter)?.dimension;
        if (measureIdentifier === undefined || primaryDimension === undefined) {
            return subtree;
        }
        return setSelectedInState(subtree, measureIdentifier, dateDatasetUriByIdentifier(primaryDimension));
    }, measuresDateDatasets);
}

export function applyOpenReport(
    input: IOpenReportOperationInput,
    params: IOpenReportOperationParams,
    deps: IOpenReportOperationDeps,
): IOpenReportResult {
    const { insight, loadedItems, visualizationClass } = params;
    const { itemCache, filterItems, allDateDatasets, availableDateDatasets, parameterFilters } = loadedItems;

    // ONE value for all three property writes: the properties state family and the
    // reference-point copies hold the same value
    const visualizationProperties = normalizeInsightProperties(insight) as IPropertiesState;

    // SHALLOW merge
    const updatedItemCache: IItemCacheState = { ...input.itemCache, ...itemCache };
    const converted = convertModelInsightToADRep(insight, true);

    const updatedMD = metadataToBuckets({
        metadataObject: converted.content,
        additionalData: {
            itemCache: updatedItemCache,
            filterItems,
            dateDatasets: allDateDatasets,
            properties: visualizationProperties,
        },
    });

    const selectedDateDataset = getSelectedDateDataset(
        updatedMD.buckets,
        insightFilters(insight),
        allDateDatasets.available,
    );

    // the modified map is rebuilt from the loaded filters
    const modified = updatedMD.filters
        .filter(
            (filter): filter is IAttributeFilter | IDateFilter =>
                FilterBar.isAttributeFilter(filter) || FilterBar.isDateFilter(filter),
        )
        .reduce<Record<string, boolean>>((acc, item) => ({ ...acc, [item.cacheItemIdentifier]: true }), {});

    // the expanded markers become PRESENT-undefined, which is what the readers
    // pair left them (time travel's restore is the path that DELETES them instead)
    const bucketsMeta: IBucketsMetaState = {
        ...input.bucketsMeta,
        modified,
        measureExpanded: undefined,
        attributeExpanded: undefined,
    };

    // conditional: no selected date dataset → the INPUT value by reference
    const dateDatasets: IDateDatasetsState = selectedDateDataset
        ? {
              ...input.dateDatasets,
              available: availableDateDatasets.available,
              unavailable: availableDateDatasets.unavailable,
          }
        : input.dateDatasets;

    // the composition is ordered (setFilterItems → setParameterItems → attributeFilterConfigs),
    // over the domain value instead of through the root adapters
    const filterBar = storeAttributeFilterConfigs(
        setParameterItems(setFilterItems(input.filterBar, updatedMD.filters), parameterFilters),
        converted.content.attributeFilterConfigs,
    );

    const stateBuckets = normalizeMetricDateFilters(updatedMD.buckets, deps);
    const measures = getMeasuresInBuckets(stateBuckets);

    const measuresDateDatasets = applySelectedMeasureDateDatasets(
        input.measuresDateDatasets ?? measureDateDatasetsInitialState,
        measures,
        deps.dateDatasetUriByIdentifier,
    );

    // the reference point is REPLACED wholesale, so the previous insight's
    // `setIn(REFERENCE_POINT, { firstRender: true })` + four RP_* writes composed to;
    // the filters conversion reads the PRE-open bucketsMeta
    const referencePoint: IReferencePointState = {
        firstRender: true,
        buckets: stateBuckets,
        filters: convertFiltersToRefPoint(updatedMD.filters, input.bucketsMeta),
        properties: visualizationProperties,
        reportNotFound: false,
    };

    return {
        buckets: stateBuckets,
        bucketsMeta,
        itemCache: updatedItemCache,
        filterBar,
        measuresDateDatasets,
        dateDatasets,
        visualizationClass,
        visualizationProperties,
        referencePoint,
    };
}
