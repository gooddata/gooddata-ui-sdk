// (C) 2026 GoodData Corporation

import { type ICatalogAttribute, type IVisualizationClass } from "@gooddata/sdk-model";
import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { VIEW } from "../../constants/bucket.js";
import {
    LAST_4_FISCAL_QUARTERS,
    LAST_4_QUARTERS,
    THIS_FISCAL_MONTH,
    THIS_FISCAL_QUARTER,
    THIS_MONTH,
    THIS_QUARTER,
} from "../../constants/presets.js";
import { getLocalIdentifier } from "../../models/bucket_item.js";
import { createDateItem } from "../../models/date_item.js";
import { GRANULARITY, type Granularity } from "../../models/granularity.js";
import { getDateFilterConfigFromPreset } from "../../models/preset_item.js";
import { type IRawBuckets } from "../../typings/buckets.js";
import { type IDateDataset } from "../../typings/datasets.js";
import { type ICatalogEntry } from "../../typings/state_objects.js";
import { type IBucketNotificationsState } from "../bucket_notifications/bucket_notifications_types.js";
import {
    type IAddBucketItemDeps,
    type IAddBucketItemInput,
    addBucketItemFromCatalog,
} from "../buckets/buckets_add_operation.js";
import { getPrimaryDateDatasetRefInBuckets } from "../buckets/buckets_date_helpers.js";
import {
    type IBucketItemEditDeps,
    changeBucketsDateDataset,
    editBucketItem,
    selectVisualizationType,
} from "../buckets/buckets_edit_operations.js";
import { type IBucketsMetaState } from "../buckets/buckets_meta_state.js";
import {
    getDateBucketItemsInBucket,
    getFirstMasterMeasureInBuckets,
    hasDateBucketItemInBuckets,
} from "../buckets/buckets_read_helpers.js";
import { type IRemoveBucketItemsDeps } from "../buckets/buckets_removal_helpers.js";
import { setBucketItemOverTimeComparison } from "../buckets/over_time_comparison_helpers.js";
import { type IPluggableVisualizationState } from "../buckets/pluggable_visualization_state.js";
import { type IConfigurationPanelState } from "../configuration_panel/configuration_panel_state.js";
import {
    createDateFilterIfDoesntExist,
    findFirstDateFilter,
    updateDateFilter,
} from "../filter_bar/filter_bar_helpers.js";
import { type IFilterBarState } from "../filter_bar/filter_bar_state.js";
import { type IExtendedReferencePointState } from "../reference_point/extended_reference_point_state.js";
import { type IReferencePointState } from "../reference_point/reference_point_state.js";
import {
    type IReferencePointSyncDeps,
    syncReferencePointForBuckets,
} from "../reference_point/reference_point_sync.js";
import { type IVisualizationClassState } from "../visualization_classes/visualization_classes_state.js";

/**
 * THE RECOMMENDATION OPERATION — ONE operation with five parameterizations. The discriminant is the
 * recommendation, the payload is what it produced, and the five branches COMPOSE the buckets
 * operations (`addBucketItemFromCatalog`, `editBucketItem`, `changeBucketsDateDataset`,
 * `selectVisualizationType`) on values.
 *
 * Each step reads the values the previous step returned. The boundary facts (the catalog attribute,
 * the bar visualization class, the first available date dataset, the uiConfig answers for the VIEW
 * bucket) are resolved by the saga from the state AS IT WAS ON ENTRY. The one exception is the
 * primary date dataset ref, which TRENDING re-resolves AFTER planting a date item, so it is computed
 * in here over the current values.
 */

const GRANULARITY_COMPARE_PRESET_MAPPING: Record<string, string> = {
    [GRANULARITY.MONTH]: THIS_MONTH,
    [GRANULARITY.QUARTER]: THIS_QUARTER,
    [GRANULARITY.FISCAL_MONTH]: THIS_FISCAL_MONTH,
    [GRANULARITY.FISCAL_QUARTER]: THIS_FISCAL_QUARTER,
};

