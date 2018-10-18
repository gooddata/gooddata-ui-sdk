// (C) 2007-2018 GoodData Corporation
import { VisualizationObject, Localization } from '@gooddata/typings';
import DerivedMeasureTitleSuffixFactory from '../factory/DerivedMeasureTitleSuffixFactory';
import ArithmeticMeasureTitleFactory from '../factory/ArithmeticMeasureTitleFactory';
import { IMeasureTitleProps } from '..';
import MdObjectHelper from './MdObjectHelper';
import cloneDeep = require('lodash/cloneDeep');
import get = require('lodash/get');
import set = require('lodash/set');
import flatMap = require('lodash/flatMap');
import IMeasureDefinitionType = VisualizationObject.IMeasureDefinitionType;
import IMeasure = VisualizationObject.IMeasure;
import IBucket = VisualizationObject.IBucket;
import BucketItem = VisualizationObject.BucketItem;
import IVisualizationObjectContent = VisualizationObject.IVisualizationObjectContent;
import IArithmeticMeasureDefinition = VisualizationObject.IArithmeticMeasureDefinition;

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
    } else {
        return null;
    }
}

function getMasterMeasure(bucketItems: IMeasure[], measureIdentifier: string): IMeasure {
    return bucketItems
        .find(bucketItem => get<string>(bucketItem, ['measure', 'localIdentifier']) === measureIdentifier);
}

function getDerivedMeasureTitleBase(masterMeasure: VisualizationObject.IMeasure): string {
    const masterMeasureTitle = get<string>(masterMeasure, ['measure', 'title'], '');
    return get<string>(masterMeasure, ['measure', 'alias'], masterMeasureTitle);
}

function findTitleForDerivedMeasure(
    definition: IMeasureDefinitionType,
    measureBucketItems: IMeasure[],
    suffixFactory: DerivedMeasureTitleSuffixFactory
) {
    const masterMeasureIdentifier = getMasterMeasureIdentifier(definition);
    if (masterMeasureIdentifier === null) {
        return undefined;
    }
    const masterMeasure = getMasterMeasure(measureBucketItems, masterMeasureIdentifier);
    const derivedMeasureTitleBase = getDerivedMeasureTitleBase(masterMeasure);
    return derivedMeasureTitleBase + suffixFactory.getSuffix(definition);
}

function updateMeasureTitle(bucketItem: IMeasure, title: string) {
    if (title !== undefined) {
        set(bucketItem, 'measure', {
            ...bucketItem.measure,
            ...{ title }
        });
    }
}

function updateDerivedMeasuresTitles(measureBucketItems: IMeasure[], locale: Localization.ILocale) {
    const suffixFactory = new DerivedMeasureTitleSuffixFactory(locale);
    measureBucketItems.forEach((bucketItem) => {
        const { measure: { definition } } = bucketItem;
        const title = findTitleForDerivedMeasure(definition, measureBucketItems, suffixFactory);
        updateMeasureTitle(bucketItem, title);
    });
    return MdObjectHelper.buildMeasureTitleProps(measureBucketItems);
}

const isArithmeticMeasure = (bucketItem: IMeasure) => {
    return VisualizationObject.isArithmeticMeasureDefinition(bucketItem.measure.definition);
};

function updateArithmeticMeasureTitles(
    measureBucketItems: IMeasure[],
    measureTitlesProps: IMeasureTitleProps[],
    locale: Localization.ILocale
) {
    const titleFactory = new ArithmeticMeasureTitleFactory(locale);
    const titleLookup = measureTitlesProps.slice();

    const findMasterMeasureBucketItem = (localIdentifier: string) => {
        return measureBucketItems.find(bucketItem => bucketItem.measure.localIdentifier === localIdentifier);
    };

    const isMeasureProcessed = (localIdentifier: string) => {
        const bucketItem = findMasterMeasureBucketItem(localIdentifier);
        return bucketItem !== undefined && bucketItem.measure.title !== undefined;
    };

    const updateMeasureTitlesLookup = (newMeasureTitle: string, measureLocalIdentifier: string) => {
        titleLookup
            .filter(titleLookup => titleLookup.localIdentifier === measureLocalIdentifier)
            .forEach(titleLookup => titleLookup.title = newMeasureTitle);
    };

    const findTitleForArithmeticMeasure = (definition: IArithmeticMeasureDefinition) => {
        const measureTitleProps = MdObjectHelper.buildArithmeticMeasureTitleProps(definition);
        return titleFactory.getTitle(measureTitleProps, titleLookup);
    };

    const processArithmeticMeasure = (arithmeticMeasure: IMeasure, visitedMeasures: string[]) => {
        const { measure: { title, definition, localIdentifier } } = arithmeticMeasure;
        const { arithmeticMeasure: { measureIdentifiers } } = definition as IArithmeticMeasureDefinition;

        if (visitedMeasures.includes(localIdentifier)) {
            return;
        }

        visitedMeasures.push(localIdentifier);

        if (title === undefined && isArithmeticMeasure(arithmeticMeasure)) {
            const hasAllDependenciesProcessed = measureIdentifiers.every(isMeasureProcessed);

            if (!hasAllDependenciesProcessed) {
                for (const dependencyLocalIdentifier of measureIdentifiers) {
                    const measure = findMasterMeasureBucketItem(dependencyLocalIdentifier);
                    if (measure !== undefined && measure.measure.title === undefined) {
                        processArithmeticMeasure(measure, visitedMeasures);
                    }
                }
            }

            const title = findTitleForArithmeticMeasure(definition as IArithmeticMeasureDefinition);
            if (title !== null) {
                updateMeasureTitle(arithmeticMeasure, title);
                updateMeasureTitlesLookup(title, localIdentifier);
            }
        }
    };

    const arithmeticMeasures = measureBucketItems.filter(isArithmeticMeasure);

    for (const arithmeticMeasure of arithmeticMeasures) {
        processArithmeticMeasure(arithmeticMeasure, []);
    }
}

/**
 * The function fills the titles of the measures that does not have it set. The derived measures have the title
 * built from the current name of the master measure and suffix based on the derived measure type. The arithmetic
 * measures have the title built from the current names of the referenced master measures and type of the arithmetic
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
    const modifiedMdObject = cloneDeep(mdObject);
    const measureBucketItems = getAllMeasures(modifiedMdObject);

    // process derived measures first to have all names finalized for arithmetic measures
    const measureTitlesProps = updateDerivedMeasuresTitles(measureBucketItems, locale);

    updateArithmeticMeasureTitles(measureBucketItems, measureTitlesProps, locale);

    return modifiedMdObject;
}
