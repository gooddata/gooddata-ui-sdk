// (C) 2007-2026 GoodData Corporation

import { decoratedBuckets } from "../models/decorated_bucket.js";
import { type IExtendedRefPointBucketsUiConfig } from "../store/reference_point/extended_reference_point_state.js";
import { itemCache, selectedDateDatasets } from "../tests/constants.test.helpers.js";
import { type IDecoratedBucket, type IDecoratedBuckets, type IRawBuckets } from "../typings/buckets.js";
import { mockIntlProp } from "../utils/with_intl.js";

export function createDecoratedBucketsMock(
    buckets: IRawBuckets,
    uiSettings: IExtendedRefPointBucketsUiConfig | undefined = {},
): IDecoratedBuckets {
    const emptyBucketsMeta = {};
    const mockIntl = mockIntlProp();

    return decoratedBuckets(
        buckets,
        emptyBucketsMeta,
        itemCache,
        selectedDateDatasets,
        uiSettings,
        {},
        mockIntl,
    );
}

export function createDecoratedBucketMock(buckets: IRawBuckets, bucketIndex = 0): IDecoratedBucket {
    return createDecoratedBucketsMock(buckets)[bucketIndex];
}
