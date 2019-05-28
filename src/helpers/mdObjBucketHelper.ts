// (C) 2019 GoodData Corporation
import get = require("lodash/get");
import { VisualizationObject } from "@gooddata/typings";

export function findBucketByLocalIdentifier(buckets: VisualizationObject.IBucket[], bucketName: string) {
    return (buckets || []).find(bucket => bucket.localIdentifier === bucketName);
}

export function getBucketItems(
    buckets: VisualizationObject.IBucket[],
    localIdentifier: string,
): VisualizationObject.BucketItem[] {
    return get(findBucketByLocalIdentifier(buckets, localIdentifier), "items", []);
}
