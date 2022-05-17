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
    isRelativeDateFilter,
    ITotal,
    relativeDateFilterValues,
} from "@gooddata/sdk-model";
import isNil from "lodash/isNil";

import { PropMeta } from "../types";
import { bucketConversion, IInsightToPropConversion, insightConversion } from "./convertor";

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

/**
 * Utility function for creating bucket conversion for a single {@link @gooddata/sdk-model#IAttribute} item.
 */
export function singleAttributeBucketConversion<TProps extends object, TPropKey extends keyof TProps>(
    propName: TPropKey,
    bucketName: string,
): IInsightToPropConversion<TProps, TPropKey, IAttribute> {
    return bucketConversion(propName, sdkModelPropMetas.Attribute.Single, bucketName, bucketAttribute);
}

/**
 * Utility function for creating bucket conversion for multiple {@link @gooddata/sdk-model#IAttribute} items.
 */
export function multipleAttributesBucketConversion<TProps extends object, TPropKey extends keyof TProps>(
    propName: TPropKey,
    bucketName: string,
): IInsightToPropConversion<TProps, TPropKey, IAttribute[]> {
    return bucketConversion(propName, sdkModelPropMetas.Attribute.Multiple, bucketName, bucketAttributes);
}

/**
 * Utility function for creating bucket conversion for a single {@link @gooddata/sdk-model#IMeasure} item.
 */
export function singleMeasureBucketConversion<TProps extends object, TPropKey extends keyof TProps>(
    propName: TPropKey,
    bucketName: string,
): IInsightToPropConversion<TProps, TPropKey, IMeasure> {
    return bucketConversion(propName, sdkModelPropMetas.Measure.Single, bucketName, bucketMeasure);
}

/**
 * Utility function for creating bucket conversion for multiple {@link @gooddata/sdk-model#IMeasure} items.
 */
export function multipleMeasuresBucketConversion<TProps extends object, TPropKey extends keyof TProps>(
    propName: TPropKey,
    bucketName: string,
): IInsightToPropConversion<TProps, TPropKey, IMeasure[]> {
    return bucketConversion(propName, sdkModelPropMetas.Measure.Multiple, bucketName, bucketMeasures);
}

/**
 * Utility function for creating bucket conversion for a single {@link @gooddata/sdk-model#IAttributeOrMeasure} item.
 */
export function singleAttributeOrMeasureBucketConversion<
    TProps extends object,
    TPropKey extends keyof TProps,
>(propName: TPropKey, bucketName: string): IInsightToPropConversion<TProps, TPropKey, IAttributeOrMeasure> {
    return bucketConversion(
        propName,
        sdkModelPropMetas.AttributeOrMeasure.Single,
        bucketName,
        firstBucketItem,
    );
}

/**
 * Utility function for creating bucket conversion for multiple {@link @gooddata/sdk-model#IAttributeOrMeasure} items.
 */
export function multipleAttributesOrMeasuresBucketConversion<
    TProps extends object,
    TPropKey extends keyof TProps,
>(propName: TPropKey, bucketName: string): IInsightToPropConversion<TProps, TPropKey, IAttributeOrMeasure[]> {
    return bucketConversion(propName, sdkModelPropMetas.AttributeOrMeasure.Multiple, bucketName, bucketItems);
}

/**
 * Utility function for creating insight conversion for multiple {@link @gooddata/sdk-model#IFilter} items.
 */
export function filtersInsightConversion<TProps extends object, TPropKey extends keyof TProps>(
    propName: TPropKey,
): IInsightToPropConversion<TProps, TPropKey, IFilter[]> {
    return insightConversion(propName, sdkModelPropMetas.Filter.Multiple, (insight) => {
        const filters = insightFilters(insight) ?? [];
        return filters.filter((f) => {
            // get rid of the filters AD creates as All time: relative filter without boundaries
            if (isRelativeDateFilter(f)) {
                const { from, to } = relativeDateFilterValues(f);
                return !(isNil(from) || isNil(to));
            }
            return true;
        });
    });
}

/**
 * Utility function for creating insight conversion for multiple {@link @gooddata/sdk-model#ISortItem} items.
 */
export function sortsInsightConversion<TProps extends object, TPropKey extends keyof TProps>(
    propName: TPropKey,
): IInsightToPropConversion<TProps, TPropKey, ISortItem[]> {
    return insightConversion(propName, sdkModelPropMetas.SortItem.Multiple, insightSorts);
}

/**
 * Utility function for creating insight conversion for multiple {@link @gooddata/sdk-model#ITotal} items.
 */
export function totalsInsightConversion<TProps extends object, TPropKey extends keyof TProps>(
    propName: TPropKey,
): IInsightToPropConversion<TProps, TPropKey, ITotal[]> {
    return insightConversion(propName, sdkModelPropMetas.Total.Multiple, insightTotals);
}
