// (C) 2019 GoodData Corporation
import set = require("lodash/set");
import get = require("lodash/get");
import has = require("lodash/has");
import uniq = require("lodash/uniq");
import uniqBy = require("lodash/uniqBy");
import negate = require("lodash/negate");
import includes = require("lodash/includes");
import every = require("lodash/every");
import forEach = require("lodash/forEach");
import cloneDeep = require("lodash/cloneDeep");
import partial = require("lodash/partial");
import isEmpty = require("lodash/isEmpty");
import flatMap = require("lodash/flatMap");
import compact = require("lodash/compact");
import without = require("lodash/without");
import { InjectedIntl } from "react-intl";
import { VisualizationTypes } from "../../constants/visualizationTypes";
import * as BucketNames from "../../constants/bucketNames";
import { OverTimeComparisonType, OverTimeComparisonTypes } from "../../interfaces/OverTimeComparison";
import { VisualizationObject } from "@gooddata/typings";

import {
    IFiltersBucketItem,
    IBucketItem,
    IBucket,
    IReferencePoint,
    IExtendedReferencePoint,
    IUiConfig,
    IBucketsUiConfig,
    IBucketUiConfig,
    IFilters,
    IBucketFilter,
} from "../interfaces/Visualization";
import {
    DATE_DATASET_ATTRIBUTE,
    ATTRIBUTE,
    DATE,
    METRIC,
    BUCKETS,
    SHOW_ON_SECONDARY_AXIS,
} from "../constants/bucket";
import { UICONFIG } from "../constants/uiConfig";
import { getTranslation } from "./translations";

export function removeUnusedFilters(filters: IFiltersBucketItem[], unusedBucketItems: IBucketItem[]) {
    return filters.filter(filter => {
        return (
            filter.autoCreated === false ||
            !unusedBucketItems.some(item => item.attribute === filter.attribute)
        );
    });
}

export function sanitizeUnusedFilters(
    newReferencePoint: IExtendedReferencePoint,
    referencePoint: IReferencePoint,
): IExtendedReferencePoint {
    const allAttributeBucketItems = getAllAttributeItems(referencePoint.buckets);
    const usedAttributeBucketItems = getAllAttributeItems(newReferencePoint.buckets);

    const unusedAttributeBucketItems = allAttributeBucketItems.filter(
        (bucketItem: IBucketItem) =>
            !usedAttributeBucketItems.some((used: IBucketItem) => used.attribute === bucketItem.attribute),
    );

    const filteredFilters = removeUnusedFilters(
        get(newReferencePoint.filters, "items", []),
        unusedAttributeBucketItems,
    );

    return {
        ...newReferencePoint,
        filters: {
            ...newReferencePoint.filters,
            items: filteredFilters,
        },
    };
}

export function isDerivedBucketItem(measureItem: IBucketItem): boolean {
    return !!measureItem.masterLocalIdentifier;
}

function isArithmeticBucketItem(bucketItem: IBucketItem): boolean {
    return !!bucketItem.operandLocalIdentifiers;
}

function isDerivedOfTypeBucketItem(measureItem: IBucketItem, derivedType: OverTimeComparisonType): boolean {
    if (!isDerivedBucketItem(measureItem)) {
        return false;
    }

    return measureItem.overTimeComparisonType === derivedType;
}

function findDerivedTypesReferencedByArithmeticMeasure(
    measure: IBucketItem,
    allMeasures: IBucketItem[],
    visitedMeasures: Set<string>,
): Set<OverTimeComparisonType> {
    return measure.operandLocalIdentifiers.reduce(
        (types: Set<OverTimeComparisonType>, operandIdentifier: string) => {
            if (operandIdentifier === null || visitedMeasures.has(operandIdentifier)) {
                return types;
            }
            const operand: IBucketItem = findMeasureByLocalIdentifier(operandIdentifier, allMeasures);
            if (operand === undefined) {
                return types;
            }
            if (isArithmeticBucketItem(operand)) {
                visitedMeasures.add(operandIdentifier);
                findDerivedTypesReferencedByArithmeticMeasure(operand, allMeasures, visitedMeasures).forEach(
                    (type: OverTimeComparisonType) => types.add(type),
                );
            } else if (isDerivedBucketItem(operand) && !types.has(operand.overTimeComparisonType)) {
                types.add(operand.overTimeComparisonType);
            }
            return types;
        },
        new Set(),
    );
}

