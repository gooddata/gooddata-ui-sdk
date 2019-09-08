// (C) 2007-2018 GoodData Corporation
import isEmpty = require("lodash/isEmpty");
import { DESC } from "../constants/sort";
import {
    bucketAttributes,
    IBucket,
    IInsight,
    IMeasure,
    insightBucket,
    insightMeasures,
    newAttributeSort,
    newMeasureSort,
    SortItem,
} from "@gooddata/sdk-model";
import { BucketNames } from "../index";
import { SORT_DIR_ASC } from "../internal/constants/sort";

export function getDefaultTreemapSortFromBuckets(
    viewBy: IBucket,
    segmentBy: IBucket,
    measures: IMeasure[],
): SortItem[] {
    const viewAttr = bucketAttributes(viewBy);
    const stackAttr = bucketAttributes(segmentBy);

    if (!isEmpty(viewAttr) && !isEmpty(stackAttr)) {
        return [newAttributeSort(viewAttr[0], SORT_DIR_ASC), ...measures.map(m => newMeasureSort(m, DESC))];
    }

    return [];
}

export function getDefaultTreemapSort(insight: IInsight): SortItem[] {
    return getDefaultTreemapSortFromBuckets(
        insightBucket(insight, BucketNames.VIEW),
        insightBucket(insight, BucketNames.SEGMENT),
        insightMeasures(insight),
    );
}
