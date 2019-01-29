// (C) 2007-2018 GoodData Corporation
import { VisualizationObject, Localization } from '@gooddata/typings';
import DerivedMeasureTitleSuffixFactory from '../factory/DerivedMeasureTitleSuffixFactory';
import ArithmeticMeasureTitleFactory from '../factory/ArithmeticMeasureTitleFactory';
import { IMeasureTitleProps, OverTimeComparisonType, OverTimeComparisonTypes } from '..';
import get = require('lodash/get');
import flatMap = require('lodash/flatMap');
import IMeasureDefinitionType = VisualizationObject.IMeasureDefinitionType;
import IMeasure = VisualizationObject.IMeasure;
import IBucket = VisualizationObject.IBucket;
import BucketItem = VisualizationObject.BucketItem;
import IVisualizationObjectContent = VisualizationObject.IVisualizationObjectContent;
import isMeasure = VisualizationObject.isMeasure;

function getAllMeasures(mdObject: IVisualizationObjectContent): IMeasure[] {
    const buckets = get<IBucket[]>(mdObject, 'buckets', []);
    const allBucketItems = flatMap<BucketItem>(buckets, bucket => bucket.items);

    return allBucketItems.reduce((measureItems, bucketItem) => {
        if (VisualizationObject.isMeasure(bucketItem)) {
            measureItems.push(bucketItem);
        }

        return measureItems;
    }, []);
}

function getMasterMeasureIdentifier(definition: IMeasureDefinitionType): string | null {
    if (VisualizationObject.isPopMeasureDefinition(definition)) {
        return definition.popMeasureDefinition.measureIdentifier;
    } else if (VisualizationObject.isPreviousPeriodMeasureDefinition(definition)) {
        return definition.previousPeriodMeasure.measureIdentifier;
    }
    return null;
}

function findOverTimeComparisonType(measureDefinitionType: IMeasureDefinitionType): OverTimeComparisonType {
    if (VisualizationObject.isPopMeasureDefinition(measureDefinitionType)) {
        return OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR;
    } else if (VisualizationObject.isPreviousPeriodMeasureDefinition(measureDefinitionType)) {
        return OverTimeComparisonTypes.PREVIOUS_PERIOD;
    }
    return OverTimeComparisonTypes.NOTHING;
}

function containsMeasureTitleItem(measureTitleProps: IMeasureTitleProps[], localIdentifier: string): boolean {
    return measureTitleProps.some(prop => prop.localIdentifier === localIdentifier);
}

function containsMeasureTitleItems(measureTitleProps: IMeasureTitleProps[], localIdentifiers: string[]): boolean {
    return localIdentifiers.every(identifier => containsMeasureTitleItem(measureTitleProps, identifier));
}

function findMeasureTitleItem(measureTitles: IMeasureTitleProps[], localIdentifier: string): IMeasureTitleProps | null {
    return measureTitles.find(prop => prop.localIdentifier === localIdentifier) || null;
}

function findTitleForDerivedMeasure(
    measureDefinitionType: IMeasureDefinitionType,
    measureTitleProps: IMeasureTitleProps[],
    suffixFactory: DerivedMeasureTitleSuffixFactory
): string {
    const masterMeasureIdentifier = getMasterMeasureIdentifier(measureDefinitionType);
    if (masterMeasureIdentifier === null) {
        return undefined;
    }

    const measureProps = findMeasureTitleItem(measureTitleProps, masterMeasureIdentifier);
    if (measureProps === null) {
        return undefined;
    }

    const derivedMeasureTitleBase = measureProps.alias || measureProps.title || '';
    const overTimeComparisonType = findOverTimeComparisonType(measureDefinitionType);
    return derivedMeasureTitleBase + suffixFactory.getSuffix(overTimeComparisonType);
}

function buildMeasureTitle(bucketItem: IMeasure): IMeasureTitleProps | null {
    if (VisualizationObject.isMeasureDefinition(bucketItem.measure.definition)) {
        const { localIdentifier, title, alias } = bucketItem.measure;

        return {
            localIdentifier,
            title,
            alias
        };
    }

    return null;
}

