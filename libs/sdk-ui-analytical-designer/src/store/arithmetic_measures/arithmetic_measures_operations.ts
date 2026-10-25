// (C) 2026 GoodData Corporation

import { type OverTimeComparisonType } from "@gooddata/sdk-ui";

import { findDerivedMeasure, isMeasure, isValidArithmeticMeasure } from "../../models/bucket_item.js";
import { type ArithmeticOperatorType } from "../../typings/arithmetic_measure.js";
import { type IRawBucketItem, type IRawBucketItems, type IRawBuckets } from "../../typings/buckets.js";
import { type IBucketNotificationsState } from "../bucket_notifications/bucket_notifications_types.js";
import {
    replaceBucketItemAt,
    requireBucketItemAddress,
    resolveBucketIndexInBuckets,
    updateBucketItemsAt,
} from "../buckets/bucket_item_address.js";
import { type IBucketsMetaState } from "../buckets/buckets_meta_state.js";
import { getMeasuresInBuckets } from "../buckets/buckets_read_helpers.js";
import {
    type IRemoveBucketItemsDeps,
    removeBucketItemsWithDependencies,
} from "../buckets/buckets_removal_helpers.js";
import {
    addTotalsEnabledForAllMeasuresToNewMeasure,
    sanitizeTotals,
} from "../buckets/buckets_totals_helpers.js";
import { findBucketItemInBuckets } from "../buckets/buckets_write_helpers.js";
import {
    type CatalogItemTypeResolver,
    sanitizeMeasureFormatForCatalogType,
} from "../buckets/helpers/measure_format.js";
import {
    areAllSelectedCompatible,
    createAndAddNewDerivedMeasure,
    getSelectedOverTimeComparisonTypeInBuckets,
    hasDerivedMeasureAsOperand,
} from "../buckets/over_time_comparison_helpers.js";
import { type IPluggableVisualizationState } from "../buckets/pluggable_visualization_state.js";
import { type IFilterBarState } from "../filter_bar/filter_bar_state.js";
import { type IExtendedReferencePointState } from "../reference_point/extended_reference_point_state.js";
import { type IReferencePointState } from "../reference_point/reference_point_state.js";
import {
    type IReferencePointSyncDeps,
    type IReferencePointSyncValues,
    syncReferencePoint,
    syncReferencePointForBuckets,
} from "../reference_point/reference_point_sync.js";

/**
 * THE ARITHMETIC-MEASURE OPERATIONS — three pure value-level calculations, each with a named input,
 * params, deps and result. The domain has NO state subtree of its own: every operation writes into
 * the buckets subtree, which is why none of this is a slice case.
 *
 * WHICH STATE EACH READ SEES is the subtle part:
 *
 * - the operand change looks the measure up in the ENTRY buckets, writes the operand, and then asks
 *   `findDerivedMeasure`/`hasDerivedMeasureAsOperand` about the ENTRY measures again — but resolves
 *   the comparison TYPE against the buckets WITH the updated operand (the same asymmetry the add
 *   operation documents as fact 3);
 * - `areAllSelectedCompatible` asks about the REFERENCE POINT only, which no branch has touched by
 *   then, so the entry value is the right one;
 * - the totals inheritance (`wasInvalid && isValidNow`) sanitizes against the ENTRY buckets, like
 *   every other `sanitizeTotals` call site.
 */

// --- adding an arithmetic measure -------------------------------------------------------------------

export interface IArithmeticMeasureAddInput {
    buckets: IRawBuckets;
    bucketsMeta: IBucketsMetaState;
    filterBar: IFilterBarState;
    referencePoint: IReferencePointState | undefined;
}

export interface IArithmeticMeasureAddParams {
    bucketLocalIdentifier: string;
    /**
     * Built by the SAGA (`createArithmeticMeasure`), not in here: the factory generates a fresh
     * local identifier, and keeping the impurity at the boundary keeps this calculation
     * deterministic — same input, same result.
     */
    newArithmeticMeasure: IRawBucketItem;
}

/**
 * The RESOLVER form, not values: this operation writes `bucketsMeta.measureExpanded` before the
 * sync, and the filter conversion has to run over the values as the operation left them.
 */
export type IArithmeticMeasureAddDeps = IReferencePointSyncDeps;

export interface IArithmeticMeasureAddResult {
    buckets: IRawBuckets;
    bucketsMeta: IBucketsMetaState;
    referencePoint: IReferencePointState | undefined;
    isVisualizationMdObjectValid: boolean;
}

/**
 * Appends a fresh (invalid, operand-less) arithmetic measure to the named bucket and expands its
 * measure slot so the operand picker is open.
 *
 * `undefined` for fewer than two measures: the reference-point sync AND the md-flag write are both
 * skipped, so the saga puts no event.
 */
