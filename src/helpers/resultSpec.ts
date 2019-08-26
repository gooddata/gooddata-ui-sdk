// (C) 2007-2018 GoodData Corporation
import { VisualizationObject, AFM } from "@gooddata/typings";

import { generateStackedDimensions, generateDefaultDimensions, isStackedChart } from "./dimensions";
import { convertBucketsToAFM } from "./conversion";

const generateDefaultDimensionsFromBuckets = (buckets: VisualizationObject.IBucket[]) =>
    generateDefaultDimensions(convertBucketsToAFM(buckets));

const copySortItem = (sortByItem: AFM.SortItem): AFM.SortItem => {
    if (AFM.isAttributeSortItem(sortByItem)) {
        return {
            attributeSortItem: sortByItem.attributeSortItem,
        };
    }
    return {
        measureSortItem: sortByItem.measureSortItem,
    };
};

export function getResultSpec(
    buckets: VisualizationObject.IBucket[],
    sortBy: AFM.SortItem[] = null,
    getDimensions: (
        buckets: VisualizationObject.IBucket[],
    ) => AFM.IDimension[] = generateDefaultDimensionsFromBuckets,
): AFM.IResultSpec {
    const resultSpec: AFM.IResultSpec = {
        dimensions: getDimensions(buckets),
    };

    if (sortBy && sortBy.length) {
        resultSpec.sorts = sortBy.map(copySortItem);
    }

    return resultSpec;
}

export function getStackingResultSpec(
    buckets: VisualizationObject.IBucket[],
    sortBy: AFM.SortItem[] = null,
): AFM.IResultSpec {
    const getDimensions = isStackedChart(buckets) ? generateStackedDimensions : undefined;
    return getResultSpec(buckets, sortBy, getDimensions);
}