/**
 * Get array of unique over time comparison types used in ancestors of the provided arithmetic measure.
 *
 * @param measure - the (possibly) arithmetic measure
 * @param buckets - all buckets
 * @return empty array if there are no derived measures in the arithmetic measure ancestors, empty array if provided
 * measure is not arithmetic, array of unique {OverTimeComparisonType} of derived ancestor measures found in arithmetic
 * measure tree.
 */
export function getDerivedTypesFromArithmeticMeasure(
    measure: IBucketItem,
    buckets: IBucket[],
): OverTimeComparisonType[] {
    if (!isArithmeticBucketItem(measure)) {
        return [];
    }

    const allMeasures = flatMap<IBucket, IBucketItem>(buckets, bucket => bucket.items);
    const overTimeComparisonTypes = findDerivedTypesReferencedByArithmeticMeasure(
        measure,
        allMeasures,
        new Set(),
    );
    return Array.from(overTimeComparisonTypes);
}

export function filterOutDerivedMeasures(measures: IBucketItem[]): IBucketItem[] {
    return measures.filter(measure => !isDerivedBucketItem(measure));
}

function isArithmeticMeasureFromDerived(measure: IBucketItem, buckets: IBucket[]): boolean {
    return getDerivedTypesFromArithmeticMeasure(measure, buckets).length > 0;
}

export function filterOutArithmeticMeasuresFromDerived(
    measures: IBucketItem[],
    buckets: IBucket[],
): IBucketItem[] {
    return measures.filter(measure => !isArithmeticMeasureFromDerived(measure, buckets));
}

function isArithmeticMeasureFromDerivedOfTypeOnly(
    measure: IBucketItem,
    buckets: IBucket[],
    derivedType: OverTimeComparisonType,
): boolean {
    const arithmeticMeasureDerivedTypes = getDerivedTypesFromArithmeticMeasure(measure, buckets);
    return arithmeticMeasureDerivedTypes.length === 1 && arithmeticMeasureDerivedTypes[0] === derivedType;
}

export function keepOnlyMasterAndDerivedMeasuresOfType(
    measures: IBucketItem[],
    derivedType: OverTimeComparisonType,
): IBucketItem[] {
    return measures.filter(
        measure => !isDerivedBucketItem(measure) || isDerivedOfTypeBucketItem(measure, derivedType),
    );
}

export function filterOutIncompatibleArithmeticMeasures(
    measures: IBucketItem[],
    buckets: IBucket[],
    derivedOfTypeToKeep: OverTimeComparisonType,
): IBucketItem[] {
    return measures.filter(
        (measure: IBucketItem) =>
            !isArithmeticBucketItem(measure) ||
            !isArithmeticMeasureFromDerived(measure, buckets) ||
            isArithmeticMeasureFromDerivedOfTypeOnly(measure, buckets, derivedOfTypeToKeep),
    );
}

function hasIdentifier(identifier: string, bucketItem: IBucketItem): boolean {
    return get(bucketItem, ATTRIBUTE) === identifier;
}

export const isDate = partial(hasIdentifier, DATE_DATASET_ATTRIBUTE);

export const isNotDate = negate(isDate);

export function getDateFilter(filtersBucket: IFilters) {
    const dateFiltersInclEmpty = flatMap<IFiltersBucketItem, IBucketFilter>(
        filtersBucket.items,
        filterItem => {
            const filters = get<IFiltersBucketItem, "filters", IBucketFilter[]>(filterItem, "filters", []);
            return filters.find(isDate);
        },
    );
    const dateFilters = compact(dateFiltersInclEmpty);
    return dateFilters.length ? dateFilters[0] : null;
}

export function getComparisonTypeFromFilters(filtersBucket: IFilters): OverTimeComparisonType {
    if (isEmpty(filtersBucket)) {
        return OverTimeComparisonTypes.NOTHING;
    }
    const dateFilter = getDateFilter(filtersBucket);

    return !isEmpty(dateFilter) && dateFilter.overTimeComparisonType
        ? dateFilter.overTimeComparisonType
        : OverTimeComparisonTypes.NOTHING;
}