/**
 * Points ONE operand slot of an arithmetic measure at another measure. Identity when that slot already
 * holds it.
 *
 * An arithmetic measure always carries a two-slot operand array (`createArithmeticMeasure` seeds
 * `[null, null]`) and the picker only ever addresses slot 0 or 1, so the nullish branch is
 * unreachable — it is written to seed an ARRAY rather than the index-keyed object a generic deep
 * setter would have produced.
 */
function setArithmeticMeasureOperand(
    item: IRawBucketItem,
    operandIndex: number,
    operandLocalIdentifier: string | null,
): IRawBucketItem {
    const operands = item.operandLocalIdentifiers ?? [];
    if (operandIndex < operands.length && operands[operandIndex] === operandLocalIdentifier) {
        return item;
    }
    const nextOperands = [...operands];
    nextOperands[operandIndex] = operandLocalIdentifier;
    return { ...item, operandLocalIdentifiers: nextOperands };
}

export function addArithmeticMeasureToBuckets(
    input: IArithmeticMeasureAddInput,
    { bucketLocalIdentifier, newArithmeticMeasure }: IArithmeticMeasureAddParams,
    deps: IArithmeticMeasureAddDeps,
): IArithmeticMeasureAddResult | undefined {
    if (getMeasuresInBuckets(input.buckets).length < 2) {
        return undefined;
    }

    const buckets = updateBucketItemsAt(
        input.buckets,
        resolveBucketIndexInBuckets(input.buckets, bucketLocalIdentifier),
        (items) => [...(items ?? []), newArithmeticMeasure],
    );
    const measureExpanded = newArithmeticMeasure.localIdentifier;
    const bucketsMeta =
        input.bucketsMeta.measureExpanded === measureExpanded
            ? input.bucketsMeta
            : { ...input.bucketsMeta, measureExpanded };

    return {
        buckets,
        bucketsMeta,
        referencePoint: syncReferencePointForBuckets(
            input.referencePoint,
            buckets,
            input.filterBar,
            bucketsMeta,
            deps,
        ),
        isVisualizationMdObjectValid: false,
    };
}

// --- selecting an operand ----------------------------------------------------------------------------

/**
 * The widest of the three: a valid operand pair can create a derived measure (writing the
 * plug-viz queue), and an operand that is itself derived REMOVES the arithmetic measure's own
 * derivative — the removal chain, which rewrites five domains.
 */
export interface IArithmeticMeasureOperandInput {
    buckets: IRawBuckets;
    bucketsMeta: IBucketsMetaState;
    filterBar: IFilterBarState;
    bucketNotifications: IBucketNotificationsState;
    extendedReferencePoint: IExtendedReferencePointState | undefined;
    pluggableVisualization: IPluggableVisualizationState | undefined;
    referencePoint: IReferencePointState | undefined;
    isVisualizationMdObjectValid: boolean;
}

export interface IArithmeticMeasureOperandParams {
    measureLocalIdentifier: string;
    operandIndex: number;
    selectedOperandMeasureLocalIdentifier: string;
}

export interface IArithmeticMeasureOperandDeps extends IRemoveBucketItemsDeps, IReferencePointSyncDeps {
    /** the visualization's uiConfig `supportedOverTimeComparisonTypes`, `[]` when it has none */
    supportedOverTimeComparisonTypes: OverTimeComparisonType[];
}

export interface IArithmeticMeasureOperandResult {
    buckets: IRawBuckets;
    bucketsMeta: IBucketsMetaState;
    filterBar: IFilterBarState;
    bucketNotifications: IBucketNotificationsState;
    extendedReferencePoint: IExtendedReferencePointState | undefined;
    pluggableVisualization: IPluggableVisualizationState | undefined;
    referencePoint: IReferencePointState | undefined;
    isVisualizationMdObjectValid: boolean;
}

