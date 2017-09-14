import get = require('lodash/get');
import { VisualizationObject } from '@gooddata/data-layer';

export interface ILegendConfig {
    enabled?: boolean;
    position?: 'top' | 'left' | 'right' | 'bottom';
    responsive?: boolean;
}

export interface IVisConfig {
    type: string;
    buckets: VisualizationObject.IBuckets;
    legend: ILegendConfig;
}

export function getLegendConfig(
    metadata: VisualizationObject.IVisualizationObject,
    environment: string
): ILegendConfig {
    if (environment === 'dashboards') {
        return {
            enabled: true,
            position: 'right',
            responsive: true
        };
    }

    const categories = get(metadata, 'content.buckets.categories', []);
    const collections = categories.map(category =>
        get(category, 'category.collection'));

    const isStackOrSegment = (collection: string) => collection === 'stack' || collection === 'segment';

    const isOnRight = collections.some(isStackOrSegment);
    const position = isOnRight ? 'right' : 'top';

    return {
        enabled: true,
        position
    };
}

export function getConfig(
        metadata: VisualizationObject.IVisualizationObject,
        type: string,
        environment: string
): IVisConfig {
    const legendConfig = getLegendConfig(metadata, environment);
    return {
        type,
        buckets: get<VisualizationObject.IVisualizationObject,
            VisualizationObject.IBuckets>(metadata, 'content.buckets'),
        legend: legendConfig
    };
}