function bucketSupportsSubtitle(visualizationType: string, bucketLocalIdentifier: string) {
    if (visualizationType === VisualizationTypes.HEADLINE) {
        return true;
    }

    if (visualizationType === VisualizationTypes.SCATTER) {
        return bucketLocalIdentifier !== BucketNames.ATTRIBUTE;
    }

    if (visualizationType === VisualizationTypes.BUBBLE) {
        return bucketLocalIdentifier !== BucketNames.VIEW;
    }

    if (visualizationType === VisualizationTypes.COMBO) {
        return bucketLocalIdentifier !== BucketNames.VIEW;
    }
    return false;
}

export function setBucketTitles(
    referencePoint: IExtendedReferencePoint,
    visualizationType: string,
    intl?: InjectedIntl,
): IUiConfig {
    const buckets: IBucket[] = get(referencePoint, BUCKETS);
    const updatedUiConfig: IUiConfig = cloneDeep(get(referencePoint, UICONFIG));

    forEach(buckets, (bucket: IBucket) => {
        const localIdentifier: string = get(bucket, "localIdentifier", "");
        // skip disabled buckets
        if (!get(updatedUiConfig, [BUCKETS, localIdentifier, "enabled"], false)) {
            return;
        }

        if (bucketSupportsSubtitle(visualizationType, localIdentifier)) {
            const subtitleId = generateBucketSubtitleId(localIdentifier, visualizationType);
            const subtitle = getTranslation(subtitleId, intl);
            set(updatedUiConfig, [BUCKETS, localIdentifier, "subtitle"], subtitle);
        }

        const titleId = generateBucketTitleId(localIdentifier, visualizationType);
        const title = getTranslation(titleId, intl);
        set(updatedUiConfig, [BUCKETS, localIdentifier, "title"], title);
    });

    return updatedUiConfig;
}

export function generateBucketTitleId(localIdentifier: string, visualizationType: string): string {
    return `dashboard.bucket.${localIdentifier}_title.${visualizationType}`;
}

export function generateBucketSubtitleId(localIdentifier: string, visualizationType: string): string {
    return `dashboard.bucket.${localIdentifier}_subtitle.${visualizationType}`;
}

export function getItemsCount(buckets: IBucket[], localIdentifier: string): number {
    return getBucketItems(buckets, localIdentifier).length;
}

export function getBucketItems(buckets: IBucket[], localIdentifier: string): IBucketItem[] {
    return get(buckets.find(bucket => bucket.localIdentifier === localIdentifier), "items", []);
}

// return bucket items matching localIdentifiers from any bucket
export function getItemsFromBuckets(
    buckets: IBucket[],
    localIdentifiers: string[],
    types?: string[],
): IBucketItem[] {
    return localIdentifiers.reduce(
        (bucketItems, localIdentifier) =>
            bucketItems.concat(
                types
                    ? getBucketItemsByType(buckets, localIdentifier, types)
                    : getBucketItems(buckets, localIdentifier),
            ),
        [],
    );
}

export function getBucketItemsByType(
    buckets: IBucket[],
    localIdentifier: string,
    types: string[],
): IBucketItem[] {
    const itemsOfType: IBucketItem[] = [];
    const bucketItems: IBucketItem[] = getBucketItems(buckets, localIdentifier);

    bucketItems.forEach((item: IBucketItem) => {
        if (includes(types, item.type)) {
            itemsOfType.push(item);
        }
    });
    return itemsOfType;
}

export function getPreferredBucketItems(buckets: IBucket[], preference: string[], type: string[]): any {
    const bucket = getPreferredBucket(buckets, preference, type);
    return get(bucket, "items", []);
}

export function getPreferredBucket(buckets: IBucket[], preference: string[], type: string[]): IBucket {
    return preference.reduce((result: IBucket, preference: string) => {
        if (result) {
            return result;
        }

        return buckets.find((bucket: IBucket) => {
            const preferenceMatch = bucket.localIdentifier === preference;
            const typeMatch = every(get(bucket, "items", []), item => type.indexOf(item.type) !== -1);

            return preferenceMatch && typeMatch;
        });
    }, undefined);
}

export function getAllBucketItemsByType(bucket: IBucket, types: string[]): IBucketItem[] {
    return bucket.items.reduce((resultItems: IBucketItem[], item: IBucketItem): IBucketItem[] => {
        if (includes(types, item.type)) {
            resultItems.push(item);
        }
        return resultItems;
    }, []);
}

export function getAllItemsByType(buckets: IBucket[], types: string[]): IBucketItem[] {
    return buckets.reduce(
        (items: IBucketItem[], bucket: IBucket) => [...items, ...getAllBucketItemsByType(bucket, types)],
        [],
    );
}

