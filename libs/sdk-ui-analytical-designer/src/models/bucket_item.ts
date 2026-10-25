// (C) 2007-2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";
import { type OverTimeComparisonType } from "@gooddata/sdk-ui";

import { ATTRIBUTE, COMPUTED_ATTRIBUTE, DATE, FACT, METRIC } from "../constants/bucket.js";
import {
    DEFAULT_DECIMAL_FORMAT,
    DEFAULT_INTEGER_FORMAT,
    DEFAULT_PERCENTAGE_FORMAT,
} from "../constants/formats.js";
import { ArithmeticOperatorType } from "../typings/arithmetic_measure.js";
import { type IBucketItemMetricFilter } from "../typings/bucket_item_filter.js";
import {
    type IDecoratedBucketItem,
    type IRawBucketItem,
    type IRawBucketItems,
    type IRawBuckets,
} from "../typings/buckets.js";
import { type ICacheItemDisplayForm, type ICatalogEntry } from "../typings/state_objects.js";

import { generateBucketItemIdentifier } from "./bucket_item_identifier.js";

// STATE-shape seed for the raw buckets subtree (data.buckets / referencePoint.buckets). Frozen: it
// is shared by the slice initialState and the root seed, so an accidental in-place mutation throws
// loudly instead of becoming a shared-state bug.
export const INITIAL_MODEL: IRawBuckets = Object.freeze([]) as unknown as IRawBuckets;

// Frozen for the same reason INITIAL_MODEL is: the base is spread into every bucket-item factory
// (here, models/metadata, buckets_service), so an accidental in-place mutation of a shared field
// must throw loudly instead of leaking across items. Factories hand out a FRESH `filters` array per
// item — the frozen one here is only the never-mutated fallback.
export const bucketItemBase: Readonly<IRawBucketItem> = Object.freeze({
    ref: null,
    attribute: null,
    // frozen-empty behind a mutable-array type, same idiom as INITIAL_MODEL above
    filters: Object.freeze([]) as unknown as IBucketItemMetricFilter[],
    aggregation: null,
    showInPercent: null,
    showAllValues: null,
    showOnSecondaryAxis: null,
    isThresholdMeasure: null,
    isTotalMeasure: null,
    isKdaDisabled: null,
    granularity: null,
    alias: null,
    localIdentifier: "",
    masterLocalIdentifier: null,
    operator: null,
    operandLocalIdentifiers: null,
});

export function getDefaultMeasureFormat(catalogItemType: string, showInPercent = false): string {
    if (showInPercent) {
        return DEFAULT_PERCENTAGE_FORMAT;
    }
    if (catalogItemType === FACT) {
        return DEFAULT_DECIMAL_FORMAT;
    }
    // A counted computed attribute is counted like any attribute, so it takes the same format.
    if (catalogItemType === ATTRIBUTE || catalogItemType === COMPUTED_ATTRIBUTE) {
        return DEFAULT_INTEGER_FORMAT;
    }
    return null;
}

export function getDefaultArithmeticMeasureFormat(operator: string) {
    if (operator === (ArithmeticOperatorType.CHANGE as string)) {
        return DEFAULT_PERCENTAGE_FORMAT;
    }
    return DEFAULT_DECIMAL_FORMAT;
}

