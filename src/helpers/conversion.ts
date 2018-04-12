import { AFM, VisualizationObject } from '@gooddata/typings';
import { DataLayer } from '@gooddata/gooddata-js';

export function convertBucketsToAFM(
    buckets: VisualizationObject.IBucket[],
    filters?: VisualizationObject.VisualizationObjectFilter[]
): AFM.IAfm {
    const visualizationObject = {
        visualizationClass: {
            uri: '/does/not/matter'
        },

        buckets
    };

    const { afm } = DataLayer.toAfmResultSpec(visualizationObject);
    if (filters) {
        afm.filters = filters as AFM.FilterItem[];
    }

    return afm;
}