export function removeDuplicateBucketItems(buckets: IBucket[]): IBucket[] {
    const usedIdentifiersMap: { [key: string]: boolean } = {};

    return buckets.map(bucket => {
        const filteredBucketItems = bucket.items.filter(bucketItem => {
            const isDuplicate = usedIdentifiersMap[bucketItem.localIdentifier];
            usedIdentifiersMap[bucketItem.localIdentifier] = true;
            return !isDuplicate;
        });
        return filteredBucketItems.length === bucket.items.length
            ? bucket
            : {
                  ...bucket,
                  items: filteredBucketItems,
              };
    });
}

export function getTotalsFromBucket(
    buckets: IBucket[],
    bucketName: string,
): VisualizationObject.IVisualizationTotal[] {
    const selectedBucket = buckets.find(bucket => bucket.localIdentifier === bucketName);
    return get(selectedBucket, "totals", []);
}

export function getUniqueAttributes(buckets: IBucket[]) {
    const attributes = getAllItemsByType(buckets, [ATTRIBUTE, DATE]);
    return uniqBy(attributes, attribute => get(attribute, "attribute"));
}

export function getMeasuresFromMdObject(mdObject: VisualizationObject.IVisualizationObjectContent) {
    return get(mdObject, "buckets").reduce((acc, bucket) => {
        const measureDefinition = get(bucket, "items", [] as any).filter((item: any) =>
            has(item, "measure.definition.measureDefinition"),
        );

        return acc.concat(measureDefinition);
    }, []);
}

export function getMeasures(buckets: IBucket[]) {
    return getAllItemsByType(buckets, [METRIC]);
}

export function getFirstValidMeasure(buckets: IBucket[]): IBucketItem {
    const measures = getMeasures(buckets);
    const validMeasures = measures.filter(isValidMeasure);
    return validMeasures[0] || null;
}

function isValidMeasure(measure: IBucketItem): boolean {
    if (isArithmeticBucketItem(measure)) {
        return measure.operandLocalIdentifiers.every(
            operandLocalIdentifier => operandLocalIdentifier !== null,
        );
    }
    return true;
}

export function getFirstAttribute(buckets: IBucket[]): IBucketItem {
    return getUniqueAttributes(buckets)[0] || null;
}

export function getMeasureItems(buckets: IBucket[]): IBucketItem[] {
    const preference = [BucketNames.MEASURES, BucketNames.SECONDARY_MEASURES, BucketNames.TERTIARY_MEASURES];
    const preferredMeasures = preference.reduce((acc, pref) => {
        const prefBucketItems = getPreferredBucketItems(buckets, [pref], [METRIC]);
        return [...acc, ...prefBucketItems];
    }, []);

    // if not found in prefered bucket use all available measure items
    if (isEmpty(get(preferredMeasures, "items", []))) {
        return getMeasures(buckets);
    }
    return get(preferredMeasures, "items", []);
}

export function getBucketItemsWithExcludeByType(
    buckets: IBucket[],
    excludedBucket: string[],
    type: string[],
) {
    const includedBuckets = buckets.filter(
        (bucket: IBucket) => !includes(excludedBucket, bucket.localIdentifier),
    );
    return getAllItemsByType(includedBuckets, type);
}

export function getStackItems(buckets: IBucket[], itemTypes: string[] = [ATTRIBUTE]): IBucketItem[] {
    const preferredStacks = getPreferredBucket(buckets, [BucketNames.STACK, BucketNames.SEGMENT], itemTypes);

    return get(preferredStacks, "items", []);
}

export function getAttributeItems(buckets: IBucket[]): IBucketItem[] {
    return getAllAttributeItemsWithPreference(buckets, [BucketNames.VIEW, BucketNames.TREND]);
}

export function getAttributeItemsWithoutStacks(buckets: IBucket[]): IBucketItem[] {
    return getAttributeItems(buckets).filter(attribute => {
        return !includes(getStackItems(buckets), attribute);
    });
}

export function getAllCategoriesAttributeItems(buckets: IBucket[]): IBucketItem[] {
    const stackItemsWithDate = getStackItems(buckets, [ATTRIBUTE, DATE]);
    return getAttributeItems(buckets).filter((attribute: IBucketItem) => {
        return !includes(stackItemsWithDate, attribute);
    });
}

