// (C) 2023 GoodData Corporation
import {
    IInsightToPropConversion,
    PropMeta,
    sdkModelPropMetas,
} from "../../../utils/embeddingCodeGenerator/index.js";
import { bucketMeasure, bucketMeasures, IBucket, IMeasure, insightBucket } from "@gooddata/sdk-model";
import { IEmbeddingCodeContext } from "../../../interfaces/VisualizationDescriptor.js";

export function singleSecondaryMeasureBucketConversion<TProps extends object, TPropKey extends keyof TProps>(
    propName: TPropKey,
    bucketName: string,
): IInsightToPropConversion<TProps, TPropKey, IMeasure> {
    return bucketConversion(
        propName,
        sdkModelPropMetas.Measure.Single,
        bucketName,
        (ctx) => !ctx?.settings?.enableNewHeadline,
        bucketMeasure,
    );
}

export function multipleSecondaryMeasuresBucketConversion<
    TProps extends object,
    TPropKey extends keyof TProps,
>(propName: TPropKey, bucketName: string): IInsightToPropConversion<TProps, TPropKey, IMeasure[]> {
    return bucketConversion(
        propName,
        sdkModelPropMetas.Measure.Multiple,
        bucketName,
        (ctx) => ctx?.settings?.enableNewHeadline,
        bucketMeasures,
    );
}

export function bucketConversion<
    TProps extends object,
    TPropKey extends keyof TProps,
    TReturnType = TProps[TPropKey],
>(
    propName: TPropKey,
    propType: PropMeta,
    bucketName: string,
    isSettingEnabled: (ctx: IEmbeddingCodeContext) => boolean,
    bucketItemAccessor: (bucket: IBucket) => TReturnType,
): IInsightToPropConversion<TProps, TPropKey, TReturnType> {
    return {
        propName,
        propType,
        itemAccessor(insight, ctx) {
            const bucket = insightBucket(insight, bucketName);
            return isSettingEnabled(ctx) && bucket && bucketItemAccessor(bucket);
        },
    };
}
