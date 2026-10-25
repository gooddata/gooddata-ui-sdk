// (C) 2020-2026 GoodData Corporation

import { createSelector } from "reselect";

import { type CatalogItem, type MetricType, isCatalogMeasure } from "@gooddata/sdk-model";
import { type ISeparators } from "@gooddata/sdk-ui";

import { getSeparators } from "../../../../selectors/bootstrap_selector.js";
import { getBucketItemsSelector } from "../../../../selectors/buckets_selector.js";
import {
    enableMetricFormatOverrides,
    getCurrencyFormatOverride,
    getFormattingDocumentationLink,
} from "../../../../selectors/feature_flag_selector.js";
import { getCatalogMeasures } from "../../../../store/catalog/catalog_selector.js";
import { type IRawBucketItem } from "../../../../typings/buckets.js";

export interface IMeasureNumberFormatStateProps {
    defaultCustomFormat: string | null;
    selectedFormat: string | null;
    separators: ISeparators;
    formattingDocumentationLink: string;
    /** Whether the "inherit" preset should be available (only for non-derived metrics) */
    inheritAvailable: boolean;
    /** The metric type from the catalog (e.g., "CURRENCY") */
    metricType: MetricType | undefined;
    /** Whether metric format overrides feature is enabled */
    enableMetricFormatOverrides: boolean;
    /** The currency format override from workspace settings */
    currencyFormatOverride: string | null;
}

function safeGetBucketItemFormat(item: IRawBucketItem): string | null {
    return item ? item.format || null : null;
}

function safeGetCatalogItemFormat(item: CatalogItem): string | null {
    return isCatalogMeasure(item) ? item.measure.format : null;
}

function safeGetCatalogItemMetricType(item: CatalogItem | undefined): MetricType | undefined {
    return isCatalogMeasure(item) ? item.measure.metricType : undefined;
}

export const makeMeasureNumberFormatSelector = (bucketItemLocalIdentifier: string) => {
    const getBucketItem = createSelector(getBucketItemsSelector, (bucketItems) =>
        bucketItems.find((item) => item.localIdentifier === bucketItemLocalIdentifier),
    );

    const getCatalogItem = createSelector(getCatalogMeasures, getBucketItem, (catalogMeasures, bucketItem) =>
        catalogMeasures.find((item) => item.measure.id === bucketItem?.attribute),
    );

    const getBucketItemFormat = createSelector(getBucketItem, safeGetBucketItemFormat);

    const getCatalogItemFormat = createSelector(getCatalogItem, safeGetCatalogItemFormat);

    const getCatalogItemMetricType = createSelector(getCatalogItem, safeGetCatalogItemMetricType);

    const getInheritAvailable = createSelector(getBucketItem, (bucketItem) =>
        Boolean(bucketItem && !bucketItem.operandLocalIdentifiers && !bucketItem.aggregation),
    );

    return createSelector(
        getBucketItemFormat,
        getCatalogItemFormat,
        getSeparators,
        getFormattingDocumentationLink,
        getInheritAvailable,
        getCatalogItemMetricType,
        enableMetricFormatOverrides,
        getCurrencyFormatOverride,
        (
            selectedFormat,
            defaultCustomFormat,
            separators,
            formattingDocumentationLink,
            inheritAvailable,
            metricType,
            isMetricFormatOverridesEnabled,
            currencyFormatOverrideValue,
        ): IMeasureNumberFormatStateProps => ({
            selectedFormat,
            defaultCustomFormat,
            separators,
            formattingDocumentationLink,
            inheritAvailable,
            metricType,
            enableMetricFormatOverrides: isMetricFormatOverridesEnabled,
            currencyFormatOverride: currencyFormatOverrideValue,
        }),
    );
};
