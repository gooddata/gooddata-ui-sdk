import get = require('lodash/get');
import cloneDeep = require('lodash/cloneDeep');
import { VisualizationObject, Transformation } from '@gooddata/data-layer';

import { ISortingChange } from '../helpers/sorting';

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

export interface ISorting {
    sorting: Transformation.ISort;
    change: ISortingChange;
}

export interface IUpdateSortingResult {
    updatedMetadata: VisualizationObject.IVisualizationObjectMetadata;
    updatedSorting: ISorting;
}

export function updateSorting(
    metadata: VisualizationObject.IVisualizationObjectMetadata,
    sortingInfo: ISorting): IUpdateSortingResult {
    const { sorting, change } = sortingInfo;
    const updatedMetadata = cloneDeep(metadata);
    const buckets = updatedMetadata.content.buckets;
    const { column, direction } = sorting;
    const { type } = change;

    let bucketItem;
    let sort;

    if (type === 'metric') {
        const { generatedId, isPoP } = getMeasureInfo(column);
        const mex = get(buckets, 'measures', []);
        const measure = mex
            .find(item => item.measure.generatedId === generatedId);

        bucketItem = get(measure, 'measure');
        sort = { direction };
        if (isPoP) {
            sort.sortByPoP = true;
        }
    } else {
        const categories = get(buckets, 'categories', []);
        const category = categories
            .find(item => item.category.displayForm === column);

        bucketItem = get(category, 'category');
        sort = direction; // string instead of object for categories :(
    }
    // handle column deletation
    if (!bucketItem) {
        return {
            updatedMetadata: metadata,
            updatedSorting: null
        };
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

    return {
        updatedMetadata,
        updatedSorting: sortingInfo
    };
}
