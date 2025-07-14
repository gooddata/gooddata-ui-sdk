// (C) 2025 GoodData Corporation

import { BucketNames } from "@gooddata/sdk-ui";
import { ISettings } from "@gooddata/sdk-model";
import { MeasureGroupDimension } from "@gooddata/sdk-ui-pivot";
import { IBucketItem, IBucketOfFun, IExtendedReferencePoint } from "../../../interfaces/Visualization.js";
import { ATTRIBUTE, DATE } from "../../../constants/bucket.js";
import { getItemsFromBuckets } from "../../../utils/bucketHelper.js";

export const multipleDatesEnabled = (settings: ISettings): boolean => {
    return settings.enableMultipleDates === true;
};

export const tableTranspositionEnabled = (settings: ISettings): boolean => {
    return settings.enablePivotTableTransposition === true;
};

export const tableColumnHeadersPositionEnabled = (settings: ISettings): boolean => {
    return settings.enableColumnHeadersPosition === true;
};

export const tableSortingCheckDisabled = (settings: ISettings): boolean => {
    return settings.tableSortingCheckDisabled === true;
};

export const isManualResizingEnabled = (settings: ISettings): boolean => {
    return settings.enableTableColumnsManualResizing === true;
};

export const shouldAdjustColumnHeadersPositionToTop = (
    newReferencePoint: IExtendedReferencePoint,
    rowAttributes: IBucketItem[],
    measureGroupDimension: MeasureGroupDimension,
): boolean => {
    return (
        newReferencePoint.properties?.controls?.columnHeadersPosition &&
        (rowAttributes.length > 0 || measureGroupDimension === "columns")
    );
};

export const getColumnAttributes = (buckets: IBucketOfFun[]): IBucketItem[] => {
    return getItemsFromBuckets(
        buckets,
        [BucketNames.COLUMNS, BucketNames.STACK, BucketNames.SEGMENT],
        [ATTRIBUTE, DATE],
    );
};

export const getRowAttributes = (buckets: IBucketOfFun[]): IBucketItem[] => {
    return getItemsFromBuckets(
        buckets,
        [
            BucketNames.ATTRIBUTE,
            BucketNames.ATTRIBUTES,
            BucketNames.ATTRIBUTE_FROM,
            BucketNames.ATTRIBUTE_TO,
            BucketNames.VIEW,
            BucketNames.TREND,
            BucketNames.LOCATION,
        ],
        [ATTRIBUTE, DATE],
    );
};
