// (C) 2026 GoodData Corporation

import { type ILowerBoundedFilter, type IUpperBoundedFilter, type ObjRef } from "@gooddata/sdk-model";

import { INITIAL_MODEL as BUCKET_INITIAL_MODEL } from "../../models/bucket_item.js";
import { type IRawBuckets } from "../../typings/buckets.js";
import { type IStoredVisualizationProperties } from "../../typings/properties.js";
import {
    type EmptyDateValuesFilterMode,
    type IAttributeElement,
    type IDateFilterConfig,
    type MeasureValueFilterCondition,
    type TextModeFilterData,
} from "../filter_bar/filter_bar_types.js";

/**
 * `data.referencePoint` — the pluggable-visualization INPUT. `buckets` holds the live buckets BY
 * REFERENCE, `filters` is the filters bucket rebuilt from the filter bar on every buckets mutation,
 * `properties` mirrors the visualization properties, and `firstRender` is the one-shot flag
 * open-report sets and the first extended-reference-point answer consumes.
 */

/** One entry of the reference point's `filters` bucket — see services/reference_point_service.ts. */
export interface IRefPointFilterItem {
    localIdentifier: string;
    /** the filter was created by AD (not by the user) and has not been modified since */
    autoCreated: boolean;
    /** the cache-item identifier of the filtered attribute / date dataset attribute */
    attribute?: string;
    dateDatasetRef?: ObjRef;
    applyOnResult?: boolean;
    strictLimitOfRows?: boolean;
    filters: IRefPointFilterDetail[];
}

export type IRefPointFilterDetail =
    | IRefPointDateFilterDetail
    | IRefPointAttributeFilterDetail
    | IRefPointMeasureValueFilterDetail
    | IRefPointRankingFilterDetail;

export interface IRefPointDateFilterDetail {
    attribute: string;
    /** the date filter's configuration, or the `all_time` marker when there is none */
    interval: IDateFilterConfig | { name: string };
    overTimeComparisonType?: string;
    emptyDateValuesFilter?: EmptyDateValuesFilterMode;
    boundedFilter?: IUpperBoundedFilter | ILowerBoundedFilter;
}

export interface IRefPointAttributeFilterDetail {
    attribute: string;
    displayFormRef?: ObjRef;
    /** always empty — the elements travel in `selectedElements` */
    allElements: ReadonlyArray<IAttributeElement>;
    selectedElements: ReadonlyArray<IAttributeElement>;
    isInverted: boolean;
    totalElementsCount: number;
    textModeFilter?: TextModeFilterData;
}

export interface IRefPointMeasureValueFilterDetail {
    measureLocalIdentifier?: string;
    measureRef?: ObjRef;
    conditions?: MeasureValueFilterCondition[];
    dimensionality?: ReadonlyArray<string | ObjRef>;
}

export interface IRefPointRankingFilterDetail {
    measure?: string;
    measureRef?: ObjRef;
    attributes?: ReadonlyArray<string | ObjRef>;
    operator?: string;
    value?: number;
}

export interface IRefPointFiltersBucket {
    localIdentifier: "filters";
    items: IRefPointFilterItem[];
}

export interface IReferencePointState {
    buckets: IRawBuckets;
    filters?: IRefPointFiltersBucket;
    properties?: IStoredVisualizationProperties;
    dateDataSet?: { uri: string | null };
    reportNotFound?: boolean;
    /**
     * Set by open-report, DELETED by the first extended-reference-point answer — the one-shot
     * "the plug viz has not answered yet" marker (store/buckets/buckets_apply_reducer.ts).
     */
    firstRender?: boolean;
}

/**
 * The reference point's pristine seed. Frozen because its identity is shared across store instances,
 * so an accidental in-place write would leak between them (the same treatment
 * `models/bucket_item.ts#INITIAL_MODEL` gets). The `buckets` leaf holds the same `INITIAL_MODEL`
 * identity the buckets slice self-initializes with, so both init paths agree.
 */
export const referencePointInitialState: IReferencePointState = Object.freeze({
    buckets: BUCKET_INITIAL_MODEL,
    filters: Object.freeze({
        localIdentifier: "filters" as const,
        items: Object.freeze([]) as unknown as IRefPointFilterItem[],
    }) as IRefPointFiltersBucket,
    dateDataSet: Object.freeze({ uri: null }),
    reportNotFound: false,
    properties: Object.freeze({}) as IStoredVisualizationProperties,
});
