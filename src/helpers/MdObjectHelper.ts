import { VisualizationObject } from '@gooddata/typings';
import get = require('lodash/get');
import { ATTRIBUTE } from '../constants/bucketNames';

export function getTotals(mdObject: VisualizationObject.IVisualizationObject):
    VisualizationObject.IVisualizationTotal[] {

    const attributes: VisualizationObject.IBucket = mdObject.content.buckets
        .find(bucket => bucket.localIdentifier === ATTRIBUTE);

    return get(attributes, 'totals', []);
}

export function getVisualizationClassUri(mdObject: VisualizationObject.IVisualizationObject):
    string {

    return get(mdObject, 'content.visualizationClass.uri', '');
}
