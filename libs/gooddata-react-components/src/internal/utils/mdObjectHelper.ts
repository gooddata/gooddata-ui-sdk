// (C) 2019 GoodData Corporation
import * as BucketNames from "../../constants/bucketNames";
import { bucketsIsEmpty, bucketsItems, IInsight, insightBuckets } from "@gooddata/sdk-model";

export function haveManyViewItems(insight: IInsight): boolean {
    return bucketsItems(insightBuckets(insight, BucketNames.VIEW)).length > 1;
}

export function hasTertiaryMeasures(insight: IInsight): boolean {
    return !bucketsIsEmpty(insightBuckets(insight, BucketNames.TERTIARY_MEASURES));
}

export function isStacked(insight: IInsight): boolean {
    return !bucketsIsEmpty(insightBuckets(insight, BucketNames.STACK, BucketNames.SEGMENT));
}