export function getAllAttributeItems(buckets: IBucket[]): IBucketItem[] {
    return getAllItemsByType(buckets, [ATTRIBUTE, DATE]);
}

// get all attributes from buckets, but items from prefered buckets are first
export function getAllAttributeItemsWithPreference(buckets: IBucket[], preference: string[]): IBucketItem[] {
    const preferredAttributes = preference.reduce((acc, pref) => {
        const prefBucket = getPreferredBucket(buckets, [pref], [ATTRIBUTE, DATE]);
        return [...acc, ...get(prefBucket, "items", [])];
    }, []);
    const allBucketNames: string[] = buckets.map(bucket => get(bucket, "localIdentifier"));
    const otherBucketNames: string[] = allBucketNames.filter(bucketName => !includes(preference, bucketName));
    const allOtherAttributes = otherBucketNames.reduce(
        (attributes, bucketName) =>
            attributes.concat(getBucketItemsByType(buckets, bucketName, [ATTRIBUTE, DATE])),
        [],
    );
    return [...preferredAttributes, ...allOtherAttributes];
}

export function getDateItems(buckets: IBucket[]): IBucketItem[] {
    return getAttributeItemsWithoutStacks(buckets).filter(isDate);
}

function hasItemsAboveLimit(bucket: IBucket, itemsLimit: number): boolean {
    const masterBucketItems = filterOutDerivedMeasures(bucket.items);
    return masterBucketItems.length > itemsLimit;
}

function applyItemsLimit(bucket: IBucket, itemsLimit: number): IBucket {
    if (itemsLimit !== undefined && hasItemsAboveLimit(bucket, itemsLimit)) {
        const newBucket = cloneDeep(bucket);

        newBucket.items = newBucket.items.slice(0, itemsLimit);
        return newBucket;
    }
    return bucket;
}

function applyUiConfigOnBucket(bucket: IBucket, bucketUiConfig: IBucketUiConfig): IBucket {
    return applyItemsLimit(bucket, get(bucketUiConfig, "itemsLimit"));
}

export function applyUiConfig(referencePoint: IExtendedReferencePoint): IExtendedReferencePoint {
    const buckets: IBucket[] = referencePoint.buckets;
    const uiConfig: IBucketsUiConfig = referencePoint.uiConfig.buckets;
    const newBuckets: IBucket[] = buckets.map((bucket: IBucket) =>
        applyUiConfigOnBucket(bucket, uiConfig[bucket.localIdentifier]),
    );
    set(referencePoint, "buckets", newBuckets);
    return referencePoint;
}

export function hasBucket(buckets: IBucket[], localIdentifier: string): boolean {
    return buckets.some(bucket => bucket.localIdentifier === localIdentifier);
}

export function findBucket(buckets: IBucket[], localIdentifier: string): IBucket {
    return buckets.find((bucket: IBucket) => get(bucket, "localIdentifier") === localIdentifier);
}

export function getBucketsByNames(buckets: IBucket[], names: string[]): IBucket[] {
    return buckets.filter((bucket: IBucket) => includes(names, get(bucket, "localIdentifier")));
}

export function getFirstMasterWithDerived(measureItems: IBucketItem[]): IBucketItem[] {
    const masters = filterOutDerivedMeasures(measureItems);
    const chosenMaster = masters[0];
    return measureItems.filter(
        measureItem =>
            measureItem.masterLocalIdentifier === chosenMaster.localIdentifier ||
            measureItem === chosenMaster,
    );
}

export function removeAllArithmeticMeasuresFromDerived(
    extendedReferencePoint: IExtendedReferencePoint,
): IExtendedReferencePoint {
    const originalBuckets = cloneDeep(extendedReferencePoint.buckets);
    forEach(extendedReferencePoint.buckets, bucket => {
        bucket.items = filterOutArithmeticMeasuresFromDerived(bucket.items, originalBuckets);
    });
    return extendedReferencePoint;
}

export function removeAllDerivedMeasures(
    extendedReferencePoint: IExtendedReferencePoint,
): IExtendedReferencePoint {
    forEach(extendedReferencePoint.buckets, bucket => {
        bucket.items = filterOutDerivedMeasures(bucket.items);
    });
    return extendedReferencePoint;
}

export function findMasterBucketItem(
    derivedBucketItem: IBucketItem,
    bucketItems: IBucketItem[],
): IBucketItem {
    return bucketItems.find(item => item.localIdentifier === derivedBucketItem.masterLocalIdentifier);
}