export function buildBucketItemFromCatalogItem(
    catalogItem: ICatalogEntry,
    shouldTransformAttributeToMeasure: boolean,
    dateDatasetRef: ObjRef,
): IRawBucketItem {
    const {
        identifier: attribute,
        type: itemType,
        isLocationIconVisible,
        locationDisplayFormRef,
        displayForms,
        dfRef,
        ref,
        areaDisplayFormRef,
    } = catalogItem;
    const format = getDefaultMeasureFormat(itemType);

    switch (itemType) {
        case METRIC:
            return buildBucketItem({ attribute, type: METRIC });
        case FACT:
            return buildBucketItem({
                attribute,
                type: METRIC,
                aggregation: "sum",
                format,
            });
        case DATE:
            return buildBucketItem({ attribute, dateDatasetRef, type: DATE });
        // A computed attribute becomes a plain ATTRIBUTE bucket item - it is an attribute for every
        // bucket - but keeps the isComputedAttribute flag, which is what tells the itemCache lookups
        // which namespace to resolve it in and what the execution conversion will branch on.
        case COMPUTED_ATTRIBUTE:
        case ATTRIBUTE:
            return shouldTransformAttributeToMeasure
                ? buildBucketItem({
                      attribute,
                      type: METRIC,
                      aggregation: "count",
                      format,
                      ...(itemType === COMPUTED_ATTRIBUTE ? { isComputedAttribute: true } : {}),
                  })
                : buildBucketItem({
                      attribute,
                      type: ATTRIBUTE,
                      isLocationIconVisible,
                      locationDisplayFormRef,
                      areaDisplayFormRef,
                      displayForms,
                      dfRef,
                      ref,
                      ...(itemType === COMPUTED_ATTRIBUTE ? { isComputedAttribute: true } : {}),
                  });
        default:
            return null;
    }
}

/**
 * The display forms a bucket item carries — copied VERBATIM off the catalog item it was built from,
 * so this is exactly `ICacheItemDisplayForm`. It must NOT be narrowed to require `type`: a
 * date-derived or fixture display form carries none.
 */
export type IBucketItemDisplayForm = ICacheItemDisplayForm;

export interface IBucketItemProps {
    attribute?: string | null;
    operator?: string;
    localIdentifier?: string;
    identifier?: string;
    operandLocalIdentifiers?: string[];
    masterLocalIdentifier?: string;
    type?: string;
    alias?: string;
    aggregation?: string;
    isLocationIconVisible?: boolean;
    overTimeComparisonType?: OverTimeComparisonType;
    locationDisplayFormRef?: ObjRef;
    areaDisplayFormRef?: ObjRef;
    displayForms?: ReadonlyArray<IBucketItemDisplayForm>;
    dfRef?: ObjRef;
    format?: string;
    filters?: IBucketItemMetricFilter[];
    granularity?: string;
    showInPercent?: boolean;
    isTotalMeasure?: boolean;
    dateDatasetRef?: ObjRef;
    ref?: ObjRef;
    /** set on an item built from a computed attribute — see {@link IRawBucketItem#isComputedAttribute} */
    isComputedAttribute?: boolean;
}

export function buildBucketItem(props: IBucketItemProps): IRawBucketItem {
    // `filters` gets a FRESH array per item: the spread of the (frozen) base would otherwise share
    // one array instance across every built item.
    return {
        ...bucketItemBase,
        filters: [],
        localIdentifier: generateBucketItemIdentifier(),
        ...props,
    };
}

type AnyBucketItem = IRawBucketItem | IDecoratedBucketItem;

export function getLocalIdentifier(item: AnyBucketItem, defaultValue?: string) {
    return item?.localIdentifier ?? defaultValue;
}

export function setLocalIdentifier(item: IRawBucketItem, newValue: string) {
    if (item?.localIdentifier === newValue) {
        return item;
    }
    return { ...item, localIdentifier: newValue };
}

export function getMasterLocalIdentifier(item: AnyBucketItem, defaultValue?: string) {
    return item?.masterLocalIdentifier ?? defaultValue;
}

export function setMasterLocalIdentifier(item: IRawBucketItem, newValue: string | null) {
    if (item?.masterLocalIdentifier === newValue) {
        return item;
    }
    return { ...item, masterLocalIdentifier: newValue };
}

/**
 * The BOOLEAN FLAGS a bucket-item edit sets on an item and on the items derived from it. A closed
 * union rather than a `string`: the edits address the flag by name, and this is what keeps a typo a
 * compile error instead of a stray own property on the state item.
 */
export type BucketItemFlag =
    | "showInPercent"
    | "showOnSecondaryAxis"
    | "isTotalMeasure"
    | "isThresholdMeasure";

/** Identity when the item already carries this flag value. */
export function setBucketItemFlag(
    item: IRawBucketItem,
    flag: BucketItemFlag,
    value: boolean,
): IRawBucketItem {
    if (item?.[flag] === value) {
        return item;
    }
    return { ...item, [flag]: value };
}

