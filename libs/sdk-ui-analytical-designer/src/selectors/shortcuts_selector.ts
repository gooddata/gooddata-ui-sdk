// (C) 2007-2026 GoodData Corporation

import { createSelector } from "reselect";

import { visClassUrl } from "@gooddata/sdk-model";

import { ATTRIBUTE, DATE, FACT, METRIC } from "../constants/bucket.js";
import { LOCAL_COLUMN, LOCAL_TABLE } from "../constants/visualization_types.js";
import { getBuckets } from "../services/buckets_service.js";
import { getAvailableDateDatasets } from "../store/date_datasets/date_datasets_selectors.js";
import { getDraggedCatalogItem } from "../store/drag_and_drop/dnd_selectors.js";
import { type IAppState } from "../store/types.js";
import { getVisualizationClassesState } from "../store/visualization_classes/visualization_classes_selectors.js";
import { type IRawBucket, type IRawBucketItem } from "../typings/buckets.js";
import { type ICatalogEntry } from "../typings/state_objects.js";

import { shortcutMetricOverTimeSelector } from "./shortcut_metric_over_time_selector.js";

const isMetricOverTimeDisabledSelector = (state: IAppState) => {
    const { availableDateDatasets, areDateDatasetsLoaded } = shortcutMetricOverTimeSelector(state);

    return !availableDateDatasets.length && areDateDatasetsLoaded;
};

export const isReportEmptySelector = (state: IAppState) =>
    getBuckets(state).every((bucket: IRawBucket) => !bucket.items?.length);

// the two readers below go through the domain accessors, not the raw paths: both subtrees are
// slice-owned and are absent on the pristine state RESET_FOR_PLUGGABLE_MOUNT returns
const isColumnChartDeprecated = (state: IAppState) =>
    !getVisualizationClassesState(state).find(
        (visualizationClass) => visClassUrl(visualizationClass) === LOCAL_COLUMN,
    );

const isTableDeprecated = (state: IAppState) =>
    !getVisualizationClassesState(state).find(
        (visualizationClass) => visClassUrl(visualizationClass) === LOCAL_TABLE,
    );

const isOfType = (activeDragItem: IRawBucketItem, type: string) =>
    !!activeDragItem && activeDragItem.type === type;

const isAttributeSelector = createSelector(
    getDraggedCatalogItem,

    (activeDragItem) => isOfType(activeDragItem, ATTRIBUTE),
);

const isDateSelector = createSelector(
    getDraggedCatalogItem,

    (activeDragItem) => isOfType(activeDragItem, DATE),
);

// ICatalogEntry, not IRawBucketItem: the dropped item is the DRAGGED catalog item parked while
// the shortcut's date datasets load (shortcut_sagas). Null until a drop parks one.
export const getDroppedCatalogItem = (state: IAppState): ICatalogEntry | null =>
    state.data.shortcut.shortcutDroppedItem ?? null;

const isMetricSelector = createSelector(
    getDraggedCatalogItem,
    getDroppedCatalogItem,

    (activeDragItem, droppedCatalogItem) =>
        isOfType(activeDragItem, METRIC) || isOfType(activeDragItem, FACT) || !!droppedCatalogItem,
);

export const displayAttributeSelector = createSelector(
    isReportEmptySelector,
    isAttributeSelector,
    isDateSelector,
    isTableDeprecated,

    (isEmpty, isAttribute, isDate, tableDeprecated) => isEmpty && (isAttribute || isDate) && !tableDeprecated,
);

export const displayMetricSelector = createSelector(
    isReportEmptySelector,
    isMetricSelector,
    isColumnChartDeprecated,

    (isEmpty, isMeasure, columnDeprecated) => isEmpty && isMeasure && !columnDeprecated,
);

export const displayMetricOverTimeSelector = createSelector(
    isReportEmptySelector,
    isMetricSelector,
    getAvailableDateDatasets,
    isColumnChartDeprecated,

    (isEmpty, isMeasure, availableDateDatasets, columnDeprecated) =>
        isEmpty && isMeasure && availableDateDatasets.length > 0 && !columnDeprecated,
);

export const displayBlockSelector = createSelector(
    displayAttributeSelector,
    displayMetricSelector,
    getDroppedCatalogItem,

    (displayAttribute, displayMetric, droppedCatalogItem) =>
        (displayAttribute || displayMetric) && !droppedCatalogItem,
);

export const shortcutsSelector = createSelector(
    getDraggedCatalogItem,
    displayBlockSelector,
    displayAttributeSelector,
    displayMetricSelector,
    displayMetricOverTimeSelector,
    isMetricOverTimeDisabledSelector,
    (
        activeDragItem,
        displayBlock,
        displayAttribute,
        displayMetric,
        displayMetricOverTime,
        isMetricOverTimeDisabled,
    ) => ({
        activeDragItem,
        displayBlock,
        displayAttribute,
        displayMetric,
        displayMetricOverTime,
        isMetricOverTimeDisabled,
    }),
);
