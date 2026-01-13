// (C) 2025 GoodData Corporation

import {
    type IInsightDefinition,
    areObjRefsEqual,
    attributeLocalId,
    bucketAttributes,
    insightBucket,
    insightMeasures,
    isAttributeLocator,
    isMeasureLocator,
    isTotalLocator,
    measureLocalId,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import {
    type ColumnLocator,
    type ColumnWidthItem,
    type IMeasureColumnLocator,
    type IMeasureColumnWidthItem,
    type IWeakMeasureColumnWidthItem,
    type MeasureGroupDimension,
    isAbsoluteColumnWidth,
    isAllMeasureColumnWidthItem,
    isAttributeColumnWidthItem,
    isMeasureColumnWidthItem,
    isMixedValuesColumnWidthItem,
    isSliceMeasureColumnWidthItem,
    isWeakMeasureColumnWidthItem,
} from "@gooddata/sdk-ui-pivot";

import {
    type IAttributeFilter,
    type IBucketFilter,
    type IBucketItem,
} from "../../../interfaces/Visualization.js";
import { isAttributeFilter } from "../../../utils/bucketHelper.js";

const isMeasureWidthItemMatchedByFilter = (
    widthItem: IMeasureColumnWidthItem,
    filter: IAttributeFilter,
): boolean =>
    filter.selectedElements.some((selectedElement) =>
        widthItem.measureColumnWidthItem.locators.some(
            (locator) =>
                (isAttributeLocator(locator) &&
                    locator.attributeLocatorItem.element === selectedElement.uri) ||
                isTotalLocator(locator),
        ),
    );

const matchesMeasureColumnWidthItemFilters = (
    widthItem: IMeasureColumnWidthItem,
    filters: IBucketFilter[],
    columnAttributes: IBucketItem[],
): boolean => {
    return filters
        .filter(isAttributeFilter)
        .filter((filter) =>
            columnAttributes.some((columnBucketItem) =>
                areObjRefsEqual(columnBucketItem.dfRef, filter.displayFormRef),
            ),
        )
        .every((filter) => {
            const shouldBeMatched = !filter.isInverted;
            return shouldBeMatched === isMeasureWidthItemMatchedByFilter(widthItem, filter);
        });
};

const matchesWidthItemFilters = (
    widthItem: ColumnWidthItem,
    filters: IBucketFilter[],
    columnAttributes: IBucketItem[],
): boolean => {
    if (isMeasureColumnWidthItem(widthItem)) {
        return matchesMeasureColumnWidthItemFilters(widthItem, filters, columnAttributes);
    }
    return true;
};

const containsMeasureLocator = (widthItem: IMeasureColumnWidthItem): boolean =>
    widthItem.measureColumnWidthItem.locators.some((locator) => isMeasureLocator(locator));

const widthItemLocatorsHaveProperLength = (
    widthItem: IMeasureColumnWidthItem,
    measuresCount: number,
    columnAttributesCount: number,
    measureGroupDimension?: MeasureGroupDimension,
): boolean => {
    const widthItemLocatorsLength = widthItem.measureColumnWidthItem.locators.length;
    const hasWidthItemLocators = widthItemLocatorsLength > 0;
    const hasMeasureLocators = measuresCount > 0 && containsMeasureLocator(widthItem);
    const hasNotMeasureLocators = measuresCount === 0 && !containsMeasureLocator(widthItem);
    const widthItemLocatorsMatchesColumnAttributesLength =
        widthItemLocatorsLength === columnAttributesCount + 1;
    const widthItemLocatorsHasLengthAsColumnAttributesLength =
        widthItemLocatorsLength === columnAttributesCount;
    const locatorsMatchesLength = hasMeasureLocators && widthItemLocatorsMatchesColumnAttributesLength;
    const locatorsAreEmpty = hasNotMeasureLocators && widthItemLocatorsHasLengthAsColumnAttributesLength;

    const locatorsHavePropertLength = hasWidthItemLocators && (locatorsMatchesLength || locatorsAreEmpty);
    const transposedLocatorsHavePropertLength =
        hasWidthItemLocators && widthItemLocatorsLength === measuresCount + columnAttributesCount;

    return measureGroupDimension === "rows" ? transposedLocatorsHavePropertLength : locatorsHavePropertLength;
};

const removeInvalidLocators = (
    columnWidth: IMeasureColumnWidthItem,
    measureLocalIdentifiers: string[],
    columnAttributeLocalIdentifiers: string[],
) => {
    return columnWidth.measureColumnWidthItem.locators.filter((locator) => {
        // filter out invalid measure locators
        if (isMeasureLocator(locator)) {
            return measureLocalIdentifiers.includes(locator.measureLocatorItem.measureIdentifier);
        }
        // filter out invalid column attribute locators
        if (isAttributeLocator(locator)) {
            return columnAttributeLocalIdentifiers.includes(locator.attributeLocatorItem.attributeIdentifier);
        }

        if (isTotalLocator(locator)) {
            return columnAttributeLocalIdentifiers.includes(locator.totalLocatorItem.attributeIdentifier);
        }

        return false;
    });
};

const columnWidthLocatorsAndMeasuresHaveSameValues = (
    locators: ColumnLocator[],
    measureLocalIdentifiers: string[],
) => {
    return locators.every((locator) => {
        const measureLocator = locator as IMeasureColumnLocator;
        return measureLocalIdentifiers.includes(measureLocator.measureLocatorItem.measureIdentifier);
    });
};

const transformToWeakMeasureColumnWidthItem = (
    columnWidth: IMeasureColumnWidthItem,
): IWeakMeasureColumnWidthItem | undefined => {
    if (
        isAbsoluteColumnWidth(columnWidth.measureColumnWidthItem.width) &&
        columnWidth.measureColumnWidthItem.locators.length === 1 &&
        isMeasureLocator(columnWidth.measureColumnWidthItem.locators[0])
    ) {
        return {
            measureColumnWidthItem: {
                width: columnWidth.measureColumnWidthItem.width,
                locator: columnWidth.measureColumnWidthItem.locators.filter(isMeasureLocator)[0],
            },
        };
    }

    return undefined;
};

// removes attribute widthItems with invalid identifiers
// removes measure widthItems with invalid identifiers and invalid number of locators
const adaptWidthItemsToPivotTable = (
    originalColumnWidths: ColumnWidthItem[] | undefined,
    measureLocalIdentifiers: string[],
    rowAttributeLocalIdentifiers: string[],
    columnAttributeLocalIdentifiers: string[],
    filters: IBucketFilter[],
    firstColumnAttributeAdded: boolean,
    columnAttributes: IBucketItem[],
    isAdaptPropertiesToInsight?: boolean,
    measureGroupDimension?: MeasureGroupDimension,
): ColumnWidthItem[] | undefined => {
    if (!originalColumnWidths) {
        return originalColumnWidths;
    }

    return originalColumnWidths.reduce((columnWidths: ColumnWidthItem[], columnWidth: ColumnWidthItem) => {
        if (isMeasureColumnWidthItem(columnWidth)) {
            const filteredMeasureColumnWidthItem: IMeasureColumnWidthItem = {
                measureColumnWidthItem: {
                    ...columnWidth.measureColumnWidthItem,
                    locators: removeInvalidLocators(
                        columnWidth,
                        measureLocalIdentifiers,
                        columnAttributeLocalIdentifiers,
                    ),
                },
            };

            // need to filter this too, so it takes in consideration previous row bucket identifiers that were moved to column bucket, as same as is done with referencePoint
            let filteredColumnAttributeLocalIdentifiers: string[] = [];
            if (isAdaptPropertiesToInsight) {
                filteredColumnAttributeLocalIdentifiers = [];
                filteredMeasureColumnWidthItem.measureColumnWidthItem.locators.forEach((locator) => {
                    if (isAttributeLocator(locator)) {
                        columnAttributeLocalIdentifiers.forEach((columnAttributeIdentifier) => {
                            if (
                                columnAttributeIdentifier === locator.attributeLocatorItem.attributeIdentifier
                            ) {
                                filteredColumnAttributeLocalIdentifiers.push(columnAttributeIdentifier);
                            }
                        });
                    }

                    if (isTotalLocator(locator)) {
                        columnAttributeLocalIdentifiers.forEach((columnAttributeIdentifier) => {
                            if (columnAttributeIdentifier === locator.totalLocatorItem.attributeIdentifier) {
                                filteredColumnAttributeLocalIdentifiers.push(columnAttributeIdentifier);
                            }
                        });
                    }
                });
            } else {
                filteredColumnAttributeLocalIdentifiers = columnAttributeLocalIdentifiers;
            }

            if (firstColumnAttributeAdded) {
                const transformedWeakMeasureWidthItem = transformToWeakMeasureColumnWidthItem(columnWidth);
                if (transformedWeakMeasureWidthItem) {
                    columnWidths.push(transformedWeakMeasureWidthItem);
                    return columnWidths;
                }
            }

            const measureColumnWidthItem =
                measureGroupDimension === "rows" ? columnWidth : filteredMeasureColumnWidthItem;
            if (
                matchesWidthItemFilters(filteredMeasureColumnWidthItem, filters, columnAttributes) &&
                widthItemLocatorsHaveProperLength(
                    measureColumnWidthItem,
                    measureLocalIdentifiers.length,
                    filteredColumnAttributeLocalIdentifiers.length,
                    measureGroupDimension,
                )
            ) {
                columnWidths.push(measureColumnWidthItem);
                return columnWidths;
            }
        } else if (isAttributeColumnWidthItem(columnWidth)) {
            if (
                rowAttributeLocalIdentifiers.includes(
                    columnWidth.attributeColumnWidthItem.attributeIdentifier,
                )
            ) {
                columnWidths.push(columnWidth);
                return columnWidths;
            }
        } else if (
            (isAllMeasureColumnWidthItem(columnWidth) || isWeakMeasureColumnWidthItem(columnWidth)) &&
            measureLocalIdentifiers.length > 0
        ) {
            columnWidths.push(columnWidth);
            return columnWidths;
        } else if (isSliceMeasureColumnWidthItem(columnWidth)) {
            const hasSameLocatorsAsMeasures = columnWidthLocatorsAndMeasuresHaveSameValues(
                columnWidth.sliceMeasureColumnWidthItem.locators,
                measureLocalIdentifiers,
            );

            if (hasSameLocatorsAsMeasures) {
                columnWidths.push(columnWidth);
            }
        } else if (isMixedValuesColumnWidthItem(columnWidth)) {
            const hasSameLocatorsAsMeasures = columnWidthLocatorsAndMeasuresHaveSameValues(
                columnWidth.mixedValuesColumnWidthItem.locators,
                measureLocalIdentifiers,
            );

            if (hasSameLocatorsAsMeasures) {
                columnWidths.push(columnWidth);
            }
        }

        return columnWidths;
    }, []);
};

export const adaptReferencePointWidthItemsToPivotTable = (
    originalColumnWidths: ColumnWidthItem[],
    measures: IBucketItem[],
    rowAttributes: IBucketItem[],
    columnAttributes: IBucketItem[],
    previousRowAttributes: IBucketItem[],
    previousColumnAttributes: IBucketItem[],
    filters: IBucketFilter[],
    measureGroupDimension: MeasureGroupDimension,
): ColumnWidthItem[] | undefined => {
    const measureLocalIdentifiers = measures.map((measure) => measure.localIdentifier);
    const rowAttributeLocalIdentifiers = rowAttributes.map((rowAttribute) => rowAttribute.localIdentifier);
    const columnAttributeLocalIdentifiers = columnAttributes.map(
        (columnAttribute) => columnAttribute.localIdentifier,
    );
    const previousRowAttributeLocalIdentifiers = previousRowAttributes.map(
        (rowAttribute) => rowAttribute.localIdentifier,
    );
    const previousColumnAttributeLocalIdentifiers = previousColumnAttributes.map(
        (columnAttribute) => columnAttribute.localIdentifier,
    );
    const filteredRowAttributeLocalIdentifiers = rowAttributeLocalIdentifiers.filter(
        (rowAttributeLocalIdentifier) =>
            !previousColumnAttributeLocalIdentifiers.includes(rowAttributeLocalIdentifier),
    );
    const filteredColumnAttributeLocalIdentifiers = columnAttributeLocalIdentifiers.filter(
        (columnAttributeLocalIdentifier) =>
            !previousRowAttributeLocalIdentifiers.includes(columnAttributeLocalIdentifier),
    );
    const firstColumnAttributeAdded = previousColumnAttributes.length === 0 && columnAttributes.length === 1;

    return adaptWidthItemsToPivotTable(
        originalColumnWidths,
        measureLocalIdentifiers,
        filteredRowAttributeLocalIdentifiers,
        filteredColumnAttributeLocalIdentifiers,
        filters,
        firstColumnAttributeAdded,
        columnAttributes,
        false,
        measureGroupDimension,
    );
};

export const adaptMdObjectWidthItemsToPivotTable = (
    originalColumnWidths: ColumnWidthItem[],
    insight: IInsightDefinition,
    measureGroupDimension?: MeasureGroupDimension,
): ColumnWidthItem[] | undefined => {
    const rowBucket = insightBucket(insight, BucketNames.ATTRIBUTE);
    const columnBucket = insightBucket(insight, BucketNames.COLUMNS);

    const measureLocalIdentifiers = insightMeasures(insight).map(measureLocalId);
    const rowAttributeLocalIdentifiers = rowBucket ? bucketAttributes(rowBucket).map(attributeLocalId) : [];
    const columnAttributeLocalIdentifiers = columnBucket
        ? bucketAttributes(columnBucket).map(attributeLocalId)
        : [];

    return adaptWidthItemsToPivotTable(
        originalColumnWidths,
        measureLocalIdentifiers,
        rowAttributeLocalIdentifiers,
        columnAttributeLocalIdentifiers,
        [],
        false,
        [],
        true,
        measureGroupDimension,
    );
};
