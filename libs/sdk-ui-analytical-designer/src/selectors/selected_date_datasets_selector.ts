// (C) 2007-2026 GoodData Corporation

import { createSelector } from "reselect";

import {
    type IDecoratedDateDatasets,
    type ISelectedDateDatasets,
    decoratedDateDatasets,
} from "../models/date_dataset.js";
import { type IDateDatasetsMeta } from "../models/date_datasets_meta.js";
import {
    type IDateDatasetsMetaItem,
    type IMeasureDateDatasetsMetaItems,
} from "../models/date_datasets_meta_item.js";
import { getBuckets, getUsedDateDatasetsExtendedFromBuckets } from "../services/buckets_service.js";
import { DateDatasetsMetaService } from "../services/date_datasets_meta_service.js";
import { DateDatasetsService } from "../services/date_datasets_service.js";
import { getFilterItemsExtended } from "../store/filter_bar/filter_bar_selector.js";
import { getMeasureDateDatasetsState } from "../store/measure_date_datasets/measure_date_datasets_selectors.js";
import { type IMeasureDateDatasetsState } from "../store/measure_date_datasets/measure_date_datasets_state.js";
import { DateDatasetStatusUtils } from "../utils/date_dataset_status.js";
import { DateDatasetsMetaUtils } from "../utils/date_datasets_meta.js";

import { getBucketsExtended } from "./extended_reference_point_selector.js";
import { enableUnavailableItemsVisibility } from "./feature_flag_selector.js";

function mapMeasuresToDateDatasetMeta(
    allMeasuresDataDatasetStates: IMeasureDateDatasetsState,
    allExistingDateDatasetMetas: IDateDatasetsMeta,
): IMeasureDateDatasetsMetaItems {
    const mappedPairs = Object.entries(allMeasuresDataDatasetStates)
        .filter((pair) => DateDatasetStatusUtils.hasSelectedDateDataset(pair[1]))
        .map<[string, IDateDatasetsMetaItem]>((pair) => [
            pair[0],
            DateDatasetsMetaUtils.findDateDatasetMetaByUri(
                pair[1].selectedDateDatasetUri,
                allExistingDateDatasetMetas.items,
            ),
        ]);

    return new Map(mappedPairs);
}

/**
 * Selector that returns a list of decorated date datasets meta objects mapped to the local identifier of the
 * measures currently placed in the buckets that have date filter set.
 */
const getMeasuresDateDatasetsSelector = createSelector(
    DateDatasetsMetaService.getDateDatasetsMeta,
    getMeasureDateDatasetsState,
    (allExistingDateDatasetMetas, allMeasuresDataDatasetStates) =>
        mapMeasuresToDateDatasetMeta(allMeasuresDataDatasetStates, allExistingDateDatasetMetas),
);

export const getUsedDateDatasetsExtendedSelector = createSelector(
    getBuckets,
    getBucketsExtended,
    getFilterItemsExtended,
    DateDatasetsService.getAvailableDateDatasets,
    DateDatasetsMetaService.getDateDatasetsMeta,
    (buckets, bucketsExt, filters, available, metas) =>
        getUsedDateDatasetsExtendedFromBuckets(buckets, bucketsExt, filters, available, metas),
);

const getDateDatasetsFromMetaSelector = createSelector(
    DateDatasetsMetaService.getDateDatasetsMeta,
    DateDatasetsService.getAvailableDateDatasets,
    (dateDatasetsMeta, availables) =>
        DateDatasetsService.getDateDatasetsFromMetaInfo(dateDatasetsMeta, availables),
);

/**
 * Selector that obtains used and available date datasets from the app state and decorates them.
 */

const getDecoratedDateDatasets = createSelector(
    getUsedDateDatasetsExtendedSelector,
    DateDatasetsService.getAvailableDateDatasets,
    getDateDatasetsFromMetaSelector,
    enableUnavailableItemsVisibility,
    (usedDateDatasets, availableDateDatasets, allDateDatasets, enableUnavailableItemsVisibility) => {
        return decoratedDateDatasets({
            ...usedDateDatasets,
            available: enableUnavailableItemsVisibility ? allDateDatasets : availableDateDatasets,
        });
    },
);

/**
 * Selector with decorated date datasets selected on global and measure level.
 */
export const selectedDateDatasetsSelector = createSelector(
    getDecoratedDateDatasets,
    getMeasuresDateDatasetsSelector,
    DateDatasetsMetaService.getDateDatasetsMetaItems,
    (
        globalDateDatasets: IDecoratedDateDatasets,
        measureDateDatasets: IMeasureDateDatasetsMetaItems,
        dateDatasetsMeta,
    ): ISelectedDateDatasets => ({
        measureDateDatasets,
        globalDateDatasets,
        dateDatasetsMeta,
    }),
);
