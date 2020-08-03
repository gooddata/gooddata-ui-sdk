// (C) 2020 GoodData Corporation
import includes from "lodash/includes";
import {
    ColumnWidthItem,
    IMeasureColumnWidthItem,
    isAbsoluteColumnWidth,
    isAllMeasureColumnWidthItem,
    isAttributeColumnWidthItem,
    isMeasureColumnWidthItem,
    isWeakMeasureColumnWidthItem,
    IWeakMeasureColumnWidthItem,
} from "@gooddata/sdk-ui-pivot";

import { IAttributeFilter, IBucketFilter, IBucketItem } from "../../../interfaces/Visualization";
import {
    attributeLocalId,
    bucketAttributes,
    IInsightDefinition,
    insightBucket,
    insightMeasures,
    isMeasureLocator,
    measureLocalId,
} from "@gooddata/sdk-model";
import { isAttributeFilter } from "../../../utils/bucketHelper";
import { BucketNames } from "@gooddata/sdk-ui";

const isMeasureWidthItemMatchedByFilter = (
    widthItem: IMeasureColumnWidthItem,
    filter: IAttributeFilter,
): boolean =>
    filter.selectedElements.some((selectedElement) =>
        widthItem.measureColumnWidthItem.locators.some(
            (locator) =>
                !isMeasureLocator(locator) && locator.attributeLocatorItem.element === selectedElement.uri,
        ),
    );

const matchesMeasureColumnWidthItemFilters = (
    widthItem: IMeasureColumnWidthItem,
    filters: IBucketFilter[],
): boolean =>
    filters.every((filter) => {
        if (isAttributeFilter(filter)) {
            const shouldBeMatched = !filter.isInverted;
            return shouldBeMatched === isMeasureWidthItemMatchedByFilter(widthItem, filter);
        }
        return true;
    });

const matchesWidthItemFilters = (widthItem: ColumnWidthItem, filters: IBucketFilter[]): boolean => {
    if (isMeasureColumnWidthItem(widthItem)) {
        return matchesMeasureColumnWidthItemFilters(widthItem, filters);
    }
    return true;
};

const containsMeasureLocator = (widthItem: IMeasureColumnWidthItem): boolean =>
    widthItem.measureColumnWidthItem.locators.some((locator) => isMeasureLocator(locator));

const widthItemLocatorsHaveProperLength = (
    widthItem: IMeasureColumnWidthItem,
    measuresCount: number,
    columnAttributesCount: number,
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

    return hasWidthItemLocators && (locatorsMatchesLength || locatorsAreEmpty);
};

function removeInvalidLocators(
    columnWidth: IMeasureColumnWidthItem,
    measureLocalIdentifiers: string[],
    columnAttributeLocalIdentifiers: string[],
) {
    return columnWidth.measureColumnWidthItem.locators.filter((locator) => {
        // filter out invalid measure locators
        if (isMeasureLocator(locator)) {
            return includes(measureLocalIdentifiers, locator.measureLocatorItem.measureIdentifier);
        }
        // filter out invalid column attribute locators
        return includes(columnAttributeLocalIdentifiers, locator.attributeLocatorItem.attributeIdentifier);
    });
}

function transformToWeakMeasureColumnWidthItem(
    columnWidth: IMeasureColumnWidthItem,
): IWeakMeasureColumnWidthItem {
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
}

// removes attribute widthItems with invalid identifiers
// removes measure widthItems with invalid identifiers and invalid number of locators
function adaptWidthItemsToPivotTable(
    originalColumnWidths: ColumnWidthItem[],
    measureLocalIdentifiers: string[],
    rowAttributeLocalIdentifiers: string[],
    columnAttributeLocalIdentifiers: string[],
    filters: IBucketFilter[],
    firstColumnAttributeAdded: boolean,
): ColumnWidthItem[] {
    const attributeLocalIdentifiers = [...rowAttributeLocalIdentifiers, ...columnAttributeLocalIdentifiers];

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

            if (firstColumnAttributeAdded) {
                const transformedWeakMeasureWidthItem = transformToWeakMeasureColumnWidthItem(columnWidth);
                if (transformedWeakMeasureWidthItem) {
                    return [...columnWidths, transformedWeakMeasureWidthItem];
                }
            }

            if (
                matchesWidthItemFilters(filteredMeasureColumnWidthItem, filters) &&
                widthItemLocatorsHaveProperLength(
                    filteredMeasureColumnWidthItem,
                    measureLocalIdentifiers.length,
                    columnAttributeLocalIdentifiers.length,
                )
            ) {
                return [...columnWidths, filteredMeasureColumnWidthItem];
            }
        } else if (isAttributeColumnWidthItem(columnWidth)) {
            if (
                includes(attributeLocalIdentifiers, columnWidth.attributeColumnWidthItem.attributeIdentifier)
            ) {
                return [...columnWidths, columnWidth];
            }
        } else if (
            (isAllMeasureColumnWidthItem(columnWidth) || isWeakMeasureColumnWidthItem(columnWidth)) &&
            measureLocalIdentifiers.length > 0
        ) {
            return [...columnWidths, columnWidth];
        }

        return columnWidths;
    }, []);
}

export function adaptReferencePointWidthItemsToPivotTable(
    originalColumnWidths: ColumnWidthItem[],
    measures: IBucketItem[],
    rowAttributes: IBucketItem[],
    columnAttributes: IBucketItem[],
    previousRowAttributes: IBucketItem[],
    previousColumnAttributes: IBucketItem[],
    filters: IBucketFilter[],
): ColumnWidthItem[] {
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
    );
}

export function adaptMdObjectWidthItemsToPivotTable(
    originalColumnWidths: ColumnWidthItem[],
    insight: IInsightDefinition,
): ColumnWidthItem[] {
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
    );
}
