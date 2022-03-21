// (C) 2022 GoodData Corporation
import {
    bucketAttribute,
    bucketAttributes,
    bucketItems,
    bucketMeasure,
    bucketMeasures,
    IAttribute,
    IAttributeOrMeasure,
    IBucket,
    IFilter,
    IMeasure,
    insightFilters,
    insightSorts,
    insightTotals,
    ISortItem,
    ITotal,
} from "@gooddata/sdk-model";

import { PropMeta } from "../types";
import { bucketConversion, IBucketConversion, IInsightConversion, insightConversion } from "./convertor";

function namedSdkModelPropMetaFor(name: string, propType: PropMeta["cardinality"]): PropMeta {
    return {
        cardinality: propType,
        typeImport: {
            name,
            importType: "named",
            package: "@gooddata/sdk-model",
        },
    };
}

function namedSdkModelPropGroupMetaFor(name: string): { Single: PropMeta; Multiple: PropMeta } {
    return {
        Single: namedSdkModelPropMetaFor(name, "scalar"),
        Multiple: namedSdkModelPropMetaFor(name, "array"),
    };
}

const sdkModelPropMetas = {
    Measure: namedSdkModelPropGroupMetaFor("IMeasure"),
    Attribute: namedSdkModelPropGroupMetaFor("IAttribute"),
    AttributeOrMeasure: namedSdkModelPropGroupMetaFor("IAttributeOrMeasure"),
    Filter: namedSdkModelPropGroupMetaFor("IFilter"),
    SortItem: namedSdkModelPropGroupMetaFor("ISortItem"),
    Total: namedSdkModelPropGroupMetaFor("ITotal"),
};

function firstBucketItem(bucket: IBucket): IAttributeOrMeasure | undefined {
    return bucketItems(bucket)?.[0];
}

export function singleAttributeBucketConversion<TProps extends object, TPropKey extends keyof TProps>(
    propName: TPropKey,
    bucketName: string,
): IBucketConversion<TProps, TPropKey, IAttribute> {
    return bucketConversion(propName, sdkModelPropMetas.Attribute.Single, bucketName, bucketAttribute);
}

export function multipleAttributesBucketConversion<TProps extends object, TPropKey extends keyof TProps>(
    propName: TPropKey,
    bucketName: string,
): IBucketConversion<TProps, TPropKey, IAttribute[]> {
    return bucketConversion(propName, sdkModelPropMetas.Attribute.Multiple, bucketName, bucketAttributes);
}

export function singleMeasureBucketConversion<TProps extends object, TPropKey extends keyof TProps>(
    propName: TPropKey,
    bucketName: string,
): IBucketConversion<TProps, TPropKey, IMeasure> {
    return bucketConversion(propName, sdkModelPropMetas.Measure.Single, bucketName, bucketMeasure);
}

export function multipleMeasuresBucketConversion<TProps extends object, TPropKey extends keyof TProps>(
    propName: TPropKey,
    bucketName: string,
): IBucketConversion<TProps, TPropKey, IMeasure[]> {
    return bucketConversion(propName, sdkModelPropMetas.Measure.Multiple, bucketName, bucketMeasures);
}

export function singleAttributeOrMeasureBucketConversion<
    TProps extends object,
    TPropKey extends keyof TProps,
>(propName: TPropKey, bucketName: string): IBucketConversion<TProps, TPropKey, IAttributeOrMeasure> {
    return bucketConversion(
        propName,
        sdkModelPropMetas.AttributeOrMeasure.Single,
        bucketName,
        firstBucketItem,
    );
}

export function multipleAttributesOrMeasuresBucketConversion<
    TProps extends object,
    TPropKey extends keyof TProps,
>(propName: TPropKey, bucketName: string): IBucketConversion<TProps, TPropKey, IAttributeOrMeasure[]> {
    return bucketConversion(propName, sdkModelPropMetas.AttributeOrMeasure.Multiple, bucketName, bucketItems);
}

export function filtersInsightConversion<TProps extends object, TPropKey extends keyof TProps>(
    propName: TPropKey,
): IInsightConversion<TProps, TPropKey, IFilter[]> {
    return insightConversion(propName, sdkModelPropMetas.Filter.Multiple, insightFilters);
}

export function sortsInsightConversion<TProps extends object, TPropKey extends keyof TProps>(
    propName: TPropKey,
): IInsightConversion<TProps, TPropKey, ISortItem[]> {
    return insightConversion(propName, sdkModelPropMetas.SortItem.Multiple, insightSorts);
}

export function totalsInsightConversion<TProps extends object, TPropKey extends keyof TProps>(
    propName: TPropKey,
): IInsightConversion<TProps, TPropKey, ITotal[]> {
    return insightConversion(propName, sdkModelPropMetas.Total.Multiple, insightTotals);
}
