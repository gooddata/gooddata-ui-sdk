// (C) 2007-2018 GoodData Corporation
import {
    getChartOptions,
    findMeasureGroupInDimensions,
    findAttributeInDimension
} from '../chartOptionsBuilder';

import {
    VIEW_BY_DIMENSION_INDEX,
    STACK_BY_DIMENSION_INDEX
} from '../constants';

import * as fixtures from '../../../../../stories/test_data/fixtures';
import { IDrillableItem } from '../../../..';

export function generateChartOptions(
    dataSet: any = fixtures.barChartWithStackByAndViewByAttributes,
    config: any = {
        type: 'column',
        stacking: false
    },
    drillableItems: IDrillableItem[] = []
) {
    const {
        executionRequest: { afm, resultSpec },
        executionResponse: { dimensions },
        executionResult: { data, headerItems }
    } = dataSet;
    return getChartOptions(
        afm,
        resultSpec,
        dimensions,
        data,
        headerItems,
        config,
        drillableItems
    );
}

export function getMVS(dataSet: any) {
    const {
        executionResponse: { dimensions },
        executionResult: { headerItems }
    } = dataSet;
    const measureGroup = findMeasureGroupInDimensions(dimensions);
    const viewByAttribute = findAttributeInDimension(
        dimensions[VIEW_BY_DIMENSION_INDEX],
        headerItems[VIEW_BY_DIMENSION_INDEX]
    );
    const stackByAttribute = findAttributeInDimension(
        dimensions[STACK_BY_DIMENSION_INDEX],
        headerItems[STACK_BY_DIMENSION_INDEX]
    );
    return [
        measureGroup,
        viewByAttribute,
        stackByAttribute
    ];
}
