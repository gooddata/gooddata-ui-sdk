// (C) 2026 GoodData Corporation

import { type IVisualizationClass } from "@gooddata/sdk-model";

import {
    applyMetricOverTimePostponedShortcut,
    applyMetricPostponedShortcut,
} from "../../actions/shortcuts_actions.js";
import { ATTRIBUTE, MEASURES, TREND, VIEW } from "../../constants/bucket.js";
import { LAST_4_FISCAL_QUARTERS, LAST_4_QUARTERS } from "../../constants/presets.js";
import { createDateItem } from "../../models/date_item.js";
import { GRANULARITY } from "../../models/granularity.js";
import { getDateFilterConfigFromPreset } from "../../models/preset_item.js";
import { type IRawBuckets } from "../../typings/buckets.js";
import { type IDateDataset } from "../../typings/datasets.js";
import { type ICatalogEntry } from "../../typings/state_objects.js";
import { resolveBucketIndexInBuckets, updateBucketItemsAt } from "../buckets/bucket_item_address.js";
import {
    type IAddBucketItemDeps,
    type IAddBucketItemInput,
    type IAddBucketItemResult,
    addBucketItemFromCatalog,
} from "../buckets/buckets_add_operation.js";
import {
    type DateDatasetByRefResolver,
    getPrimaryDateDatasetRefInBuckets,
    setBucketItemsDateDataset,
} from "../buckets/buckets_date_helpers.js";
import {
    type IBucketItemEditDeps,
    changeBucketsDateDataset,
    editBucketItem,
    selectVisualizationType,
} from "../buckets/buckets_edit_operations.js";
import { getDateBucketItemsInBucket, hasDateBucketItemInBuckets } from "../buckets/buckets_read_helpers.js";
import { type IDateDatasetsState } from "../date_datasets/date_datasets_state.js";
import {
    createDateFilterIfDoesntExist,
    findFirstDateFilter,
    updateDateFilter,
} from "../filter_bar/filter_bar_helpers.js";
import {
    type IReferencePointSyncDeps,
    syncReferencePointForBuckets,
} from "../reference_point/reference_point_sync.js";
import { type IVisualizationClassState } from "../visualization_classes/visualization_classes_state.js";

import { type IPostponedActionState } from "./postponed_action_state.js";
import { type IShortcutDateDatasetsState } from "./shortcut_date_datasets_state.js";
import { type IShortcutDroppedItemState } from "./shortcut_dropped_item_state.js";

/**
 * THE SHORTCUT OPERATIONS — the four `SHORTCUT_APPLY_METRIC*` triggers resolve to THREE operations,
 * and the branch between them is the saga's, because the deciding facts (is a column chart selected,
 * does the workspace have one) are boundary reads:
 *
 * - {@link applyMetricShortcutToBuckets} — the metric lands in MEASURES and the parked state is
 *   cleared. Runs for a direct drop on a column chart AND for the postponed replay, which is the
 *   same one operation the two triggers always were;
 * - {@link applyMetricOverTimeShortcutToBuckets} — the same, plus VIEW is emptied first and the
 *   shortcut date datasets drive the whole date pipeline (copy-across, re-point, ensure a date
 *   item in the trend bucket, default granularity, default date-filter preset);
 * - {@link postponeShortcut} — the chart is not a column but the workspace has one: the ready-made
 *   replay ACTION is parked, the type switches, and the answer is cleared. No buckets are touched;
 *   the replay saga re-puts the parked action once the pluggable visualization has answered
 *   (postponed_action_sagas.ts).
 *
 * A drop on a non-column chart in a workspace WITHOUT a column class commits NOTHING.
 *
 * THE DATE RESOLUTION IS MID-FLIGHT BY DESIGN: the over-time pipeline copies the shortcut date
 * datasets into `data.dateDatasets`, and every later lookup — the re-point, the ensured item's
 * granularity sync, the primary ref for the date filter — must resolve against the COPIED lists. The
 * deps therefore carry a resolver over the shortcut lists
 * ({@link IShortcutApplyDeps.shortcutDateDatasetByRef}), and `edit.dateDatasetByRef` is built from
 * the same lists by the saga. A boundary resolver over the entry state would answer from the STALE
 * `data.dateDatasets` and silently mis-sync the granularity attribute.
 */

export interface IShortcutApplyInput extends IAddBucketItemInput {
    dateDatasets: IDateDatasetsState;
    shortcutDroppedItem: IShortcutDroppedItemState;
    postponedAction: IPostponedActionState | undefined;
}

