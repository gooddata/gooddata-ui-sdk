// (C) 2007-2018 GoodData Corporation
import { AFM, VisualizationObject } from '@gooddata/typings';
import { DataLayer } from '@gooddata/gooddata-js';

export function convertBucketsToMdObject(
    buckets: VisualizationObject.IBucket[],
    filters?: VisualizationObject.VisualizationObjectFilter[],
    uri?: string
): VisualizationObject.IVisualizationObjectContent {
    const visClassUri = uri ? uri : '/does/not/matter';

    const visualizationObject = {
        visualizationClass: {
            uri: visClassUri
        },

        buckets,
        filters
    };

    return visualizationObject;
}

export function convertBucketsToAFM(
    buckets: VisualizationObject.IBucket[],
    filters?: VisualizationObject.VisualizationObjectFilter[]
): AFM.IAfm {
    const { afm } = DataLayer.toAfmResultSpec(convertBucketsToMdObject(buckets, filters));
    if (filters) {
        afm.filters = filters as AFM.FilterItem[];
    }

    return afm;
}
