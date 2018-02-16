import get = require('lodash/get');
import { VisualizationClass } from '@gooddata/typings';
import { VisualizationTypes, VisType } from '../constants/visualizationTypes';

export function getVisualizationTypeFromUrl(url: string): VisType {
    // known types follow local:<type> pattern
    const type = url.split(':')[1];
    if (type) {
        return VisualizationTypes[type.toUpperCase()];
    }

    return null;
}

export function getVisualizationTypeFromVisualizationClass(
    visualizationClass: VisualizationClass.IVisualizationClass,
    getVisualizationTypeFromUrlImpl: Function = getVisualizationTypeFromUrl
): VisType {
    return getVisualizationTypeFromUrlImpl(get(visualizationClass, ['content', 'url'], ''));
}
