// (C) 2007-2026 GoodData Corporation

import { isEmpty } from "lodash-es";
import { type IntlShape, defineMessages } from "react-intl";

import {
    ArithmeticMeasureTitleFactory,
    DerivedMeasureTitleSuffixFactory,
    type IArithmeticMeasureTitleProps,
    type ILocale,
    type IMeasureTitleProps,
    type OverTimeComparisonType,
} from "@gooddata/sdk-ui";

import {
    getMasterLocalIdentifier,
    getOperandLocalIdentifiers,
    getOperator,
    isArithmeticMeasure,
    isComputedAttributeItem,
    isDerived,
} from "../models/bucket_item.js";
import { getAttributeByIdentifier } from "../models/decorated_bucket_item.js";
import { type ItemCacheNamespace, attributeCacheNamespace } from "../models/item_cache_lookup.js";
import { getMeasuresInBuckets } from "../store/buckets/buckets_read_helpers.js";
import { ArithmeticOperatorType } from "../typings/arithmetic_measure.js";
import { type IRawBucketItem, type IRawBucketItems, type IRawBuckets } from "../typings/buckets.js";
import { type IMeasuresDescriptions } from "../typings/measure_descriptions.js";
import { type ICatalogEntries, type ICatalogEntry } from "../typings/state_objects.js";

import { shortenText } from "./base.js";

const arithmeticMeasureMessages = defineMessages({
    sum_of: { id: "dashboard.bucket_item.arithmetic_measure.sum_of" },
    ratio_of: { id: "dashboard.bucket_item.arithmetic_measure.ratio_of" },
    difference_of: { id: "dashboard.bucket_item.arithmetic_measure.difference_of" },
    multiplication_of: { id: "dashboard.bucket_item.arithmetic_measure.multiplication_of" },
    change_of: { id: "dashboard.bucket_item.arithmetic_measure.change_of" },
    sum_of_incomplete: { id: "dashboard.bucket_item.arithmetic_measure.sum_of_incomplete" },
    ratio_of_incomplete: { id: "dashboard.bucket_item.arithmetic_measure.ratio_of_incomplete" },
    difference_of_incomplete: { id: "dashboard.bucket_item.arithmetic_measure.difference_of_incomplete" },
    multiplication_of_incomplete: {
        id: "dashboard.bucket_item.arithmetic_measure.multiplication_of_incomplete",
    },
    change_of_incomplete: { id: "dashboard.bucket_item.arithmetic_measure.change_of_incomplete" },
});

const aggregationMetricTitleMessages = defineMessages({
    count: { id: "aggregations.metric_title.count" },
    approximate_count: { id: "aggregations.metric_title.approximate_count" },
    sum: { id: "aggregations.metric_title.sum" },
    max: { id: "aggregations.metric_title.max" },
    min: { id: "aggregations.metric_title.min" },
    avg: { id: "aggregations.metric_title.avg" },
    runsum: { id: "aggregations.metric_title.runsum" },
    median: { id: "aggregations.metric_title.median" },
});

const MAX_TITLE_LENGTH = 1000;

const isMeasureFormattedAsPercentage = (
    measure: IRawBucketItem,
    measures: IRawBucketItems,
    itemCache: ICatalogEntries,
): boolean => {
    const aggregation = measure?.aggregation;
    const type = aggregation
        ? aggregation.includes("count") || aggregation.includes("approximate_count")
            ? "attribute"
            : "fact"
        : measure?.type;
    // A counted computed attribute is cached in its own namespace, so it is resolved there too -
    // otherwise its format is never found and the percentage check silently reads undefined.
    const namespace = type === "attribute" ? attributeCacheNamespace(isComputedAttributeItem(measure)) : type;
    const attribute = itemCache?.[`${namespace}.${measure?.attribute}`];
    if (isArithmeticMeasure(measure)) {
        const format = measure?.format;
        return format ? isPercentageFormat(format) : getOperator(measure) === ArithmeticOperatorType.CHANGE;
    }
    if (isDerived(measure)) {
        const measureDependenciesLocalIdentifier = getMeasureDependencies(measure)[0];
        const masterMeasure = measures.find(
            (bucketMeasure) => bucketMeasure?.localIdentifier === measureDependenciesLocalIdentifier,
        );
        return isMeasureFormattedAsPercentage(masterMeasure, measures, itemCache);
    }
    const format = measure?.format || attribute?.format;
    return isPercentageFormat(format);
};

export function isPercentageFormat(format: string) {
    return /[^\\]%/.test(format); // match "%" anywhere in the string if it is not preceded by "\"
}

export function getMeasuresDescriptions(
    buckets: IRawBuckets,
    itemCache: ICatalogEntries,
    intl: IntlShape,
): IMeasuresDescriptions {
    const result: IMeasuresDescriptions = {};

    const measures = getMeasuresInBuckets(buckets);

    let lastResultLength = -1;
    while (Object.keys(result).length !== lastResultLength) {
        lastResultLength = Object.keys(result).length;
        measures.forEach((measure: IRawBucketItem) => {
            const localIdentifier = measure?.localIdentifier;
            const measureDependenciesLocalIdentifiers = getMeasureDependencies(measure);
            const allDependenciesReady = measureDependenciesLocalIdentifiers.every(
                (dependencyLocalIdentifier: string) => result[dependencyLocalIdentifier] !== undefined,
            );
            if (allDependenciesReady) {
                const aggregation = measure?.aggregation;
                const type = aggregation
                    ? aggregation.includes("count") || aggregation.includes("approximate_count")
                        ? "attribute"
                        : "fact"
                    : measure?.type;
                // a computed attribute counted in a measure bucket keeps its own namespace
                const attribute = getAttributeByIdentifier(
                    measure?.attribute,
                    itemCache,
                    type === "attribute"
                        ? attributeCacheNamespace(isComputedAttributeItem(measure))
                        : (type as ItemCacheNamespace),
                );
                const title = getMeasureTitle(measure, result, attribute, intl);
                const alias = measure?.alias;
                const showInPercent = !!measure?.showInPercent;
                const isFormattedAsPercentage = isMeasureFormattedAsPercentage(measure, measures, itemCache);
                const format = measure?.format || attribute?.format;

                result[localIdentifier] = { alias, title, isFormattedAsPercentage, showInPercent, format };
            }
        });
    }

    return result;
}

