// (C) 2007-2018 GoodData Corporation
import get = require('lodash/get');
import { VisualizationClass } from '@gooddata/typings';
import { IFeatureFlags } from '@gooddata/gooddata-js';
import { VisualizationTypes, VisType } from '../constants/visualizationTypes';

export function getVisualizationTypeFromUrl(url: string): VisType {
    // known types follow local:<type> pattern
    const type = url.split(':')[1];
    if (type) {
        return VisualizationTypes[type.toUpperCase()];
    }

    return null;
}

export async function getVisualizationTypeFromVisualizationClass(
    visualizationClass: VisualizationClass.IVisualizationClass,
    featureFlags: IFeatureFlags,
    getVisualizationTypeFromUrlImpl: Function = getVisualizationTypeFromUrl
): Promise<VisType> {
    const type: VisType = getVisualizationTypeFromUrlImpl(get(visualizationClass, ['content', 'url'], ''));

    // in case of table, also check featureFlags if we need to switch to 'pivotTable'
    if (type === 'table') {
        const isPivotTableEnabled = featureFlags.enablePivot;
        return isPivotTableEnabled ? 'pivotTable' : type;
    }

    return type;
}