export function selectArithmeticMeasureOperandInBuckets(
    input: IArithmeticMeasureOperandInput,
    {
        measureLocalIdentifier,
        operandIndex,
        selectedOperandMeasureLocalIdentifier,
    }: IArithmeticMeasureOperandParams,
    deps: IArithmeticMeasureOperandDeps,
): IArithmeticMeasureOperandResult {
    // deliberately UNGUARDED on a missing measure: addressing it throws a TypeError (see the
    // asymmetry rule in the buckets_edit_operations module note)
    const arithmeticMeasureBucketItem = findBucketItemInBuckets(input.buckets, measureLocalIdentifier);
    const address = requireBucketItemAddress(input.buckets, arithmeticMeasureBucketItem);

    const updatedArithmeticMeasureBucketItem = setArithmeticMeasureOperand(
        arithmeticMeasureBucketItem,
        operandIndex,
        selectedOperandMeasureLocalIdentifier,
    );

    let buckets = replaceBucketItemAt(input.buckets, address, updatedArithmeticMeasureBucketItem);

    // the second operand completing the pair makes the measure valid — it inherits "totals enabled
    // for all measures" and the totals table re-sanitizes against the ENTRY buckets
    if (
        !isValidArithmeticMeasure(arithmeticMeasureBucketItem) &&
        isValidArithmeticMeasure(updatedArithmeticMeasureBucketItem)
    ) {
        buckets = addTotalsEnabledForAllMeasuresToNewMeasure(buckets, updatedArithmeticMeasureBucketItem);
        buckets = sanitizeTotals(input.buckets, buckets, { reorderByMeasures: deps.reorderByMeasures });
    }

    // the ENTRY measures, deliberately: both facts are resolved against the state from before this
    // operation's own write
    const allMeasures = getMeasuresInBuckets(input.buckets);
    const derivedMeasure = findDerivedMeasure(updatedArithmeticMeasureBucketItem, allMeasures);
    const isBasedOnDerivedMeasure = hasDerivedMeasureAsOperand(
        updatedArithmeticMeasureBucketItem,
        allMeasures,
    );

    // an operand that is itself derived removes the arithmetic measure's own derivative — the
    // removal chain plus the reference-point sync tail
    if (derivedMeasure && isBasedOnDerivedMeasure) {
        const removal = removeBucketItemsWithDependencies(
            { ...input, buckets },
            {
                localIdentifiers: [derivedMeasure?.localIdentifier],
                notifyOnlyAboutRemovedDependencies: false,
            },
            deps,
        );

        return {
            ...removal,
            pluggableVisualization: input.pluggableVisualization,
            referencePoint: syncReferencePointForBuckets(
                input.referencePoint,
                removal.buckets,
                removal.filterBar,
                removal.bucketsMeta,
                deps,
            ),
            isVisualizationMdObjectValid: false,
        };
    }

    const refPointBuckets = input.referencePoint?.buckets ?? [];
    const refPointMeasures: IRawBucketItems = refPointBuckets
        .flatMap((bucket) => bucket.items ?? [])
        .filter(isMeasure);

    // every compatible reference-point measure already compares over time, so the freshly valid
    // arithmetic measure joins them: the comparison TYPE resolves against the buckets WITH the new
    // operand, the reference point WITHOUT it (fact 3 of the add operation)
    const shouldCreateDerivative =
        isValidArithmeticMeasure(updatedArithmeticMeasureBucketItem) &&
        !derivedMeasure &&
        !isBasedOnDerivedMeasure &&
        areAllSelectedCompatible(refPointBuckets, refPointMeasures);

    const pluggableVisualization = shouldCreateDerivative
        ? createAndAddNewDerivedMeasure(
              input.pluggableVisualization,
              updatedArithmeticMeasureBucketItem,
              getSelectedOverTimeComparisonTypeInBuckets(
                  buckets,
                  refPointBuckets,
                  deps.supportedOverTimeComparisonTypes,
              ),
          )
        : input.pluggableVisualization;

    return {
        ...input,
        buckets,
        pluggableVisualization,
        referencePoint: syncReferencePointForBuckets(
            input.referencePoint,
            buckets,
            input.filterBar,
            input.bucketsMeta,
            deps,
        ),
        isVisualizationMdObjectValid: false,
    };
}

// --- selecting the operator ---------------------------------------------------------------------------

export interface IArithmeticMeasureOperatorInput {
    buckets: IRawBuckets;
    referencePoint: IReferencePointState | undefined;
}

export interface IArithmeticMeasureOperatorParams {
    measureLocalIdentifier: string;
    operator: ArithmeticOperatorType;
}

export interface IArithmeticMeasureOperatorDeps extends IReferencePointSyncValues {
    /** the format rule — a change to/from RATIO/CHANGE decides the percent format */
    catalogItemType: CatalogItemTypeResolver;
}

export interface IArithmeticMeasureOperatorResult {
    buckets: IRawBuckets;
    referencePoint: IReferencePointState | undefined;
    isVisualizationMdObjectValid: boolean;
}

export function selectArithmeticMeasureOperatorInBuckets(
    { buckets, referencePoint }: IArithmeticMeasureOperatorInput,
    { measureLocalIdentifier, operator }: IArithmeticMeasureOperatorParams,
    deps: IArithmeticMeasureOperatorDeps,
): IArithmeticMeasureOperatorResult {
    const arithmeticMeasureBucketItem = findBucketItemInBuckets(buckets, measureLocalIdentifier);
    const address = requireBucketItemAddress(buckets, arithmeticMeasureBucketItem);
    const updatedBucketItem =
        arithmeticMeasureBucketItem.operator === operator
            ? arithmeticMeasureBucketItem
            : { ...arithmeticMeasureBucketItem, operator };

    const sanitized = sanitizeMeasureFormatForCatalogType(
        arithmeticMeasureBucketItem,
        updatedBucketItem,
        deps.catalogItemType(updatedBucketItem.attribute),
    );
    const nextBuckets = replaceBucketItemAt(buckets, address, sanitized);

    return {
        buckets: nextBuckets,
        referencePoint: syncReferencePoint(referencePoint, nextBuckets, deps.refPointFilters, deps.sortItems),
        isVisualizationMdObjectValid: false,
    };
}