export function findMasterBucketItems(bucketItems: IBucketItem[]): IBucketItem[] {
    return bucketItems.filter(measure => !isDerivedBucketItem(measure));
}

export function findDerivedBucketItems(
    masterBucketItem: IBucketItem,
    bucketItems: IBucketItem[],
): IBucketItem[] {
    return bucketItems.filter(measure => measure.masterLocalIdentifier === masterBucketItem.localIdentifier);
}

export function findDerivedBucketItem(
    masterBucketItem: IBucketItem,
    bucketItems: IBucketItem[],
): IBucketItem {
    return bucketItems.find(
        bucketItem => bucketItem.masterLocalIdentifier === masterBucketItem.localIdentifier,
    );
}

export function hasDerivedBucketItems(masterBucketItem: IBucketItem, buckets: IBucket[]): boolean {
    return buckets.some(bucket =>
        bucket.items.some(
            bucketItem => bucketItem.masterLocalIdentifier === masterBucketItem.localIdentifier,
        ),
    );
}

export function getFilteredMeasuresForStackedCharts(buckets: IBucket[]) {
    const hasStacks = getStackItems(buckets).length > 0;
    if (hasStacks) {
        const limitedBuckets = limitNumberOfMeasuresInBuckets(buckets, 1);
        return getMeasureItems(limitedBuckets);
    }
    return getMeasureItems(buckets);
}

export function noRowsAndHasOneMeasure(buckets: VisualizationObject.IBucket[]): boolean {
    const measureBucket = buckets.find(bucket => bucket.localIdentifier === BucketNames.MEASURES);

    const rows = buckets.find(bucket => bucket.localIdentifier === BucketNames.VIEW);

    const hasOneMeasure = measureBucket && measureBucket.items.length === 1;
    const hasRows = rows && rows.items.length > 0;
    return Boolean(hasOneMeasure && !hasRows);
}

export function noColumnsAndHasOneMeasure(buckets: VisualizationObject.IBucket[]): boolean {
    const measureBucket = buckets.find(bucket => bucket.localIdentifier === BucketNames.MEASURES);

    const columns = buckets.find(bucket => bucket.localIdentifier === BucketNames.STACK);

    const hasOneMeasure = measureBucket && measureBucket.items.length === 1;
    const hasColumn = columns && columns.items.length > 0;
    return Boolean(hasOneMeasure && !hasColumn);
}

export function limitNumberOfMeasuresInBuckets(
    buckets: IBucket[],
    measuresLimitCount: number,
    tryToSelectDerivedWithMaster: boolean = false,
): IBucket[] {
    const allMeasures = getMeasureItems(buckets);

    let selectedMeasuresLocalIdentifiers: string[] = [];

    // try to select measures one per bucket
    buckets.forEach((bucket: IBucket) => {
        const currentBucketMeasures: IBucketItem[] = getAllBucketItemsByType(bucket, [METRIC]);

        if (currentBucketMeasures.length === 0) {
            return;
        }

        selectedMeasuresLocalIdentifiers = getLimitedMeasuresLocalIdentifiers(
            currentBucketMeasures,
            1,
            allMeasures,
            measuresLimitCount,
            tryToSelectDerivedWithMaster,
            selectedMeasuresLocalIdentifiers,
        );
    });

    // if it was not possible to select all measures one per bucket then limit them globally
    if (selectedMeasuresLocalIdentifiers.length < measuresLimitCount) {
        selectedMeasuresLocalIdentifiers = getLimitedMeasuresLocalIdentifiers(
            allMeasures,
            measuresLimitCount,
            allMeasures,
            measuresLimitCount,
            tryToSelectDerivedWithMaster,
            selectedMeasuresLocalIdentifiers,
        );
    }

    return pruneBucketMeasureItems(buckets, selectedMeasuresLocalIdentifiers);
}

