// (C) 2007-2018 GoodData Corporation
import get = require('lodash/get');
import { AFM } from '@gooddata/typings';

import { ASC, DESC } from '../constants/sort';

function getMeasureSortItems(identifier: string, direction: AFM.SortDirection): AFM.SortItem[] {
    return [
        {
            measureSortItem: {
                direction,
                locators: [
                    {
                        measureLocatorItem: {
                            measureIdentifier: identifier
                        }
                    }
                ]
            }
        }
    ];
}

function getAttributeSortItems(
    identifier: string,
    direction: AFM.SortDirection,
    aggregation?: boolean
): AFM.SortItem[] {
    if (!identifier) {
        return [];
    }
    const base = {
        attributeIdentifier: identifier,
        direction
    };

    const enrichedAggregation = aggregation ? {
        aggregation: 'sum'
    } : {};

    const attributeSortItem = {
        attributeSortItem: {
            ...base,
            ...enrichedAggregation
        }
    };

    return [attributeSortItem];
}

function getAllMeasuresSorts(afm: AFM.IAfm): AFM.SortItem[] {
    return (afm.measures || []).reduce((sortItems: AFM.SortItem[], measure: AFM.IMeasure) => {
        return [...sortItems, ...getMeasureSortItems(measure.localIdentifier, DESC)];
    }, []);
}

export function getDefaultTreemapSort(afm: AFM.IAfm, resultSpec: AFM.IResultSpec): AFM.SortItem[] {
    const viewByAttributeIdentifier = get<string>(resultSpec, 'dimensions.0.itemIdentifiers.0');
    const stackByAttributeIdentifier = get<string>(resultSpec, 'dimensions.0.itemIdentifiers.1');

    if (viewByAttributeIdentifier && stackByAttributeIdentifier) {
        return [
            ...getAttributeSortItems(
                viewByAttributeIdentifier,
                ASC,
                false
            ),
            ...getAllMeasuresSorts(afm)
        ];
    }

    return [];
}
