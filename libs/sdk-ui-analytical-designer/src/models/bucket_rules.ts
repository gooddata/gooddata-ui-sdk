// (C) 2007-2026 GoodData Corporation

import { type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import {
    ATTRIBUTE,
    CATALOG,
    COMPUTED_ATTRIBUTE,
    GEO_ATTRIBUTE,
    LOCATION,
    METRIC,
} from "../constants/bucket.js";
import { BUCKET_ITEM } from "../constants/drag_item_types.js";
import {
    type IDecoratedBucket,
    type IDecoratedBucketItem,
    type IDecoratedBuckets,
    type IRawBucketItem,
} from "../typings/buckets.js";
import {
    type IItemDropContext,
    isArithmeticMeasureDropContext,
    isBucketItemDropContext,
} from "../typings/drag_and_drop.js";

import { getType } from "./bucket_item.js";
import { DATE_TYPE } from "./date_item.js";

export type ItemType = "metric" | "attribute" | "fact" | "date";
type RuleFunc = (context: IItemDropContext, buckets?: IDecoratedBuckets) => boolean;

interface IDisplayFormLike {
    type?: string;
    displayFormType?: string;
}

interface IGeoItemDetails {
    displayForms: readonly IDisplayFormLike[];
    geoPinDisplayForms: readonly IDisplayFormLike[];
    locationDisplayFormRef?: ObjRef;
    areaDisplayFormRef?: ObjRef;
    isLocationIconVisible?: boolean;
}

/**
 * The geo read surface of whatever a drop context carries — a raw bucket item, a catalog entry, or
 * an item nesting the entry under `attribute`/`self`. `attribute` is `unknown` because a RAW bucket
 * item keeps the attribute IDENTIFIER there while a catalog item keeps the entry object; reading a
 * string for geo fields yields nothing, which is what the callers already relied on.
 */
interface IGeoItemSource {
    displayForms?: readonly IDisplayFormLike[];
    geoPinDisplayForms?: readonly IDisplayFormLike[];
    locationDisplayFormRef?: ObjRef;
    areaDisplayFormRef?: ObjRef;
    isLocationIconVisible?: boolean;
    attribute?: unknown;
    self?: IGeoItemSource;
}

interface INormalizedGeoItem {
    self: IGeoItemDetails;
    attribute?: IGeoItemDetails;
}

function isEnabled(context: IItemDropContext): boolean {
    return context.bucket.enabled;
}

function isCompatibleDestBucket(context: IItemDropContext): boolean {
    if (isBucketItemDropContext(context)) {
        const isMeasureBucket = isAcceptedByBucket(context, METRIC);
        const bucketTransformsAttributeToMeasure = context.bucket.transformAttributeToMeasure ?? true;
        const isAttributeBucketItem = context.bucketItem?.type === ATTRIBUTE;

        return !(isMeasureBucket && isAttributeBucketItem && bucketTransformsAttributeToMeasure);
    }

    return true;
}

function isAcceptedByBucket(context: IItemDropContext, type: ItemType): boolean {
    const accepts = context.bucket.accepts ?? [];
    const requiresGeoAttribute =
        type === ATTRIBUTE &&
        accepts.includes(GEO_ATTRIBUTE) &&
        (isLocationBucket(context.bucket) || isAreaBucket(context.bucket));

    if (requiresGeoAttribute) {
        return isGeoAttributeItem(context);
    }

    if (accepts.includes(type)) {
        return true;
    }

    if (type === ATTRIBUTE && accepts.includes(GEO_ATTRIBUTE)) {
        return isGeoAttributeItem(context);
    }

    return false;
}

export function isAccepted(context: IItemDropContext): boolean {
    const draggedItemType: ItemType = getDraggedItemType(context);
    return isAcceptedByBucket(context, draggedItemType) && isCompatibleDestBucket(context);
}

/**
 * A computed attribute IS an attribute for every drop rule - the buckets it may enter, the per-type
 * item limits, the duplicate rules, the "same attribute only" restriction. It is dragged under its
 * own catalog type, so the type is normalized here, once, and no `accepts` list has to name it.
 *
 * That includes a measure bucket: a computed attribute dropped there is coerced into a COUNT metric
 * exactly like a plain attribute (see models/bucket_item.ts).
 */
export function normalizeDraggedItemType(type: string): ItemType {
    return type === COMPUTED_ATTRIBUTE ? ATTRIBUTE : (type as ItemType);
}

/**
 * The type the drop rules see, read off the dragged item's own catalog entry - a computed attribute
 * is normalized to an attribute. An arithmetic measure drags no entry at all, hence the special case.
 */
function getDraggedItemType(context: IItemDropContext): ItemType {
    if (isBucketItemDropContext(context) && isArithmeticMeasureDropContext(context)) {
        return METRIC;
    }
    return normalizeDraggedItemType(context.item?.type);
}

export function isWithinLimit(context: IItemDropContext): boolean {
    const { bucket } = context;
    // limits count a computed attribute as an attribute on BOTH sides of the comparison: the
    // dragged type is normalized already, the bucket items resolve their type from the cache entry,
    // which keeps the computed attribute type
    const draggedItemType = getDraggedItemType(context);
    const masterItems = bucket.items ?? [];
    const itemsOfType = masterItems.filter(
        (bucketItem: IDecoratedBucketItem) =>
            normalizeDraggedItemType(getType(bucketItem)) === draggedItemType,
    );
    const isWithinGenericLimit = bucket.itemsLimit > masterItems.length;
    const isWithinTypeLimit =
        (bucket.itemsLimitByType?.[draggedItemType] ?? bucket.itemsLimit) > itemsOfType.length;
    return isWithinGenericLimit && isWithinTypeLimit;
}

function allowsDuplicateDates(context: IItemDropContext): boolean {
    const { bucket } = context;
    return getDraggedItemType(context) === DATE_TYPE && bucket.allowsDuplicateDates;
}

function allowsDuplicateAttributes(context: IItemDropContext): boolean {
    return getDraggedItemType(context) === ATTRIBUTE;
}

function checkDuplicateItem(context: IItemDropContext): boolean {
    const { item, bucket } = context;
    const bucketAllowsGenericDuplicate = bucket.allowsDuplicateItems;
    const bucketAllowsDuplicate =
        bucketAllowsGenericDuplicate || allowsDuplicateDates(context) || allowsDuplicateAttributes(context);
    return bucketAllowsDuplicate || bucketDoesNotContainItemIdentifier(bucket, item?.identifier);
}

function bucketDoesNotContainItemIdentifier(
    bucket: IDecoratedBucket,
    itemIdentifier: string | undefined,
): boolean {
    return !bucket.items.some(
        (bucketItem: IDecoratedBucketItem) => bucketItem.attribute?.identifier === itemIdentifier,
    );
}

function hasIdentifier(identifier: string | undefined, bucketItem: IRawBucketItem | undefined): boolean {
    return bucketItem?.attribute === identifier;
}

function canReplaceItself(context: IItemDropContext): boolean {
    const { item, bucket, destBucketItem } = context;
    return (
        bucket.allowsDuplicateItems ||
        allowsDuplicateAttributes(context) ||
        !hasIdentifier(item?.identifier, destBucketItem)
    );
}

function canSwap(context: IItemDropContext, buckets: IDecoratedBuckets): boolean {
    const { bucket, type, from } = context;

    if (type !== BUCKET_ITEM) {
        return true;
    }

    const fromBucket = buckets.find((b) => b.localIdentifier === from);
    const fromAllowsSwapping = fromBucket?.allowsSwapping;
    const toAllowsSwapping = bucket.allowsSwapping;

    const isAcceptedByTargetBucket =
        isBucketItemDropContext(context) && isAcceptedByBucket(context, context.bucketItem?.type as ItemType);

    return fromAllowsSwapping && toAllowsSwapping && isAcceptedByTargetBucket;
}

function isSameBucket(context: IItemDropContext): boolean {
    return context.from === context.to;
}

function isDifferentBucket(context: IItemDropContext): boolean {
    return context.from !== context.to;
}

function canAddLocationItem(context: IItemDropContext): boolean {
    return isLocationAttribute(getNormalizedSourceItem(context));
}

function canAddAreaItem(context: IItemDropContext): boolean {
    return isAreaAttribute(getNormalizedSourceItem(context));
}

function isLocationBucket(bucket: IDecoratedBucket): boolean {
    return bucket.localIdentifier === LOCATION;
}

function isAreaBucket(bucket: IDecoratedBucket): boolean {
    return bucket.localIdentifier === BucketNames.AREA;
}

function getSourceItem(context: IItemDropContext) {
    if (isBucketItemDropContext(context)) {
        return context.bucketItem;
    }
    return context.item;
}

function getNormalizedSourceItem(context: IItemDropContext): INormalizedGeoItem | undefined {
    return normalizeGeoItem(getSourceItem(context));
}

/** The runtime guard stays: the geo fields come from loosely typed drag payloads. */
function normalizeDisplayFormCollection(
    collection: readonly IDisplayFormLike[] | undefined,
): readonly IDisplayFormLike[] {
    return Array.isArray(collection) ? collection : [];
}

function normalizeGeoDetails(item: IGeoItemSource | null | undefined): IGeoItemDetails {
    return {
        displayForms: normalizeDisplayFormCollection(item?.displayForms),
        geoPinDisplayForms: normalizeDisplayFormCollection(item?.geoPinDisplayForms),
        locationDisplayFormRef: item?.locationDisplayFormRef,
        areaDisplayFormRef: item?.areaDisplayFormRef,
        isLocationIconVisible: item?.isLocationIconVisible,
    };
}

function normalizeGeoItem(item: IGeoItemSource | null | undefined): INormalizedGeoItem | undefined {
    if (!item) {
        return undefined;
    }

    return {
        self: normalizeGeoDetails(item.self ?? item),
        attribute: item.attribute ? normalizeGeoDetails(item.attribute as IGeoItemSource) : undefined,
    };
}

function getGeoSources(item: INormalizedGeoItem | undefined): IGeoItemDetails[] {
    if (!item) {
        return [];
    }

    return item.attribute ? [item.self, item.attribute] : [item.self];
}

function getDisplayForms(item: INormalizedGeoItem | undefined): IDisplayFormLike[] {
    return getGeoSources(item).flatMap((source) => [...source.displayForms, ...source.geoPinDisplayForms]);
}

function getDisplayFormType(displayForm: IDisplayFormLike): string | undefined {
    return displayForm.type ?? displayForm.displayFormType;
}

function hasDisplayFormType(item: INormalizedGeoItem | undefined, targetType: string): boolean {
    return getDisplayForms(item).some((displayForm) => getDisplayFormType(displayForm) === targetType);
}

function hasLatLongPair(item: INormalizedGeoItem | undefined): boolean {
    const displayFormTypes = getDisplayForms(item).map((displayForm) => getDisplayFormType(displayForm));
    return (
        displayFormTypes.includes("GDC.geo.pin_latitude") &&
        displayFormTypes.includes("GDC.geo.pin_longitude")
    );
}

function hasLocationDisplayFormRef(item: INormalizedGeoItem | undefined): boolean {
    return getGeoSources(item).some((source) => Boolean(source.locationDisplayFormRef));
}

function hasAreaDisplayFormRef(item: INormalizedGeoItem | undefined): boolean {
    return getGeoSources(item).some((source) => Boolean(source.areaDisplayFormRef));
}

function getIconFlag(item: INormalizedGeoItem | undefined): boolean {
    return getGeoSources(item).some((source) => Boolean(source.isLocationIconVisible));
}

function isAreaAttribute(item: INormalizedGeoItem | undefined): boolean {
    if (!item) {
        return false;
    }

    if (hasAreaDisplayFormRef(item)) {
        return true;
    }

    return hasDisplayFormType(item, "GDC.geo.area");
}

function isLocationAttribute(item: INormalizedGeoItem | undefined): boolean {
    if (!item) {
        return false;
    }

    if (isAreaAttribute(item)) {
        return false;
    }

    if (hasLocationDisplayFormRef(item)) {
        return true;
    }

    if (hasDisplayFormType(item, "GDC.geo.pin")) {
        return true;
    }

    if (hasLatLongPair(item)) {
        return true;
    }

    return getIconFlag(item);
}

function isGeoAttributeItem(context: IItemDropContext): boolean {
    const sourceItem = getNormalizedSourceItem(context);
    if (!sourceItem) {
        return false;
    }

    if (isAreaBucket(context.bucket)) {
        return isAreaAttribute(sourceItem);
    }

    return isLocationAttribute(sourceItem);
}

export function canAddItems(context: IItemDropContext): boolean {
    return context.bucket?.canAddItems;
}

function allRulesMet(rules: RuleFunc[], context: IItemDropContext, buckets: IDecoratedBuckets): boolean {
    return rules.every((rule: RuleFunc) => rule(context, buckets));
}

export function isAllowedToAdd(context: IItemDropContext, buckets: IDecoratedBuckets): boolean {
    const rules = [
        isEnabled,
        isAccepted,
        isWithinLimit,
        checkDuplicateItem,
        canSwap,
        isDifferentBucket,
        canAddItems,
        canAddDifferentAttributes,
    ];

    if (isLocationBucket(context.bucket)) {
        rules.push(canAddLocationItem);
    }
    if (isAreaBucket(context.bucket)) {
        rules.push(canAddAreaItem);
    }
    return allRulesMet(rules, context, buckets);
}

export function isAllowedToReplace(context: IItemDropContext, buckets: IDecoratedBuckets): boolean {
    const rules = [isEnabled, isAccepted, checkDuplicateItem, canSwap, isDifferentBucket, canReplaceItself];

    if (isLocationBucket(context.bucket)) {
        rules.push(canAddLocationItem);
    }
    if (isAreaBucket(context.bucket)) {
        rules.push(canAddAreaItem);
    }
    return allRulesMet(rules, context, buckets);
}

export function isAllowedToReorder(context: IItemDropContext, buckets: IDecoratedBuckets): boolean {
    const rules: RuleFunc[] = [isEnabled, isAccepted, canAddItems];

    if (context.from === CATALOG) {
        rules.push(checkDuplicateItem);
        rules.push(isWithinLimit);
        rules.push(canAddDifferentAttributes);
    } else {
        rules.push(isSameBucket);
    }

    return allRulesMet(rules, context, buckets);
}

/**
 * Based on allowsDifferentAttributes flag, we can add duplicate attributes to other buckets.
 * In case it is forbidden, the dragged attribute has to be the same as the one in main attribute bucket.
 */
export function canAddDifferentAttributes(context: IItemDropContext, buckets: IDecoratedBuckets) {
    const { item, bucket } = context;
    const allowsDifferentAttributes = bucket.allowsDifferentAttributes;

    if (
        allowsDifferentAttributes !== false ||
        normalizeDraggedItemType(item?.type as ItemType) !== ATTRIBUTE
    ) {
        return true;
    }

    const attributeBucket = buckets.find((b) => b.localIdentifier === ATTRIBUTE);
    // either ref may be absent, hence the `?? {}` fallbacks
    const attributeRef = (attributeBucket?.items?.[0]?.ref as ObjRef | undefined) ?? ({} as ObjRef);
    const draggedItemRef = item?.ref ?? ({} as ObjRef);

    return areObjRefsEqual(attributeRef, draggedItemRef);
}
