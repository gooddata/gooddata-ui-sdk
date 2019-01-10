// (C) 2007-2018 GoodData Corporation
import get = require('lodash/get');
import { VisualizationClass } from '@gooddata/typings';
import { SDK, IFeatureFlags } from '@gooddata/gooddata-js';
import { VisualizationTypes, VisType } from '../constants/visualizationTypes';
import { getCachedOrLoad } from './sdkCache';

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
    sdk: SDK,
    projectId: string,
    getVisualizationTypeFromUrlImpl: Function = getVisualizationTypeFromUrl
): Promise<VisType> {
    const type: VisType = getVisualizationTypeFromUrlImpl(get(visualizationClass, ['content', 'url'], ''));
    // in case of table, also check featureFlags if we need to switch to 'pivotTable'
    if (type === 'table') {
        const apiCallIdentifier = `getFeatureFlags.${projectId}`;
        const loader = (): Promise<IFeatureFlags> => sdk.project.getFeatureFlags(projectId);
        return getCachedOrLoad(apiCallIdentifier, loader).then(
            (featureFlags: IFeatureFlags) => {
                const isPivotTableEnabled = featureFlags.enablePivot;
                return isPivotTableEnabled ? 'pivotTable' : type;
            },
            (error) => {
                // tslint:disable-next-line:no-console
                console.error(`unable to retrieve featureFlags for project ${projectId}`, error);
                throw Error(error);
            }
        );
    }
    return Promise.resolve(type);
}
