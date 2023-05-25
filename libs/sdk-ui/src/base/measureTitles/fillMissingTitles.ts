// (C) 2007-2022 GoodData Corporation
import {
    IInsightDefinition,
    IAttributeOrMeasure,
    isMeasure,
    IMeasure,
    insightMeasures,
    measureMasterIdentifier,
    isPoPMeasure,
    isPreviousPeriodMeasure,
    isArithmeticMeasure,
    isSimpleMeasure,
    measureLocalId,
    measureAlias,
    measureTitle,
    measureArithmeticOperands,
    measureArithmeticOperator,
    insightModifyItems,
    modifyMeasure,
} from "@gooddata/sdk-model";
import { stringUtils } from "@gooddata/util";

import { DerivedMeasureTitleSuffixFactory } from "./DerivedMeasureTitleSuffixFactory.js";
import { ArithmeticMeasureTitleFactory } from "./ArithmeticMeasureTitleFactory.js";
import { OverTimeComparisonType, OverTimeComparisonTypes } from "../interfaces/OverTimeComparison.js";
import { IMeasureTitleProps } from "./MeasureTitle.js";
import { ILocale } from "../localization/Locale.js";

const DEFAULT_MAX_ARITHMETIC_MEASURE_TITLE_LENGTH = 50;

function findOverTimeComparisonType(measure: IMeasure): OverTimeComparisonType {
    if (isPoPMeasure(measure)) {
        return OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR;
    } else if (isPreviousPeriodMeasure(measure)) {
        return OverTimeComparisonTypes.PREVIOUS_PERIOD;
    }
    return OverTimeComparisonTypes.NOTHING;
}

function containsMeasureTitleItem(measureTitleProps: IMeasureTitleProps[], localIdentifier: string): boolean {
    return measureTitleProps.some((prop) => prop.localIdentifier === localIdentifier);
}

function containsMeasureTitleItems(
    measureTitleProps: IMeasureTitleProps[],
    localIdentifiers: string[],
): boolean {
    return localIdentifiers.every((identifier) => containsMeasureTitleItem(measureTitleProps, identifier));
}

function findMeasureTitleItem(
    measureTitles: IMeasureTitleProps[],
    localIdentifier: string,
): IMeasureTitleProps | null {
    return measureTitles.find((prop) => prop.localIdentifier === localIdentifier) || null;
}

function findTitleForDerivedMeasure(
    measure: IMeasure,
    measureTitleProps: IMeasureTitleProps[],
    suffixFactory: DerivedMeasureTitleSuffixFactory,
): string | undefined {
    const masterMeasureIdentifier = measureMasterIdentifier(measure);
    if (!masterMeasureIdentifier) {
        return undefined;
    }

    const measureProps = findMeasureTitleItem(measureTitleProps, masterMeasureIdentifier);
    if (measureProps === null) {
        return undefined;
    }

    const derivedMeasureTitleBase = measureProps.alias || measureProps.title || "";
    const overTimeComparisonType = findOverTimeComparisonType(measure);
    return derivedMeasureTitleBase + suffixFactory.getSuffix(overTimeComparisonType);
}

function buildMeasureTitle(measure: IMeasure): IMeasureTitleProps | null {
    if (isSimpleMeasure(measure)) {
        const alias = measureAlias(measure);
        const localIdentifier = measureLocalId(measure);
        const title = measureTitle(measure);

        return {
            localIdentifier,
            title,
            alias,
        };
    }

    return null;
}

function buildArithmeticMeasureTitle(
    measure: IMeasure,
    measureTitleProps: IMeasureTitleProps[],
    titleFactory: ArithmeticMeasureTitleFactory,
    maxArithmeticMeasureTitleLength: number,
): IMeasureTitleProps | null {
    if (isArithmeticMeasure(measure)) {
        const alias = measureAlias(measure);
        const localIdentifier = measureLocalId(measure);
        const measureIdentifiers = measureArithmeticOperands(measure)!;
        const operator = measureArithmeticOperator(measure)!;

        if (containsMeasureTitleItems(measureTitleProps, measureIdentifiers)) {
            const fullLengthTitle = titleFactory.getTitle(
                {
                    operator,
                    masterMeasureLocalIdentifiers: measureIdentifiers,
                },
                measureTitleProps,
            );

            if (!fullLengthTitle) {
                return null;
            }

            const title = stringUtils.shortenText(fullLengthTitle, {
                maxLength: maxArithmeticMeasureTitleLength,
            });

            return {
                localIdentifier,
                title,
                alias,
            };
        }
    }

    return null;
}

