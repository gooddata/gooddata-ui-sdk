// (C) 2007-2018 GoodData Corporation
import {
    findAttributeInDimension,
    findMeasureGroupInDimensions
} from '../../../../helpers/executionResultHelper';
import {
    getChartOptions,
    IChartOptions
} from '../chartOptionsBuilder';

import {
    PARENT_ATTRIBUTE_INDEX,
    PRIMARY_ATTRIBUTE_INDEX,
    VIEW_BY_DIMENSION_INDEX,
    STACK_BY_DIMENSION_INDEX
} from '../constants';

import * as fixtures from '../../../../../stories/test_data/fixtures';
import { IHeaderPredicate } from '../../../../interfaces/HeaderPredicate';

export function generateChartOptions(
    dataSet: any = fixtures.barChartWithStackByAndViewByAttributes,
    config: any = {
        type: 'column',
        stacking: false
    },
    drillableItems: IHeaderPredicate[] = []
): IChartOptions {
    const {
        executionRequest: { afm, resultSpec },
        executionResponse,
        executionResult: { data, headerItems }
    } = dataSet;
    return getChartOptions(
        afm,
        resultSpec,
        executionResponse,
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
    return {
        measureGroup,
        viewByAttribute,
        stackByAttribute
    };
}

export function getTwoAttributes(dataSet: any) {
    const {
        executionResponse: { dimensions },
        executionResult: { headerItems }
    } = dataSet;
    const viewByAttribute = findAttributeInDimension(
        dimensions[VIEW_BY_DIMENSION_INDEX],
        headerItems[VIEW_BY_DIMENSION_INDEX],
        PRIMARY_ATTRIBUTE_INDEX
    );
    const viewByParentAttribute = findAttributeInDimension(
        dimensions[VIEW_BY_DIMENSION_INDEX],
        headerItems[VIEW_BY_DIMENSION_INDEX],
        PARENT_ATTRIBUTE_INDEX
    );
    return {
        viewByAttribute,
        viewByParentAttribute
    };
}
