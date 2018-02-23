import { AFM, VisualizationObject } from '@gooddata/typings';
import { toAfmResultSpec } from '@gooddata/data-layer';

export function convertBucketsToAFM(buckets: VisualizationObject.IBucket[]): AFM.IAfm {
    const visualizationObject = {
        visualizationClass: {
            uri: '/does/not/matter'
        },

        buckets
    };

    const { afm } = toAfmResultSpec(visualizationObject);

    return afm;
}
