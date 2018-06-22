// (C) 2007-2018 GoodData Corporation
import { Localization, VisualizationObject } from '@gooddata/typings';
import cloneDeep = require('lodash/cloneDeep');
import get = require('lodash/get');
import set = require('lodash/set');
import flatMap = require('lodash/flatMap');
import IntlStore from './IntlStore';
import { IMeasureDefinitionType } from '../interfaces/MeasureDefinitionType';

function getMasterMeasure(
    bucketItems: VisualizationObject.IMeasure[],
    measureIdentifier: string
): VisualizationObject.IMeasure {
    return bucketItems.find(bucketItem => get(bucketItem, ['measure', 'localIdentifier']) === measureIdentifier);
}

function getAllMeasureBucketItems(
    mdObject: VisualizationObject.IVisualizationObjectContent
): VisualizationObject.IMeasure[] {
    const buckets = get<VisualizationObject.IBucket[]>(mdObject, 'buckets', []);
    const allBucketItems = flatMap<VisualizationObject.BucketItem>(buckets, bucket => bucket.items);

    return allBucketItems.reduce((measureItems, bucketItem) => {
        if (VisualizationObject.isMeasure(bucketItem)) {
            measureItems.push(bucketItem);
        }

        return measureItems;
    }, []);
}

/**
 * getPoPSuffix
 * returns formatted localized pop suffix string based on measure definition type.
 * Its used for AFM execution, Bucket item titles.
 *
 * @param {IMeasureDefinitionType} measureDefinitionType - measure definition type
 * @param {Localization.ILocale} locale
 * @returns {string}
 * @internal
 */
export function getPoPSuffix(measureDefinitionType: IMeasureDefinitionType, locale: Localization.ILocale) {
    let translationId = 'measure.title.suffix.';

    switch (measureDefinitionType) {
        case 'overPeriodMeasureDefinition': {
            translationId += 'same_period_year_ago';
            break;
        }
        case 'popMeasureDefinition':
        default: {
            translationId += 'previous_year';
            break;
        }
    }

    return ` - ${IntlStore.getTranslation(translationId, locale)}`;
}

/**
 * fillPoPTitlesAndAliases
 * is a function that fills in titles and aliases into pop measure definition based on master measure definition
 * @param mdObject:VisualizationObject.IVisualizationObjectContent - metadata object
 * @param popSuffix:string - string to append to localIdentifier
 * @internal
 */
export function fillPoPTitlesAndAliases(
    mdObject: VisualizationObject.IVisualizationObjectContent,
    popSuffix: string
): VisualizationObject.IVisualizationObjectContent {
    const modifiedMdObject = cloneDeep(mdObject);

    const measureBucketItems = getAllMeasureBucketItems(modifiedMdObject);

    measureBucketItems.forEach((bucketItem) => {
        const popDefinition = get(bucketItem, ['measure', 'definition', 'popMeasureDefinition']);
        if (popDefinition) {
            const masterMeasure = getMasterMeasure(measureBucketItems,
                get<string>(popDefinition, 'measureIdentifier'));

            const masterMeasureTitle = get(masterMeasure, ['measure', 'title']);
            const masterMeasureAlias = get(masterMeasure, ['measure', 'alias']);

            const derivedMeasureTitleBase = masterMeasureAlias === undefined
                ? masterMeasureTitle
                : masterMeasureAlias;

            const titleProp = { title: `${derivedMeasureTitleBase}${popSuffix}` };

            set(bucketItem, 'measure', {
                ...bucketItem.measure,
                ...titleProp
            });
        }
        return bucketItem;
    });

    return modifiedMdObject;
}
