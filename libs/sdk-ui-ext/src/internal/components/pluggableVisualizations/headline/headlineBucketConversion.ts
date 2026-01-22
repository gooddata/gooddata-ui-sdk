// (C) 2023-2026 GoodData Corporation

import {
    type IBucket,
    type IMeasure,
    bucketMeasure,
    bucketMeasures,
    insightBucket,
} from "@gooddata/sdk-model";

import { sdkModelPropMetas } from "../../../utils/embeddingCodeGenerator/insightToPropsConverter/convenience.js";
import { type IInsightToPropConversion } from "../../../utils/embeddingCodeGenerator/insightToPropsConverter/convertor.js";
import { type PropMeta } from "../../../utils/embeddingCodeGenerator/types.js";

export function singleSecondaryMeasureBucketConversion<TProps extends object, TPropKey extends keyof TProps>(
    propName: TPropKey,
    bucketName: string,
): IInsightToPropConversion<TProps, TPropKey, IMeasure | undefined> {
    return bucketConversion(propName, sdkModelPropMetas.Measure.Single, bucketName, false, bucketMeasure);
}

export function multipleSecondaryMeasuresBucketConversion<
    TProps extends object,
    TPropKey extends keyof TProps,
>(
    propName: TPropKey,
    bucketName: string,
): IInsightToPropConversion<TProps, TPropKey, IMeasure[] | undefined> {
    return bucketConversion(propName, sdkModelPropMetas.Measure.Multiple, bucketName, true, bucketMeasures);
}

export function bucketConversion<
    TProps extends object,
    TPropKey extends keyof TProps,
    TReturnType = TProps[TPropKey],
>(
    propName: TPropKey,
    propType: PropMeta,
    bucketName: string,
    shouldProcessBucketItem: boolean,
    bucketItemAccessor: (bucket: IBucket) => TReturnType,
): IInsightToPropConversion<TProps, TPropKey, TReturnType | undefined> {
    return {
        propName,
        propType,
        itemAccessor(insight) {
            const bucket = insightBucket(insight, bucketName);
            return shouldProcessBucketItem && bucket ? bucketItemAccessor(bucket) : undefined;
        },
    };
}
