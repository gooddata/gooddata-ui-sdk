// (C) 2007-2026 GoodData Corporation

import { isEqual } from "lodash-es";
import { type IntlShape, defineMessages } from "react-intl";
import { createSelector, createStructuredSelector } from "reselect";

const bucketItemTypeMessages = defineMessages({
    attribute: { id: "bucket_item_types.attribute" },
    geo_attribute: { id: "bucket_item_types.geo_attribute" },
    date: { id: "bucket_item_types.date" },
    fact: { id: "bucket_item_types.fact" },
    metric: { id: "bucket_item_types.metric" },
});

const exportUnsupportedMessages = defineMessages({
    metric_date_filter: { id: "export_unsupported.metric_date_filter" },
    renaming: { id: "export_unsupported.renaming" },
    compare_enabled: { id: "export_unsupported.compare_enabled" },
    arithmetic_measure: { id: "export_unsupported.arithmetic_measure" },
    dual_axes: { id: "export_unsupported.dual_axes" },
    unsupportedInsightType: { id: "export_unsupported.unsupportedInsightType" },
    measure_value_filter: { id: "export_unsupported.measure_value_filter" },
    ranking_filter: { id: "export_unsupported.ranking_filter" },
});

import { isDerivedFrom } from "../models/bucket_item.js";
import {
    bucketsHaveMetricsWithDateFilter,
    isAllMeasuresShowOnPrimaryAxis,
    isDerivedMeasurePresent,
} from "../services/buckets_service.js";
import { getReportTitle } from "../services/report_service.js";
import { areBucketsEmpty } from "../store/buckets/helpers/bucket_item_predicates.js";
import {
    getFilterItems,
    hasMeasureValueFilter,
    hasRankingFilter,
} from "../store/filter_bar/filter_bar_selector.js";
import { filterHasTextFilterAll } from "../store/filter_bar/filter_bar_types.js";
import {
    getOpenAsReportWarningMessage,
    isOpenAsReportSupported,
} from "../store/reference_point/extended_reference_point_selectors.js";
import { type IAppState } from "../store/types.js";
import {
    type IDecoratedBucket,
    type IDecoratedBucketItem,
    type IDecoratedBuckets,
    type IRawBucketItem,
} from "../typings/buckets.js";
import { type ICatalogEntry } from "../typings/state_objects.js";

import { getDecoratedBuckets, isArithmeticMeasurePresent } from "./buckets_selector.js";
import { hasReportError, isReportOpening, isReportSaving } from "./export_selector.js";

function getExportUnsupportedTextProvider(messageKey: keyof typeof exportUnsupportedMessages) {
    return function exportUnsupportedTextProvider(intl: IntlShape): string {
        return intl.formatMessage(exportUnsupportedMessages[messageKey]);
    };
}

function excludeFilterAll(metric: IDecoratedBucketItem) {
    return {
        ...metric,
        // `allSelected` exists only on the attribute-filter arm of the union; on a date filter it
        // was `undefined`, so the `in` check preserves the original falsy behaviour exactly
        filters: metric.filters.filter(
            (filter) => !("allSelected" in filter && filter.allSelected) && !filterHasTextFilterAll(filter),
        ),
    };
}

function findDuplicated(decoratedBuckets: IDecoratedBuckets, type: string) {
    const items = decoratedBuckets
        .reduce((acc: IDecoratedBucketItem[], decoratedBucket) => acc.concat(decoratedBucket.items), [])
        .filter((item) => item.original?.type === type);

    const isAttributeEqual = (attribute: IDecoratedBucketItem, other: IDecoratedBucketItem) =>
        attribute.attribute === other.attribute;
    const isAggregationEqual = (metric: IDecoratedBucketItem, other: IDecoratedBucketItem) =>
        metric.aggregation === other.aggregation;
    const areFiltersEquals = (metric: IDecoratedBucketItem, other: IDecoratedBucketItem) =>
        isEqual(excludeFilterAll(metric).filters, excludeFilterAll(other).filters);
    const isMasterDerivedRelation = (item1: IRawBucketItem, item2: IRawBucketItem) =>
        isDerivedFrom(item1, item2) || isDerivedFrom(item2, item1);

    return items.find((item1, key1) =>
        items.find(
            (item2, key2) =>
                isAggregationEqual(item1, item2) &&
                isAttributeEqual(item1, item2) &&
                areFiltersEquals(item1, item2) &&
                !isMasterDerivedRelation(item1.original, item2.original) &&
                key1 !== key2,
        ),
    );
}

function findDuplicatedMetric(decoratedBuckets: IDecoratedBuckets) {
    return findDuplicated(decoratedBuckets, "metric");
}

function findDuplicatedAttribute(decoratedBuckets: IDecoratedBuckets) {
    return findDuplicated(decoratedBuckets, "attribute");
}

function getDuplicatedObject(decoratedBuckets: IDecoratedBuckets): ICatalogEntry | null {
    const duplicatedBucketItem =
        findDuplicatedMetric(decoratedBuckets) || findDuplicatedAttribute(decoratedBuckets);
    return duplicatedBucketItem ? duplicatedBucketItem.attribute : null;
}

function isMetricDateFilterUsed(state: IAppState) {
    return bucketsHaveMetricsWithDateFilter(state);
}