function getLimitedMeasuresLocalIdentifiers(
    measures: IBucketItem[],
    measuresLimitCount: number,
    allMeasures: IBucketItem[],
    allMeasuresLimitCount: number,
    tryToSelectDerivedWithMaster: boolean,
    alreadySelectedMeasures: string[],
): string[] {
    let selectedMeasures: string[] = alreadySelectedMeasures;

    // try to select measures one by one together with their dependencies
    measures.forEach((measure: IBucketItem) => {
        if (selectedMeasures.length - alreadySelectedMeasures.length === measuresLimitCount) {
            return;
        }

        const measureDependencies = getDependenciesLocalIdentifiers(measure, allMeasures);
        const measureWithDependencies = [measure.localIdentifier, ...measureDependencies];

        if (tryToSelectDerivedWithMaster) {
            const derivedMeasures = getDerivedLocalIdentifiers(measure, allMeasures);
            const masterDerivedAndDependencies = [...measureWithDependencies, ...derivedMeasures];

            selectedMeasures = tryToSelectMeasures(
                masterDerivedAndDependencies,
                selectedMeasures,
                allMeasuresLimitCount,
            );
        }

        selectedMeasures = tryToSelectMeasures(
            measureWithDependencies,
            selectedMeasures,
            allMeasuresLimitCount,
        );
    });

    return selectedMeasures;
}

function getDerivedLocalIdentifiers(measure: IBucketItem, allMeasures: IBucketItem[]): string[] {
    const derivedMeasures = findDerivedBucketItems(measure, allMeasures);
    return derivedMeasures.map((derivedMeasure: IBucketItem) => derivedMeasure.localIdentifier);
}

function findMeasureByLocalIdentifier(
    localIdentifier: string,
    measures: IBucketItem[],
): IBucketItem | undefined {
    return measures.find((measure: IBucketItem) => measure.localIdentifier === localIdentifier);
}

function getDependenciesLocalIdentifiers(measure: IBucketItem, allMeasures: IBucketItem[]): string[] {
    const directDependencies: string[] = [];

    if (measure.masterLocalIdentifier) {
        directDependencies.push(measure.masterLocalIdentifier);
    }

    if (measure.operandLocalIdentifiers) {
        measure.operandLocalIdentifiers
            .filter(operandLocalIdentifier => operandLocalIdentifier !== null)
            .forEach((operandLocalIdentifier: string) => {
                const operandMeasure = findMeasureByLocalIdentifier(operandLocalIdentifier, allMeasures);
                if (operandMeasure !== undefined) {
                    directDependencies.push(operandLocalIdentifier);
                }
            });
    }

    const indirectDependencies: string[] = [];

    directDependencies.forEach((dependencyLocalIdentifier: string) => {
        const dependencyMeasure = findMeasureByLocalIdentifier(dependencyLocalIdentifier, allMeasures);
        const dependenciesOfDependency = getDependenciesLocalIdentifiers(dependencyMeasure, allMeasures);
        indirectDependencies.push(...dependenciesOfDependency);
    });

    return uniq([...directDependencies, ...indirectDependencies]);
}

function tryToSelectMeasures(measures: string[], alreadySelectedMeasures: string[], limit: number): string[] {
    const measuresToBePlaced = without(measures, ...alreadySelectedMeasures);

    if (measuresToBePlaced.length <= limit - alreadySelectedMeasures.length) {
        return [...alreadySelectedMeasures, ...measuresToBePlaced];
    }

    return alreadySelectedMeasures;
}

function pruneBucketMeasureItems(buckets: IBucket[], measureLocalIdentifiersToBeKept: string[]): IBucket[] {
    return buckets.map(
        (bucket: IBucket): IBucket => {
            const prunedItems = bucket.items.filter(
                (item: IBucketItem) =>
                    measureLocalIdentifiersToBeKept.indexOf(item.localIdentifier) > -1 ||
                    item.type !== METRIC,
            );

            return {
                ...bucket,
                items: prunedItems,
            };
        },
    );
}

export function isShowOnSecondaryAxis(item: IBucketItem): boolean {
    return get(item, SHOW_ON_SECONDARY_AXIS, false);
}

export function setMeasuresShowOnSecondaryAxis(items: IBucketItem[], value: boolean): IBucketItem[] {
    return items.map((item: IBucketItem) => ({
        ...item,
        [SHOW_ON_SECONDARY_AXIS]: value,
    }));
}

export function getAllMeasuresShowOnSecondaryAxis(buckets: IBucket[]): IBucketItem[] {
    return getAllItemsByType(buckets, [METRIC]).filter(isShowOnSecondaryAxis);
}

export function getItemsLocalIdentifiers(items: IBucketItem[]): string[] {
    return items.map((item: IBucketItem) => get(item, "localIdentifier", ""));
}