const GRANULARITY_TRENDING_PRESET_MAPPING: Record<string, string> = {
    [GRANULARITY.QUARTER]: LAST_4_QUARTERS,
    [GRANULARITY.MONTH]: LAST_4_QUARTERS,
    [GRANULARITY.FISCAL_QUARTER]: LAST_4_FISCAL_QUARTERS,
    [GRANULARITY.FISCAL_MONTH]: LAST_4_FISCAL_QUARTERS,
};

/** The union of every domain a branch can decide — the add operation's nine plus the class. */
export interface IRecommendationApplyInput extends IAddBucketItemInput {
    visualizationClass: IVisualizationClassState;
}

/**
 * WHICH recommendation — one operation with five parameterizations, not five operations:
 * the commit shape is identical and the recommendation is the discriminant. `comparison` carries
 * the RESOLVED catalog item — the lookup is a boundary read, and an unknown attribute means the
 * saga commits nothing at all.
 */
export type RecommendationApplyParams =
    | { recommendation: "comparisonWithPeriod"; granularity: Granularity }
    | { recommendation: "contributionInPercents" }
    | { recommendation: "metricWithPeriod" }
    | { recommendation: "trending"; granularity: Granularity }
    | { recommendation: "comparison"; catalogItem: ICatalogAttribute };

export interface IRecommendationApplyDeps extends IRemoveBucketItemsDeps, IReferencePointSyncDeps {
    /** the add composition's foreign facts, resolved for the VIEW bucket on entry */
    addToView: IAddBucketItemDeps;
    /** the edit composition's foreign facts (showInPercent's format rule, the date branches) */
    edit: IBucketItemEditDeps;
    /** what `getPrimaryDateDatasetRef` reads besides the buckets and the filter items */
    firstAvailableDateDataset: IDateDataset | undefined;
    /** the workspace's `local:bar` class, or `undefined` — the guard against blanking the selection */
    barVisualizationClass: IVisualizationClass | undefined;
}

export interface IRecommendationApplyResult {
    recommendation: RecommendationApplyParams["recommendation"];
    buckets: IRawBuckets;
    bucketsMeta: IBucketsMetaState;
    configurationPanel: IConfigurationPanelState;
    filterBar: IFilterBarState;
    bucketNotifications: IBucketNotificationsState;
    extendedReferencePoint: IExtendedReferencePointState | undefined;
    pluggableVisualization: IPluggableVisualizationState | undefined;
    referencePoint: IReferencePointState | undefined;
    isVisualizationMdObjectValid: boolean;
    visualizationClass: IVisualizationClassState;
}

/** The working values a branch threads through its steps — the operation's INPUT, never the root. */
type WorkingValues = IRecommendationApplyInput;

export function applyRecommendation(
    input: IRecommendationApplyInput,
    params: RecommendationApplyParams,
    deps: IRecommendationApplyDeps,
): IRecommendationApplyResult {
    switch (params.recommendation) {
        case "comparisonWithPeriod":
            return finishWithSync(applyComparisonWithPeriod(input, params.granularity, deps), params, deps);
        case "contributionInPercents":
            return finishWithSync(applyContributionInPercents(input, deps), params, deps);
        case "metricWithPeriod":
            return finishWithSync(applyMetricWithPeriod(input, deps), params, deps);
        case "trending":
            return finishWithSync(applyTrending(input, params.granularity, deps), params, deps);
        case "comparison":
            return finishWithSync(applyComparison(input, params.catalogItem, deps), params, deps);
    }
}

/**
 * The tail every branch ends with: re-sync the reference point over the values the branch PRODUCED
 * (the resolver form — several branches rewrite the filter bar on their way through) and invalidate
 * the metadata object.
 */
function finishWithSync(
    values: WorkingValues,
    params: RecommendationApplyParams,
    deps: IRecommendationApplyDeps,
): IRecommendationApplyResult {
    return {
        recommendation: params.recommendation,
        ...values,
        referencePoint: syncReferencePointForBuckets(
            values.referencePoint,
            values.buckets,
            values.filterBar,
            values.bucketsMeta,
            deps,
        ),
        isVisualizationMdObjectValid: false,
    };
}