function buildArithmeticMeasureTitle(
    bucketItem: IMeasure,
    measureTitleProps: IMeasureTitleProps[],
    titleFactory: ArithmeticMeasureTitleFactory
): IMeasureTitleProps | null {
    if (VisualizationObject.isArithmeticMeasureDefinition(bucketItem.measure.definition)) {
        const { alias, localIdentifier } = bucketItem.measure;
        const arithmeticMeasure = bucketItem.measure.definition.arithmeticMeasure;

        if (containsMeasureTitleItems(measureTitleProps, arithmeticMeasure.measureIdentifiers)) {
            return {
                localIdentifier,
                title: titleFactory.getTitle({
                    operator: arithmeticMeasure.operator,
                    masterMeasureLocalIdentifiers: arithmeticMeasure.measureIdentifiers
                }, measureTitleProps),
                alias
            };
        }
    }

    return null;
}

function buildDerivedMeasureTitle(
    bucketItem: IMeasure,
    measureTitleProps: IMeasureTitleProps[],
    suffixFactory: DerivedMeasureTitleSuffixFactory

): IMeasureTitleProps | null {
    if (VisualizationObject.isPopMeasureDefinition(bucketItem.measure.definition) ||
        VisualizationObject.isPreviousPeriodMeasureDefinition(bucketItem.measure.definition)) {
        const { alias, localIdentifier } = bucketItem.measure;
        const definition = bucketItem.measure.definition;

        const masterMeasureIdentifier = getMasterMeasureIdentifier(definition);
        if (containsMeasureTitleItem(measureTitleProps, masterMeasureIdentifier)) {
            return {
                localIdentifier,
                title: findTitleForDerivedMeasure(definition, measureTitleProps, suffixFactory),
                alias
            };
        }
    }

    return null;
}

function buildMeasureTitles(
    measureBucketItems: VisualizationObject.IMeasure[],
    locale: Localization.ILocale
): IMeasureTitleProps[] {
    const titleFactory = new ArithmeticMeasureTitleFactory(locale);
    const suffixFactory = new DerivedMeasureTitleSuffixFactory(locale);

    const measureTitleProps: IMeasureTitleProps[] = [];

    let isMeasureTitlePropsChanged = true;
    while (isMeasureTitlePropsChanged) {
        isMeasureTitlePropsChanged = false;

        measureBucketItems.forEach((bucketItem) => {
            if (!containsMeasureTitleItem(measureTitleProps, bucketItem.measure.localIdentifier)) {

                const newMeasureTitleProp = buildMeasureTitle(bucketItem)
                    || buildArithmeticMeasureTitle(bucketItem, measureTitleProps, titleFactory)
                    || buildDerivedMeasureTitle(bucketItem, measureTitleProps, suffixFactory);

                if (newMeasureTitleProp !== null) {
                    measureTitleProps.push(newMeasureTitleProp);
                    isMeasureTitlePropsChanged = true;
                }
            }
        });
    }

    return measureTitleProps;
}

function updateBucketItem(
    bucketItem: VisualizationObject.BucketItem,
    measureTitleProps: IMeasureTitleProps[]
): BucketItem {
    if (isMeasure(bucketItem)) {
        const measureTitleProp = findMeasureTitleItem(measureTitleProps, bucketItem.measure.localIdentifier);
        if (measureTitleProp !== null) {
            const { title, alias } = measureTitleProp;

            return {
                ...bucketItem,
                measure: {
                    ...bucketItem.measure,
                    title,
                    alias
                }
            };
        }
    }

    return bucketItem;
}

function updateBucket(
    bucket: VisualizationObject.IBucket,
    measureTitleProps: IMeasureTitleProps[]
): VisualizationObject.IBucket {
    return {
        ...bucket,
        items: bucket.items.map(bucketItem => updateBucketItem(bucketItem, measureTitleProps))
    };
}

function updateVisualizationObject(
    mdObject: IVisualizationObjectContent,
    measureTitleProps: IMeasureTitleProps[]
): IVisualizationObjectContent {
    return {
        ...mdObject,
        buckets: mdObject.buckets.map(bucket => updateBucket(bucket, measureTitleProps))
    };
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
 * @param {VisualizationObject.IVisualizationObjectContent} mdObject - metadata object that must be processed.
 * @param {Localization.ILocale} locale - locale used for localization of the measure titles.
 *
 * @returns {VisualizationObject.IVisualizationObjectContent}
 *
 * @internal
 */
export function fillMissingTitles(
    mdObject: IVisualizationObjectContent,
    locale: Localization.ILocale
): IVisualizationObjectContent {
    const measureBucketItems = getAllMeasures(mdObject);
    const measureTitleProps = buildMeasureTitles(measureBucketItems, locale);
    return updateVisualizationObject(mdObject, measureTitleProps);
}
