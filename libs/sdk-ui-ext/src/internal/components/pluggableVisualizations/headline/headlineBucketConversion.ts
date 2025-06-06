// (C) 2023-2025 GoodData Corporation
import {
    IInsightToPropConversion,
    PropMeta,
    sdkModelPropMetas,
} from "../../../utils/embeddingCodeGenerator/index.js";
import { bucketMeasure, bucketMeasures, IBucket, IMeasure, insightBucket } from "@gooddata/sdk-model";

export function singleSecondaryMeasureBucketConversion<TProps extends object, TPropKey extends keyof TProps>(
    propName: TPropKey,
    bucketName: string,
): IInsightToPropConversion<TProps, TPropKey, IMeasure> {
    return bucketConversion(propName, sdkModelPropMetas.Measure.Single, bucketName, bucketMeasure);
}

export function multipleSecondaryMeasuresBucketConversion<
    TProps extends object,
    TPropKey extends keyof TProps,
>(propName: TPropKey, bucketName: string): IInsightToPropConversion<TProps, TPropKey, IMeasure[]> {
    return bucketConversion(propName, sdkModelPropMetas.Measure.Multiple, bucketName, bucketMeasures);
}

export function bucketConversion<
    TProps extends object,
    TPropKey extends keyof TProps,
    TReturnType = TProps[TPropKey],
>(
    propName: TPropKey,
    propType: PropMeta,
    bucketName: string,
    bucketItemAccessor: (bucket: IBucket) => TReturnType,
): IInsightToPropConversion<TProps, TPropKey, TReturnType> {
    return {
        propName,
        propType,
        itemAccessor(insight) {
            const bucket = insightBucket(insight, bucketName);
            return bucket && bucketItemAccessor(bucket);
        },
    };
}