/** SAME_PERIOD_PREVIOUS_YEAR over the primary date dataset, with the granularity's preset. */
function applyComparisonWithPeriod(
    input: WorkingValues,
    granularity: Granularity,
    deps: IRecommendationApplyDeps,
): WorkingValues {
    const dateDatasetRef = getPrimaryDateDatasetRefInBuckets(
        input.buckets,
        input.filterBar.items,
        deps.firstAvailableDateDataset,
    );

    let filterBar = createDateFilterIfDoesntExist(input.filterBar, dateDatasetRef);
    const firstDateFilter = findFirstDateFilter(filterBar);
    filterBar = updateDateFilter(filterBar, {
        localIdentifier: firstDateFilter.localIdentifier,
        filterConfig: getDateFilterConfigFromPreset(GRANULARITY_COMPARE_PRESET_MAPPING[granularity]),
        overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
        dateDatasetRef,
    });

    return setOverTimeComparisonForFirstMasterMeasure({ ...input, filterBar }, deps);
}

/** The first master measure switches to percent and the chart flips to `local:bar` when it exists. */
function applyContributionInPercents(input: WorkingValues, deps: IRecommendationApplyDeps): WorkingValues {
    const metric = getFirstMasterMeasureInBuckets(input.buckets);

    // the edit's own reference-point sync and md-flag land mid-operation; the final tail overwrites
    // both with the branch's end state
    const edit = editBucketItem(
        { buckets: input.buckets, referencePoint: input.referencePoint },
        { kind: "showInPercent", localIdentifier: getLocalIdentifier(metric), value: true },
        deps.edit,
    );
    let values: WorkingValues = edit
        ? { ...input, buckets: edit.buckets, referencePoint: edit.referencePoint }
        : input;

    // guarded: with no local:bar class in the workspace the find yields undefined, and an unguarded
    // write would blank the selected class
    if (deps.barVisualizationClass) {
        const selection = selectVisualizationType(deps.barVisualizationClass);
        values = {
            ...values,
            visualizationClass: selection.visualizationClass,
            extendedReferencePoint: selection.extendedReferencePoint,
        };
    }

    return values;
}

/** SAME_PERIOD_PREVIOUS_YEAR over the EXISTING first date filter — unguarded when there is none. */
function applyMetricWithPeriod(input: WorkingValues, deps: IRecommendationApplyDeps): WorkingValues {
    const dateFilter = findFirstDateFilter(input.filterBar);

    const filterBar = updateDateFilter(input.filterBar, {
        localIdentifier: dateFilter.localIdentifier,
        filterConfig: dateFilter.filterConfig,
        overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
        dateDatasetRef: dateFilter.dateDatasetRef,
    });

    return setOverTimeComparisonForFirstMasterMeasure({ ...input, filterBar }, deps);
}

/** A date item lands in VIEW at the asked granularity and the date filter takes the trending preset. */
function applyTrending(
    input: WorkingValues,
    granularity: Granularity,
    deps: IRecommendationApplyDeps,
): WorkingValues {
    let values = ensureDateBucketItemInView(input, deps);
    values = setViewGranularity(values, granularity, deps);

    // RE-RESOLVED over the values as they stand — the date item just planted decides the primary ref
    const dateDatasetRef = getPrimaryDateDatasetRefInBuckets(
        values.buckets,
        values.filterBar.items,
        deps.firstAvailableDateDataset,
    );

    let filterBar = createDateFilterIfDoesntExist(values.filterBar, dateDatasetRef);
    const firstDateFilter = findFirstDateFilter(filterBar);
    filterBar = updateDateFilter(filterBar, {
        localIdentifier: firstDateFilter.localIdentifier,
        filterConfig: getDateFilterConfigFromPreset(
            GRANULARITY_TRENDING_PRESET_MAPPING[granularity] ?? LAST_4_QUARTERS,
        ),
        overTimeComparisonType: OverTimeComparisonTypes.NOTHING,
        dateDatasetRef,
    });

    return { ...values, filterBar };
}