function getMeasureDependencies(measure: IRawBucketItem): string[] {
    if (isDerived(measure)) {
        return [getMasterLocalIdentifier(measure)];
    } else if (isArithmeticMeasure(measure)) {
        return getOperandLocalIdentifiers(measure).filter(
            (measureLocalIdentifier: string) => measureLocalIdentifier !== null,
        );
    }

    return [];
}

function getMeasureTitle(
    measure: IRawBucketItem,
    measuresDescriptions: IMeasuresDescriptions,
    attribute: ICatalogEntry,
    intl: IntlShape,
): string {
    let title;
    if (isArithmeticMeasure(measure)) {
        title = getArithmeticMeasureTitle(measure, measuresDescriptions, intl);
    } else if (isDerived(measure)) {
        title = getDerivedMeasureTitle(measure, measuresDescriptions, intl);
    } else {
        title = getSimpleMeasureTitle(measure, attribute, intl);
    }

    return shortenText(title, { maxLength: MAX_TITLE_LENGTH });
}

function getArithmeticMeasureTitle(
    measure: IRawBucketItem,
    measuresDescriptions: IMeasuresDescriptions,
    intl: IntlShape,
): string {
    const operator = getOperator(measure) as ArithmeticOperatorType;
    const operandLocalIdentifiers = getOperandLocalIdentifiers(measure);
    const setOperands = operandLocalIdentifiers.filter((operand) => operand !== null);

    if (setOperands.length === 0) {
        return getEmptyArithmeticMeasureTitle(operator, intl);
    }
    if (setOperands.length === 1) {
        return getIncompleteArithmeticMeasureTitle(operator, setOperands, measuresDescriptions, intl);
    }

    return getValidArithmeticMeasureTitle(operator, operandLocalIdentifiers, measuresDescriptions, intl);
}

function getEmptyArithmeticMeasureTitle(operator: ArithmeticOperatorType, intl: IntlShape): string {
    const messageKey = `${operator}_of` as keyof typeof arithmeticMeasureMessages;
    return intl.formatMessage(arithmeticMeasureMessages[messageKey]);
}

function getIncompleteArithmeticMeasureTitle(
    operator: ArithmeticOperatorType,
    setOperands: string[],
    measuresDescriptions: IMeasuresDescriptions,
    intl: IntlShape,
): string {
    const measureDescriptions = measuresDescriptions[setOperands[0]];
    const measureTitle = measureDescriptions.alias || measureDescriptions.title;
    const messageKey = `${operator}_of_incomplete` as keyof typeof arithmeticMeasureMessages;
    return intl.formatMessage(arithmeticMeasureMessages[messageKey], { measure_title: measureTitle });
}

function getValidArithmeticMeasureTitle(
    operator: ArithmeticOperatorType,
    operandLocalIdentifiers: string[],
    measuresDescriptions: IMeasuresDescriptions,
    intl: IntlShape,
): string {
    const arithmeticMeasureProps: IArithmeticMeasureTitleProps = {
        operator,
        masterMeasureLocalIdentifiers: operandLocalIdentifiers,
    };

    const measureTitleProps: IMeasureTitleProps[] = operandLocalIdentifiers.map(
        (operandLocalIdentifier: string) => ({
            localIdentifier: operandLocalIdentifier,
            title: measuresDescriptions[operandLocalIdentifier].title,
            alias: measuresDescriptions[operandLocalIdentifier].alias,
        }),
    );

    const titleFactory = new ArithmeticMeasureTitleFactory(
        intl.locale as ILocale,
        intl.messages as Record<string, string>,
    );
    return titleFactory.getTitle(arithmeticMeasureProps, measureTitleProps);
}

function getDerivedMeasureTitle(
    measure: IRawBucketItem,
    measuresDescriptions: IMeasuresDescriptions,
    intl: IntlShape,
): string {
    const masterLocalIdentifier = getMasterLocalIdentifier(measure);

    const masterMeasureAlias = measuresDescriptions[masterLocalIdentifier].alias;
    const actualTitle = isEmpty(masterMeasureAlias)
        ? measuresDescriptions[masterLocalIdentifier].title
        : masterMeasureAlias;
    const overTimeComparisonType = measure?.overTimeComparisonType as OverTimeComparisonType;

    const suffixFactory = new DerivedMeasureTitleSuffixFactory(
        intl.locale as ILocale,
        intl.messages as Record<string, string>,
    );
    const overTimeComparisonSuffix = suffixFactory.getSuffix(overTimeComparisonType);

    return actualTitle + overTimeComparisonSuffix;
}

function getSimpleMeasureTitle(measure: IRawBucketItem, attribute: ICatalogEntry, intl: IntlShape): string {
    let title = attribute?.title ?? "";

    const aggregation = measure?.aggregation;
    if (aggregation) {
        const messageKey = aggregation as keyof typeof aggregationMetricTitleMessages;
        const message = aggregationMetricTitleMessages[messageKey];
        if (message) {
            title = intl.formatMessage(message, { title });
        }
    }
    if (measure?.showInPercent) {
        title = `% ${title}`;
    }

    return title;
}
