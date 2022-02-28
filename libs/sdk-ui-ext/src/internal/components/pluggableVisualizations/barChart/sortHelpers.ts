// (C) 2022 GoodData Corporation
import {
    ILocatorItem,
    isAttributeAreaSort,
    isAttributeSort,
    isMeasureSort,
    ISortItem,
    sortMeasureLocators,
} from "@gooddata/sdk-model";

import { BucketNames } from "@gooddata/sdk-ui";
import { IAxisConfig } from "@gooddata/sdk-ui-charts";
import isEqual from "lodash/isEqual";

import { IAvailableSortsGroup } from "../../../interfaces/SortConfig";
import { IReferencePoint } from "../../../interfaces/Visualization";
import { getBucketItems } from "../../../utils/bucketHelper";

function areAllMeasuresOnSingleAxis(
    buckets: IReferencePoint["buckets"],
    secondaryAxis: IAxisConfig,
): boolean {
    const measures = getBucketItems(buckets, BucketNames.MEASURES);
    const measureCount = measures.length;
    const numberOfMeasureOnSecondaryAxis = secondaryAxis.measures?.length ?? 0;
    return numberOfMeasureOnSecondaryAxis === 0 || measureCount === numberOfMeasureOnSecondaryAxis;
}

export function canSortStackTotalValue(
    buckets: IReferencePoint["buckets"],
    properties: IReferencePoint["properties"],
): boolean {
    const supportedControls = properties?.controls;
    const stackMeasures = supportedControls?.stackMeasures ?? false;
    const secondaryAxis: IAxisConfig = supportedControls?.secondary_xaxis ?? { measures: [] };
    const allMeasuresOnSingleAxis = areAllMeasuresOnSingleAxis(buckets, secondaryAxis);

    return stackMeasures && allMeasuresOnSingleAxis;
}

function validateAreaSort(areaSort: ISortItem, availableSort: IAvailableSortsGroup) {
    return (
        isAttributeAreaSort(areaSort) &&
        availableSort &&
        areaSort.attributeSortItem.attributeIdentifier === availableSort.itemId.localIdentifier &&
        availableSort.attributeSort?.areaSortEnabled
    );
}

function validateAttributeSort(attributeSort: ISortItem, availableSort: IAvailableSortsGroup) {
    return (
        isAttributeSort(attributeSort) &&
        availableSort &&
        attributeSort.attributeSortItem.attributeIdentifier === availableSort.itemId.localIdentifier &&
        availableSort.attributeSort?.normalSortEnabled
    );
}

function validateMeasureSortLocators(sortLocators: ILocatorItem[], availableLocators: ILocatorItem[]) {
    return (
        sortLocators.length === availableLocators.length &&
        sortLocators.every((sortLocator, index) => isEqual(sortLocator, availableLocators[index]))
    );
}

function validateMeasureSort(measureSort: ISortItem, availableSort: IAvailableSortsGroup) {
    return (
        isMeasureSort(measureSort) &&
        availableSort &&
        !!availableSort.metricSorts?.find((availableMetricSort) =>
            validateMeasureSortLocators(availableMetricSort.locators, sortMeasureLocators(measureSort)),
        )
    );
}

export function validateCurrentSorts(
    currentSort: ISortItem[],
    availableSorts: IAvailableSortsGroup[],
): boolean[] {
    return currentSort.map((sortItem, index) => {
        if (isAttributeAreaSort(sortItem)) {
            return validateAreaSort(sortItem, availableSorts[index]);
        }
        if (isAttributeSort(sortItem)) {
            return validateAttributeSort(sortItem, availableSorts[index]);
        }
        if (isMeasureSort(sortItem)) {
            return validateMeasureSort(sortItem, availableSorts[index]);
        }
        return false;
    });
}
