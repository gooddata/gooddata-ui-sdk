import get = require('lodash/get');
import every = require('lodash/every');
import some = require('lodash/some');
import has = require('lodash/has');
import { VisualizationObject } from '@gooddata/data-layer';

export interface IVisualizationOptions {
    dateOptionsDisabled: boolean;
}

export function getVisualizationOptions(
    metadata: VisualizationObject.IVisualizationObjectMetadata): IVisualizationOptions {

    const measures = get(metadata, 'content.buckets.measures', []);
    const dateOptionsDisabled = every(measures,
            measure => some(get(measure, 'measure.measureFilters'),
                    filter => has(filter,'dateFilter')));

    return {
        dateOptionsDisabled
    };
}
