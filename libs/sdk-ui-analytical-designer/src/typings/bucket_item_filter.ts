// (C) 2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";
import { type OverTimeComparisonType } from "@gooddata/sdk-ui";

import {
    type EmptyDateValuesFilterMode,
    type TextModeFilterData,
} from "../store/filter_bar/filter_bar_types.js";

/**
 * ONE STORED bucket-item metric filter — the shape the `metricAttributeFilter()` factory
 * builds and `data.buckets[i].items[j].filters[k]` holds. It is NOT the decorated shape
 * (typings/measure_filters.ts): the decoration resolves `attribute` into a catalog entry for the
 * UI, while the stored record keeps the cache identifier string. Every field is optional, because
 * the factory's base fills the gaps and the metric-filter dialogs dispatch partial records —
 * including the two over-time riders.
 *
 * Lives in its own leaf module (not measure_filters.ts) because the decorated filter MODELS type
 * their `original` against it — importing it from measure_filters.ts, which imports those models,
 * would close a cycle.
 */
export interface IBucketItemMetricFilter {
    /** the filtered attribute's cache identifier — `DATE_DATASET_ATTRIBUTE` for the date filter */
    attribute?: string | null;
    localIdentifier?: string;
    displayFormRef?: ObjRef;
    /** the display form the filter config says the filter must be SHOWN as (see withDisplayAsDisplayForm) */
    displayAsDisplayFormRef?: ObjRef;
    /** MAQL expression carried by an expression-defined metric filter */
    expression?: string;
    /** the date metric filter's interval (`attribute === DATE_DATASET_ATTRIBUTE` only) */
    interval?: unknown;
    /** the date metric filter's dataset IDENTIFIER (`attribute === DATE_DATASET_ATTRIBUTE` only) */
    dimension?: string;
    /**
     * the date metric filter's empty date values mode (`attribute === DATE_DATASET_ATTRIBUTE` only), stored
     * as the date filter's `emptyValueHandling` like the filter bar's
     */
    emptyDateValuesFilter?: EmptyDateValuesFilterMode;
    allElements?: ReadonlyArray<unknown>;
    selectedElements?: ReadonlyArray<unknown>;
    isInverted?: boolean;
    totalElementsCount?: number;
    noData?: boolean;
    textModeFilter?: TextModeFilterData | null;
    overTimeComparisonType?: OverTimeComparisonType;
    overTimeComparisonMeasures?: string[];
}