/** The resolved catalog attribute joins the VIEW bucket — the add operation, on values. */
function applyComparison(
    input: WorkingValues,
    catalogItem: ICatalogAttribute,
    deps: IRecommendationApplyDeps,
): WorkingValues {
    // the cast carries an inert rider: the spread brings the catalog attribute's own `attribute`
    // object along, which `buildBucketItemFromCatalogItem` never reads (it renames `identifier` to
    // `attribute` itself)
    const added = addBucketItemFromCatalog(
        input,
        {
            bucketLocalIdentifier: VIEW,
            catalogItem: {
                ...catalogItem,
                identifier: catalogItem.attribute.id,
                dfRef: catalogItem.defaultDisplayForm.ref,
            } as unknown as ICatalogEntry,
            bucketPosition: -1,
        },
        deps.addToView,
    );

    return { ...input, ...added };
}

// --- the composed steps ------------------------------------------------------------------------------

/** `setBucketItemOverTimeComparison(firstMasterMeasure, true, SAME_PERIOD_PREVIOUS_YEAR)`. */
function setOverTimeComparisonForFirstMasterMeasure(
    values: WorkingValues,
    deps: IRecommendationApplyDeps,
): WorkingValues {
    const comparison = setBucketItemOverTimeComparison(
        values,
        {
            measure: getFirstMasterMeasureInBuckets(values.buckets),
            isEnabled: true,
            targetType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
        },
        deps,
    );

    return { ...values, ...comparison };
}

/**
 * When ANY bucket already holds a date item, the VIEW bucket's first date item (possibly
 * `undefined` — that mismatch is deliberate) is re-pointed at the primary date dataset; otherwise a
 * fresh date item is added to VIEW.
 */
function ensureDateBucketItemInView(values: WorkingValues, deps: IRecommendationApplyDeps): WorkingValues {
    const dateDatasetRef = getPrimaryDateDatasetRefInBuckets(
        values.buckets,
        values.filterBar.items,
        deps.firstAvailableDateDataset,
    );

    if (hasDateBucketItemInBuckets(values.buckets)) {
        const [firstDateItem] = getDateBucketItemsInBucket(values.buckets, VIEW);
        const change = changeBucketsDateDataset(
            { buckets: values.buckets, referencePoint: values.referencePoint },
            { dateDatasetRef, bucketItemLocalIdentifier: firstDateItem?.localIdentifier },
            deps.edit,
        );
        return {
            ...values,
            buckets: change.buckets,
            referencePoint: change.referencePoint,
            isVisualizationMdObjectValid: change.isVisualizationMdObjectValid,
        };
    }

    const added = addBucketItemFromCatalog(
        values,
        {
            bucketLocalIdentifier: VIEW,
            catalogItem: createDateItem({ dateDatasetRef }) as unknown as ICatalogEntry,
            bucketPosition: -1,
        },
        deps.addToView,
    );
    return { ...values, ...added };
}

/** A granularity edit on VIEW's date item. */
function setViewGranularity(
    values: WorkingValues,
    granularity: Granularity,
    deps: IRecommendationApplyDeps,
): WorkingValues {
    const [firstDateItem] = getDateBucketItemsInBucket(values.buckets, VIEW);

    const edit = editBucketItem(
        { buckets: values.buckets, referencePoint: values.referencePoint },
        { kind: "granularity", localIdentifier: firstDateItem?.localIdentifier, value: granularity },
        deps.edit,
    );

    // the operation answers `undefined` for an identifier that is in no bucket, so nothing commits
    return edit
        ? {
              ...values,
              buckets: edit.buckets,
              referencePoint: edit.referencePoint,
              isVisualizationMdObjectValid: edit.isVisualizationMdObjectValid,
          }
        : values;
}
