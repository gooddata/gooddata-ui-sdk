// (C) 2007-2026 GoodData Corporation

import { createSelector } from "reselect";

import { getMasterLocalIdentifier } from "../models/bucket_item.js";
import { DecoratedDateDataset, type IDecoratedDateDataset } from "../models/decorated_date_dataset.js";
import {
    bucketsHaveCategoriesWithDateItem,
    getPrimaryDateDatasetRef,
    hasDateFilterInFilterBar,
} from "../services/buckets_service.js";
import { DateDatasetsMetaService } from "../services/date_datasets_meta_service.js";
import { DateDatasetsService } from "../services/date_datasets_service.js";
import { getDefaultSelectedDateDatasetUri } from "../store/measure_date_datasets/measure_date_datasets_helpers.js";
import { getMeasureDateDatasetStatus } from "../store/measure_date_datasets/measure_date_datasets_selectors.js";
import { type IMeasureDateDatasetsStatus } from "../store/measure_date_datasets/measure_date_datasets_state.js";
import { type IAppState } from "../store/types.js";
import { type IDecoratedBucketItem, type IRawBucketItem } from "../typings/buckets.js";

import { getProjectTimezoneOffset } from "./bootstrap_selector.js";
import { getAllMeasures } from "./buckets_selector.js";
import { getDateDatasetRefsWithGranularities } from "./date_dataset_with_granularities_selector.js";
import { getLocalizedDateFormat } from "./date_filter_selector.js";
import { enableUnavailableItemsVisibility, getActiveCalendars } from "./feature_flag_selector.js";
import { getFormatLocaleObject } from "./measure_bucket_item_header_selector.js";

function getBucketItemDateDatasetStatus(
    state: IAppState,
    props: { bucketItem: IDecoratedBucketItem },
): IMeasureDateDatasetsStatus {
    const localIdentifier = props.bucketItem.localIdentifier;
    return getMeasureDateDatasetStatus(state, localIdentifier);
}

export interface IMeasureDateFilterSelectorProps {
    bucketItem: IDecoratedBucketItem;
    /**
     * The date dataset of a metric's further (non-primary) date filter; the primary one follows the
     * measure-level selection.
     */
    ownDateDatasetIdentifier?: string;
    /**
     * False for a further date filter (or the "Filter by date" adding one): it never follows the
     * measure-level selection, which belongs to the primary date filter.
     */
    isPrimaryDateFilter?: boolean;
}

function getSelectedDateDataset(
    state: IAppState,
    props: IMeasureDateFilterSelectorProps,
): IDecoratedDateDataset {
    const localIdentifier = props.bucketItem.localIdentifier;
    const status = getMeasureDateDatasetStatus(state, localIdentifier);

    // a further date filter names its own dataset; only the primary one follows the measure selection
    const isPrimaryDateFilter = props.isPrimaryDateFilter ?? true;
    const selectedDateDatasetUri =
        props.ownDateDatasetIdentifier === undefined
            ? isPrimaryDateFilter
                ? status.selectedDateDatasetUri
                : undefined
            : status.availableDateDatasets.find(
                  (dateDataset) => dateDataset.identifier === props.ownDateDatasetIdentifier,
              )?.uri;
    // the two "does the insight use dates" reads and the primary-date-dataset resolution belong to
    // the buckets domain; the default-selection RULE is the measure-date-datasets helper
    const defaultSelectedDateDatasetUri = getDefaultSelectedDateDatasetUri(status.availableDateDatasets, {
        hasDateInBuckets: bucketsHaveCategoriesWithDateItem(state),
        hasDateFilter: hasDateFilterInFilterBar(state),
        primaryDateDatasetRef: getPrimaryDateDatasetRef(state),
    });
    const dateDatasetsMeta = DateDatasetsMetaService.getDateDatasetsMeta(state);

    const selectedDateDatasetMetaItem = dateDatasetsMeta.items.find(
        (dateDataset) =>
            dateDataset.uri === selectedDateDatasetUri ||
            (props.ownDateDatasetIdentifier !== undefined &&
                dateDataset.identifier === props.ownDateDatasetIdentifier),
    );
    const defaultDateDatasetMetaItem = dateDatasetsMeta.items.find(
        (dateDataset) => dateDataset.uri === defaultSelectedDateDatasetUri,
    );

    const dateDatasetMetaItem = selectedDateDatasetMetaItem || defaultDateDatasetMetaItem;
    // Neither lookup has to find anything, so the absence check must come BEFORE any `.uri`
    // check — which is itself the evidence that absence was expected. It needs the measure's
    // availability to be NON-EMPTY (an empty array never invokes the predicate) and the
    // date-datasets meta not to carry the dataset that availability names — the two are loaded by
    // different requests, so they can disagree.
    if (!dateDatasetMetaItem) {
        return null;
    }

    const isAvailableDateDataset = status.availableDateDatasets.find(
        (dateDataset) => dateDataset.uri === dateDatasetMetaItem.uri,
    )?.isAvailable;

    return DecoratedDateDataset.createFromMetaItem(dateDatasetMetaItem, isAvailableDateDataset);
}

/** whether a derived (over-time) measure hangs off the metric, which then cannot be filtered by date */
export function measureHasDerived(state: IAppState, props: { bucketItem: IDecoratedBucketItem }): boolean {
    const localIdentifier = props.bucketItem.localIdentifier;
    const allMeasures = getAllMeasures(state);
    return allMeasures.some(
        (measure: IRawBucketItem) => getMasterLocalIdentifier(measure) === localIdentifier,
    );
}

export const measureDateFilterSelector = createSelector(
    getProjectTimezoneOffset,
    getSelectedDateDataset,
    getBucketItemDateDatasetStatus,
    getLocalizedDateFormat,
    measureHasDerived,
    DateDatasetsService.isDateDatasetsDropdownLoaded,
    getFormatLocaleObject,
    enableUnavailableItemsVisibility,
    getActiveCalendars,
    getDateDatasetRefsWithGranularities,
    (
        projectTimezoneOffset,
        selectedDateDataset,
        measureDateDatasetsStatus,
        dateFormat,
        hasDerived,
        isDateDatasetsDropdownLoaded,
        formatLocaleObj,
        enableUnavailableItemsVisibility,
        activeCalendars,
        dateDatasetRefsWithGranularities,
    ) => {
        const dateDatasetsList: IDecoratedDateDataset[] = measureDateDatasetsStatus.availableDateDatasets.map(
            (dataset) => DecoratedDateDataset.createDecorated(dataset),
        );
        return {
            projectTimezoneOffset,
            selectedDateDataset,
            dateDatasetsList,
            dateDatasetsUnavailableCount: measureDateDatasetsStatus.unavailableDateDatasetsCount,
            dateDatasetsIsLoading: measureDateDatasetsStatus.isLoading,
            dateFormat,
            isDisabled: hasDerived,
            isDateDatasetsDropdownLoaded,
            enableUnavailableItemsVisibility,
            activeCalendars,
            dateDatasetRefsWithGranularities,
            ...formatLocaleObj,
        };
    },
);
