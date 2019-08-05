// (C) 2019 GoodData Corporation
import get = require("lodash/get");
import isEmpty = require("lodash/isEmpty");
import { VisualizationObject } from "@gooddata/typings";
import { SECONDARY_MEASURES } from "../constants/bucketNames";

export function findBucketByLocalIdentifier(
    buckets: VisualizationObject.IBucket[],
    bucketName: string,
): VisualizationObject.IBucket {
    return (buckets || []).find(bucket => bucket.localIdentifier === bucketName);
}

export function getBucketItems(
    buckets: VisualizationObject.IBucket[],
    localIdentifier: string,
): VisualizationObject.BucketItem[] {
    return get(findBucketByLocalIdentifier(buckets, localIdentifier), "items", []);
}

export function isBucketEmpty(buckets: VisualizationObject.IBucket[], bucketName: string): boolean {
    return isEmpty(getBucketItems(buckets, bucketName));
}

export function getSecondaryMeasuresLocalIdentifiers(buckets: VisualizationObject.IBucket[]): string[] {
    return getBucketItems(buckets, SECONDARY_MEASURES).map((item: VisualizationObject.BucketItem) =>
        get(item, "measure.localIdentifier"),
    );
}