function buildDerivedMeasureTitle(
    measure: IMeasure,
    measureTitleProps: IMeasureTitleProps[],
    suffixFactory: DerivedMeasureTitleSuffixFactory,
): IMeasureTitleProps | null {
    if (isPoPMeasure(measure) || isPreviousPeriodMeasure(measure)) {
        const alias = measureAlias(measure);
        const localIdentifier = measureLocalId(measure);

        const masterMeasureIdentifier = measureMasterIdentifier(measure)!;
        if (containsMeasureTitleItem(measureTitleProps, masterMeasureIdentifier)) {
            return {
                localIdentifier,
                title: findTitleForDerivedMeasure(measure, measureTitleProps, suffixFactory),
                alias,
            };
        }
    }

    return null;
}

function buildMeasureTitles(
    measures: IMeasure[],
    locale: ILocale,
    maxArithmeticMeasureTitleLength: number,
): IMeasureTitleProps[] {
    const titleFactory = new ArithmeticMeasureTitleFactory(locale);
    const suffixFactory = new DerivedMeasureTitleSuffixFactory(locale);

    const measureTitleProps: IMeasureTitleProps[] = [];

    let isMeasureTitlePropsChanged = true;
    while (isMeasureTitlePropsChanged) {
        isMeasureTitlePropsChanged = false;

        measures.forEach((measure) => {
            const localId = measureLocalId(measure);
            if (!containsMeasureTitleItem(measureTitleProps, localId)) {
                const newMeasureTitleProp =
                    buildMeasureTitle(measure) ||
                    buildArithmeticMeasureTitle(
                        measure,
                        measureTitleProps,
                        titleFactory,
                        maxArithmeticMeasureTitleLength,
                    ) ||
                    buildDerivedMeasureTitle(measure, measureTitleProps, suffixFactory);

                if (newMeasureTitleProp !== null) {
                    measureTitleProps.push(newMeasureTitleProp);
                    isMeasureTitlePropsChanged = true;
                }
            }
        });
    }

    return measureTitleProps;
}

function updateBucketItemTitle(
    bucketItem: IAttributeOrMeasure,
    measureTitleProps: IMeasureTitleProps[],
): IAttributeOrMeasure {
    if (isMeasure(bucketItem)) {
        const localId = measureLocalId(bucketItem);
        const measureTitleProp = findMeasureTitleItem(measureTitleProps, localId);
        if (measureTitleProp !== null) {
            const { title, alias } = measureTitleProp;
            return modifyMeasure(bucketItem, (measure) => measure.title(title).alias(alias));
        }
    }

    return bucketItem;
}

function updateVisualizationObjectTitles<T extends IInsightDefinition>(
    insight: T,
    measureTitleProps: IMeasureTitleProps[],
): T {
    return insightModifyItems(insight, (item) => updateBucketItemTitle(item, measureTitleProps));
}

/**
 * The function fills the titles of the measures that does not have it set.
 *
 * The derived measures
 * have the title built from the current name of the master measure and suffix based on the derived measure type.
 *
 * The arithmetic measures
 * have the title built from the current names of the referenced master measures and type of the arithmetic
 * operation.
 *
 * @param insight - insight or insight definition that must be processed.
 * @param locale - locale used for localization of the measure titles.
 * @param maxArithmeticMeasureTitleLength - maximum length of generated arithmetic measures titles.
 * Longer names will be shortened. Default value is 50 characters.
 *
 * @returns a copy of insight with auto-generated titles for derived and arithmetic measures
 *
 * @internal
 */
export function fillMissingTitles<T extends IInsightDefinition>(
    insight: T,
    locale: ILocale,
    maxArithmeticMeasureTitleLength: number = DEFAULT_MAX_ARITHMETIC_MEASURE_TITLE_LENGTH,
): T {
    const measures = insightMeasures(insight);
    const measureTitleProps = buildMeasureTitles(measures, locale, maxArithmeticMeasureTitleLength);
    return updateVisualizationObjectTitles(insight, measureTitleProps);
}