function containsAlias(decoratedBucket: IDecoratedBucket) {
    return decoratedBucket.items.some((item) => {
        return item.original?.alias;
    });
}

function isAliasUsedInBuckets(decoratedBuckets: IDecoratedBuckets) {
    return decoratedBuckets.some(containsAlias);
}

function getOpenAsReportUiConfigSupport(state: IAppState) {
    return isOpenAsReportSupported(state);
}

function getOpenAsReportUiConfigWarningMessage(state: IAppState) {
    return getOpenAsReportWarningMessage(state);
}

function getStaticTextProvider(text: string) {
    return function staticTextProvider(): string {
        return text;
    };
}

function getDuplicatedObjectTextProvider(duplicatedObject: ICatalogEntry) {
    return function duplicatedObjectTextProvider(intl: IntlShape) {
        const title = duplicatedObject.title;
        const type = duplicatedObject.type as keyof typeof bucketItemTypeMessages;
        const typeMessage = bucketItemTypeMessages[type];
        return intl.formatMessage(
            {
                id: "export_unsupported.duplicated_metric",
            },
            {
                title,
                type: typeMessage ? intl.formatMessage(typeMessage) : type,
            },
        );
    };
}

export const getBubbleTextProvider = createSelector(
    getDecoratedBuckets,
    getOpenAsReportUiConfigSupport,
    getOpenAsReportUiConfigWarningMessage,
    isAllMeasuresShowOnPrimaryAxis,
    isArithmeticMeasurePresent,
    isDerivedMeasurePresent,
    isMetricDateFilterUsed,
    hasMeasureValueFilter,
    hasRankingFilter,
    (
        decoratedBuckets,
        openAsReportUiConfigSupported,
        openAsReportUiConfigSupportedMessage,
        allMeasuresShowOnPrimaryAxis,
        arithmeticMeasurePresent,
        derivedMeasurePresent,
        metricDateFilterUsed,
        measureValueFilterUsed,
        rankingFilterUsed,
    ) => {
        const duplicatedObject = getDuplicatedObject(decoratedBuckets);
        const aliasUsedInBuckets = isAliasUsedInBuckets(decoratedBuckets);

        let bubbleTextProvider;
        if (metricDateFilterUsed) {
            bubbleTextProvider = getExportUnsupportedTextProvider("metric_date_filter");
        } else if (aliasUsedInBuckets) {
            bubbleTextProvider = getExportUnsupportedTextProvider("renaming");
        } else if (derivedMeasurePresent) {
            bubbleTextProvider = getExportUnsupportedTextProvider("compare_enabled");
        } else if (arithmeticMeasurePresent) {
            bubbleTextProvider = getExportUnsupportedTextProvider("arithmetic_measure");
        } else if (!allMeasuresShowOnPrimaryAxis) {
            bubbleTextProvider = getExportUnsupportedTextProvider("dual_axes");
        } else if (!openAsReportUiConfigSupported) {
            bubbleTextProvider = openAsReportUiConfigSupportedMessage
                ? getStaticTextProvider(openAsReportUiConfigSupportedMessage)
                : getExportUnsupportedTextProvider("unsupportedInsightType");
        } else if (duplicatedObject) {
            bubbleTextProvider = getDuplicatedObjectTextProvider(duplicatedObject);
        } else if (measureValueFilterUsed) {
            bubbleTextProvider = getExportUnsupportedTextProvider("measure_value_filter");
        } else if (rankingFilterUsed) {
            bubbleTextProvider = getExportUnsupportedTextProvider("ranking_filter");
        }
        return bubbleTextProvider;
    },
);

export const isReportReady = createSelector(
    hasReportError,
    isReportSaving,
    isReportOpening,
    (reportError, reportSaving, reportOpening) => {
        return !reportError && !reportSaving && !reportOpening;
    },
);

export const getIsExportDisabled = createSelector(
    getDecoratedBuckets,
    getFilterItems,
    getOpenAsReportUiConfigSupport,
    isAllMeasuresShowOnPrimaryAxis,
    isArithmeticMeasurePresent,
    isDerivedMeasurePresent,
    isMetricDateFilterUsed,
    isReportReady,
    hasMeasureValueFilter,
    hasRankingFilter,
    (
        decoratedBuckets,
        filters,
        openAsReportUiConfigSupported,
        allMeasuresShowOnPrimaryAxis,
        arithmeticMeasurePresent,
        derivedMeasurePresent,
        metricDateFilterUsed,
        reportReady,
        measureValueFilterUsed,
        rankingFilterUsed,
    ) => {
        const duplicatedObject = getDuplicatedObject(decoratedBuckets);
        const aliasUsedInBuckets = isAliasUsedInBuckets(decoratedBuckets);

        return (
            (areBucketsEmpty(decoratedBuckets) && filters.length === 0) ||
            metricDateFilterUsed ||
            aliasUsedInBuckets ||
            derivedMeasurePresent ||
            arithmeticMeasurePresent ||
            !!duplicatedObject ||
            !openAsReportUiConfigSupported ||
            !reportReady ||
            !allMeasuresShowOnPrimaryAxis ||
            measureValueFilterUsed ||
            rankingFilterUsed
        );
    },
);

export const exportButtonSelector = createStructuredSelector({
    bubbleTextProvider: getBubbleTextProvider,
    currentReportTitle: getReportTitle,
    isExportDisabled: getIsExportDisabled,
});
