import { get, cloneDeep } from 'lodash';
import { VisualizationObject } from '@gooddata/data-layer';

interface IMeasureInfo {
    generatedId: string;
    isPoP: boolean;
}

function getMeasureInfo(id: string): IMeasureInfo {
    if (id.endsWith('_pop')) {
        return {
            generatedId: id.split('_')[0],
            isPoP: true
        };
    }

    return {
        generatedId: id,
        isPoP: false
    };
}

export function updateSorting(metadata: VisualizationObject.IVisualizationObjectMetadata, { sorting, change, index }):
    VisualizationObject.IVisualizationObjectMetadata {

    const updatedMetadata = cloneDeep(metadata);
    const buckets = updatedMetadata.content.buckets;
    const { column, direction } = sorting;
    const { type } = change;

    let bucketItem;
    let sort;

    if (type === 'metric') {
        const { generatedId, isPoP } = getMeasureInfo(column);
        const mex = get(buckets, 'measures', []);
        const metricIndex = mex
            .findIndex(item => item.measure.generatedId === generatedId);

        bucketItem = get(buckets, `measures.${metricIndex}.measure`);
        sort = { direction };
        if (isPoP) {
            sort.sortByPoP = true;
        }
    } else {
        bucketItem = get(buckets, `categories.${index}.category`, {});
        sort = direction; // string instead of object for categories :(
    }

    buckets.categories = buckets.categories.map((category) => {
        category.category.sort = null;
        return category;
    });
    buckets.measures = buckets.measures.map((measure) => {
        measure.measure.sort = null;
        return measure;
    });
    bucketItem.sort = sort;

    return updatedMetadata;
}
