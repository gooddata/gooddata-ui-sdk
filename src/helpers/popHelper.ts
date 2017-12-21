import { VisualizationObject } from '@gooddata/typings';
import cloneDeep = require('lodash/cloneDeep');
import get = require('lodash/get');
import set = require('lodash/set');

function getOriginalMeasure(
    bucketItems: VisualizationObject.IMeasure[],
    measureIdentifier: string
): VisualizationObject.IMeasure {
    return bucketItems.find(bucketItem => get(bucketItem, ['measure', 'localIdentifier']) === measureIdentifier);
}

export function fillPoPTitlesAndAliases(
    mdObject: VisualizationObject.IVisualizationObjectContent,
    popSuffix: string
): VisualizationObject.IVisualizationObjectContent {
    const modifiedMdObject = cloneDeep(mdObject);
    get(modifiedMdObject, 'buckets', []).forEach((bucket) => {
        bucket.items = get(bucket, 'items', []).map((bucketItem, _, bucketItems) => {
            const popDefinition = get(bucketItem, ['measure', 'definition', 'popMeasureDefinition']);
            if (popDefinition) {
                const originalMeasure = getOriginalMeasure(
                    bucketItems.filter(bucketItem => get(bucketItem, ['measure'])), // only measures
                    get<string>(popDefinition, 'measureIdentifier')
                );
                const originalTitle = get(originalMeasure, ['measure', 'title']);
                const originalAlias = get(originalMeasure, ['measure', 'alias']);

                const title = `${originalTitle}${popSuffix}`;
                const alias = `${originalAlias}${popSuffix}`;

                const titleProp = originalTitle ? { title } : {};
                const aliasProp = originalAlias ? { alias } : {};
                set(bucketItem, 'measure', {
                    ...bucketItem.measure,
                    ...titleProp,
                    ...aliasProp
                });
            }
            return bucketItem;
        });
    });

    return modifiedMdObject;
}
