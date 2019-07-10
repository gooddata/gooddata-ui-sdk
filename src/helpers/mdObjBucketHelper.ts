// (C) 2019 GoodData Corporation
import get = require("lodash/get");
import isEmpty = require("lodash/isEmpty");
import { VisualizationObject } from "@gooddata/typings";

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

export function getIdentifierFromBucketsItem(
    bucket: VisualizationObject.IBucket[],
    bucketLocalIdentifier: string,
    type: string,
): string[] {
    const bucketItems = getBucketItems(bucket, bucketLocalIdentifier);
    return bucketItems.map(item => get(item, [type, "localIdentifier"]));
}
