// (C) 2007-2018 GoodData Corporation
import { VisualizationObject } from '@gooddata/typings';
import DerivedMeasureTitleSuffixFactory from '../factory/DerivedMeasureTitleSuffixFactory';
import cloneDeep = require('lodash/cloneDeep');
import get = require('lodash/get');
import set = require('lodash/set');
import flatMap = require('lodash/flatMap');
import IMeasureDefinitionType = VisualizationObject.IMeasureDefinitionType;
import IMeasure = VisualizationObject.IMeasure;
import IBucket = VisualizationObject.IBucket;
import BucketItem = VisualizationObject.BucketItem;
import IVisualizationObjectContent = VisualizationObject.IVisualizationObjectContent;
import isMeasure = VisualizationObject.isMeasure;

function getAllMeasureBucketItems(mdObject: IVisualizationObjectContent): IMeasure[] {
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

/**
 * The function fills the titles and aliases of the derived measure definitions based on their master measure
 * definitions.
 *
 * @param {VisualizationObject.IVisualizationObjectContent} mdObject - metadata object that must be processed.
 * @param {DerivedMeasureTitleSuffixFactory} suffixFactory - the factory method that finds the correct suffix for the
 *      derived measure title.
 *
 * @returns {VisualizationObject.IVisualizationObjectContent}
 *
 * @internal
 */
export function fillDerivedMeasuresTitlesAndAliases(
    mdObject: IVisualizationObjectContent,
    suffixFactory: DerivedMeasureTitleSuffixFactory
): IVisualizationObjectContent {
    const modifiedMdObject = cloneDeep(mdObject);
    const measureBucketItems = getAllMeasureBucketItems(modifiedMdObject);

    measureBucketItems
        .filter(isMeasure)
        .forEach((bucketItem) => {
            const { measure: { definition } } = bucketItem;
            const masterMeasureIdentifier = getMasterMeasureIdentifier(definition);

            if (masterMeasureIdentifier === null) {
                return bucketItem;
            }

            const masterMeasure = getMasterMeasure(measureBucketItems, masterMeasureIdentifier);
            const derivedMeasureTitleBase = getDerivedMeasureTitleBase(masterMeasure);
            const title = derivedMeasureTitleBase + suffixFactory.getSuffix(definition);
            const titleProp = { title };

            set(bucketItem, 'measure', {
                ...bucketItem.measure,
                ...titleProp
            });

            return bucketItem;
        });

    return modifiedMdObject;
}