export interface IShortcutApplyDeps extends IReferencePointSyncDeps {
    /** the MEASURES-bucket add facts; the added item is a metric, so its date facts are inert */
    addToMeasures: IAddBucketItemDeps;
    /**
     * The trend bucket's add facts, for the date item the over-time pipeline can plant. The
     * operation OVERRIDES `primaryDateDatasetRef` and `dateDatasetByRef` mid-flight — both are
     * decided by the copied lists (see the module note).
     */
    addToTrendBucket: IAddBucketItemDeps;
    /** the granularity/date edits' facts, with `dateDatasetByRef` over the SHORTCUT lists */
    edit: IBucketItemEditDeps;
    shortcutDateDatasetByRef: DateDatasetByRefResolver;
    shortcutDateDatasets: IShortcutDateDatasetsState;
    /** `activeCalendars.fiscal === true && activeCalendars.default === "FISCAL"` */
    useFiscalDefaults: boolean;
}

/** The metric landed: the add operation's nine domains plus the two cleared shortcut leaves. */
export interface IMetricShortcutApplyResult extends IAddBucketItemResult {
    shortcutDroppedItem: null;
    postponedAction: undefined;
}

export interface IMetricOverTimeShortcutApplyResult extends IMetricShortcutApplyResult {
    dateDatasets: IDateDatasetsState;
}

export interface IShortcutPostponedResult {
    /** the ready-made action the replay saga re-puts verbatim */
    postponedAction: IPostponedActionState;
    visualizationClass: IVisualizationClassState;
    extendedReferencePoint: undefined;
    isVisualizationMdObjectValid: boolean;
    /** cleared by the over-time postpone, carried unchanged by the metric one */
    shortcutDroppedItem: IShortcutDroppedItemState;
}

/** `SHORTCUT_APPLY_METRIC` on a column chart, and `SHORTCUT_APPLY_METRIC_POSTPONED` — one operation. */
export function applyMetricShortcutToBuckets(
    input: IShortcutApplyInput,
    item: ICatalogEntry,
    deps: IShortcutApplyDeps,
): IMetricShortcutApplyResult {
    const added = addBucketItemFromCatalog(
        input,
        { bucketLocalIdentifier: MEASURES, catalogItem: item, bucketPosition: -1 },
        deps.addToMeasures,
    );

    return { ...added, shortcutDroppedItem: null, postponedAction: undefined };
}