export function enableSecondaryAxis(item: IRawBucketItem, value: boolean): IRawBucketItem {
    if (!isMeasure(item) || item.showOnSecondaryAxis === value) {
        return item;
    }
    return { ...item, showOnSecondaryAxis: value };
}

export function hideFromKda(item: IRawBucketItem, value: boolean): IRawBucketItem {
    if (!isMeasure(item) || item.isKdaDisabled === value) {
        return item;
    }
    return { ...item, isKdaDisabled: value };
}

export function getOperator(item: AnyBucketItem) {
    return item?.operator;
}

export function getOperandLocalIdentifiers(item: AnyBucketItem): string[] | null {
    return (item?.operandLocalIdentifiers as string[] | null) ?? null;
}

export function isAttribute(item: AnyBucketItem) {
    return (item as IRawBucketItem)?.type === ATTRIBUTE;
}

export function isDate(item: AnyBucketItem) {
    return (item as IRawBucketItem)?.type === DATE;
}

/**
 * An attribute item that was built from a computed attribute. Its `type` is `ATTRIBUTE` like any
 * other attribute item - see IRawBucketItem#isComputedAttribute for why the flag exists.
 */
export function isComputedAttributeItem(item: AnyBucketItem) {
    return (item as IRawBucketItem)?.isComputedAttribute === true;
}

export function isMeasure(item: AnyBucketItem) {
    return (item as IRawBucketItem)?.type === METRIC;
}

export function getType(item: AnyBucketItem) {
    return (item as IDecoratedBucketItem)?.attribute?.type;
}

export function isDerived(item: AnyBucketItem) {
    return !!getMasterLocalIdentifier(item);
}

export function isDerivedFrom(item: AnyBucketItem, masterItem: AnyBucketItem) {
    return getMasterLocalIdentifier(item) === getLocalIdentifier(masterItem);
}

export function isDerivedFromArithmeticMeasure(
    bucketItem: IRawBucketItem,
    allBucketItems: IRawBucketItems,
): boolean {
    if (!isDerived(bucketItem)) {
        return false;
    }

    return allBucketItems.some(
        (measure: IRawBucketItem) =>
            isArithmeticMeasure(measure) && isMasterMeasure(measure) && isDerivedFrom(bucketItem, measure),
    );
}

export function hasDerived(masterItem: IRawBucketItem, buckets: IRawBuckets) {
    return buckets.some((bucket) =>
        bucket?.items.some((item: IRawBucketItem) => isDerivedFrom(item, masterItem)),
    );
}

export function isMasterMeasure(item: AnyBucketItem) {
    return isMeasure(item) && !isDerived(item);
}

export function isArithmeticMeasure(item: AnyBucketItem): boolean {
    return getOperandLocalIdentifiers(item) !== null;
}

export function isValidArithmeticMeasure(item: AnyBucketItem): boolean {
    return (
        isArithmeticMeasure(item) &&
        getOperandLocalIdentifiers(item).every(
            (operandLocalIdentifier: string) => operandLocalIdentifier !== null,
        )
    );
}

export function isInvalidArithmeticMeasure(item: AnyBucketItem): boolean {
    return (
        isArithmeticMeasure(item) &&
        getOperandLocalIdentifiers(item).some(
            (operandLocalIdentifier: string) => operandLocalIdentifier === null,
        )
    );
}

export function findDerivedMeasure(masterItem: IRawBucketItem, allMeasures: IRawBucketItems) {
    return allMeasures.find((item: IRawBucketItem) => isDerivedFrom(item, masterItem));
}

export function findMasterMeasure(item: IRawBucketItem, buckets: IRawBuckets) {
    const masterLocalIdentifier = getMasterLocalIdentifier(item);
    if (masterLocalIdentifier === undefined) {
        return undefined;
    }
    return buckets
        .flatMap((bucket) => bucket?.items)
        .find((singleItem: IRawBucketItem) => singleItem?.localIdentifier === masterLocalIdentifier);
}