/** `SHORTCUT_APPLY_METRIC_OVER_TIME` on a column chart, and its postponed replay. */
export function applyMetricOverTimeShortcutToBuckets(
    input: IShortcutApplyInput,
    item: ICatalogEntry,
    deps: IShortcutApplyDeps,
): IMetricOverTimeShortcutApplyResult {
    // 1. VIEW is emptied. `resolveBucketIndexInBuckets` wraps the not-found -1 to the LAST bucket,
    // which is the preserved bucket-addressing behavior.
    const emptiedBuckets = updateBucketItemsAt(
        input.buckets,
        resolveBucketIndexInBuckets(input.buckets, VIEW),
        () => [],
    );

    // 2. the metric lands in MEASURES, the parked state clears
    const added = addBucketItemFromCatalog(
        { ...input, buckets: emptiedBuckets },
        { bucketLocalIdentifier: MEASURES, catalogItem: item, bucketPosition: -1 },
        deps.addToMeasures,
    );
    let values: IShortcutApplyInput = { ...input, ...added };
    let dateDatasets = input.dateDatasets;

    // 3. the date pipeline — only once the shortcut date datasets have loaded (the drop is parked
    // and re-fired by sagas/shortcut_sagas.ts otherwise)
    if (deps.shortcutDateDatasets.available.length) {
        const defaultGranularity = deps.useFiscalDefaults ? GRANULARITY.FISCAL_QUARTER : GRANULARITY.QUARTER;
        const defaultPreset = deps.useFiscalDefaults ? LAST_4_FISCAL_QUARTERS : LAST_4_QUARTERS;
        const targetLocalIdentifier = getTrendBucketLocalIdentifier(values.buckets);
        const firstAvailableDateDataset = deps.shortcutDateDatasets.available[0];

        // copied across VERBATIM, a SHALLOW merge preserving the other keys
        dateDatasets = {
            ...input.dateDatasets,
            available: deps.shortcutDateDatasets.available,
            unavailable: deps.shortcutDateDatasets.unavailable,
        };
        values = {
            ...values,
            buckets: setBucketItemsDateDataset(
                values.buckets,
                firstAvailableDateDataset?.ref,
                {},
                deps.shortcutDateDatasetByRef,
            ),
        };

        values = ensureDateBucketItemInBucket(values, targetLocalIdentifier, deps, firstAvailableDateDataset);
        values = setBucketGranularity(values, targetLocalIdentifier, defaultGranularity, deps);

        const dateDatasetRef = getPrimaryDateDatasetRefInBuckets(
            values.buckets,
            values.filterBar.items,
            firstAvailableDateDataset,
        );
        let filterBar = createDateFilterIfDoesntExist(values.filterBar, dateDatasetRef);
        const dateFilter = findFirstDateFilter(filterBar);
        filterBar = updateDateFilter(filterBar, {
            localIdentifier: dateFilter.localIdentifier,
            filterConfig: getDateFilterConfigFromPreset(defaultPreset),
            // the EXISTING comparison type is kept — unlike the recommendation presets
            overTimeComparisonType: dateFilter.overTimeComparisonType,
            dateDatasetRef,
        });
        values = { ...values, filterBar };
    }

    // 4. the reference-point sync tail
    return {
        ...values,
        dateDatasets,
        shortcutDroppedItem: null,
        postponedAction: undefined,
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

/**
 * The postpone branch of both shortcuts: park the ready-made replay action, switch to the column
 * chart (clearing the extended reference point and the md flag with it, exactly what
 * `selectVisualizationType` decides), and — for the over-time variant only — clear the dropped item.
 */
export function postponeShortcut(
    input: Pick<IShortcutApplyInput, "shortcutDroppedItem">,
    parkedAction: IPostponedActionState,
    {
        columnVisualizationClass,
        clearDroppedItem,
    }: { columnVisualizationClass: IVisualizationClass; clearDroppedItem: boolean },
): IShortcutPostponedResult {
    const selection = selectVisualizationType(columnVisualizationClass);

    return {
        postponedAction: parkedAction,
        visualizationClass: selection.visualizationClass,
        extendedReferencePoint: selection.extendedReferencePoint,
        isVisualizationMdObjectValid: selection.isVisualizationMdObjectValid,
        shortcutDroppedItem: clearDroppedItem ? null : input.shortcutDroppedItem,
    };
}

/** Builds the parked action for a metric drop — re-put verbatim by the replay saga. */
export function buildMetricPostponedAction(item: ICatalogEntry): IPostponedActionState {
    return applyMetricPostponedShortcut(item);
}

/** Builds the parked action for a metric-over-time drop. */
export function buildMetricOverTimePostponedAction(item: ICatalogEntry): IPostponedActionState {
    return applyMetricOverTimePostponedShortcut(item);
}

// --- the composed steps ------------------------------------------------------------------------------

const TREND_BUCKET_NAMES = [VIEW, TREND, ATTRIBUTE];

/** The first bucket that can hold the trend dimension. */
export function getTrendBucketLocalIdentifier(buckets: IRawBuckets): string {
    const bucket = buckets.find((candidate) => TREND_BUCKET_NAMES.indexOf(candidate?.localIdentifier) !== -1);

    return bucket?.localIdentifier;
}

/**
 * When ANY bucket already holds a date item, the NAMED bucket's first date item (possibly
 * `undefined` — that mismatch is deliberate) is re-pointed at the primary date dataset; otherwise a
 * fresh date item is added to the named bucket.
 */
function ensureDateBucketItemInBucket(
    values: IShortcutApplyInput,
    bucketLocalIdentifier: string,
    deps: IShortcutApplyDeps,
    firstAvailableDateDataset: IDateDataset | undefined,
): IShortcutApplyInput {
    const dateDatasetRef = getPrimaryDateDatasetRefInBuckets(
        values.buckets,
        values.filterBar.items,
        firstAvailableDateDataset,
    );

    if (hasDateBucketItemInBuckets(values.buckets)) {
        const [firstDateItem] = getDateBucketItemsInBucket(values.buckets, bucketLocalIdentifier);
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
            bucketLocalIdentifier,
            catalogItem: createDateItem({ dateDatasetRef }) as unknown as ICatalogEntry,
            bucketPosition: -1,
        },
        // the date facts are decided by the copied lists (module note), not the entry state
        {
            ...deps.addToTrendBucket,
            primaryDateDatasetRef: dateDatasetRef,
            dateDatasetByRef: deps.shortcutDateDatasetByRef,
        },
    );
    return { ...values, ...added };
}

/** A granularity edit on the named bucket's date item. */
function setBucketGranularity(
    values: IShortcutApplyInput,
    bucketLocalIdentifier: string,
    granularity: string,
    deps: IShortcutApplyDeps,
): IShortcutApplyInput {
    const [firstDateItem] = getDateBucketItemsInBucket(values.buckets, bucketLocalIdentifier);

    const edit = editBucketItem(
        { buckets: values.buckets, referencePoint: values.referencePoint },
        {
            kind: "granularity",
            localIdentifier: firstDateItem?.localIdentifier,
            value: granularity,
        },
        deps.edit,
    );

    // the operation answers `undefined` for an identifier that is in no bucket, so nothing
    // `return state`
    return edit
        ? {
              ...values,
              buckets: edit.buckets,
              referencePoint: edit.referencePoint,
              isVisualizationMdObjectValid: edit.isVisualizationMdObjectValid,
          }
        : values;
}
