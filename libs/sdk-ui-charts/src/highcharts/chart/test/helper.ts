// (C) 2007-2019 GoodData Corporation
import { DataViewFacade } from "@gooddata/sdk-backend-spi";
import { barChartWithStackByAndViewByAttributes } from "../../../../__mocks__/fixtures";
import { findAttributeInDimension, findMeasureGroupInDimensions } from "../../utils/executionResultHelper";
import { getChartOptions } from "../chartOptionsBuilder";

import {
    VIEW_BY_DIMENSION_INDEX,
    STACK_BY_DIMENSION_INDEX,
    PARENT_ATTRIBUTE_INDEX,
    PRIMARY_ATTRIBUTE_INDEX,
} from "../../constants/dimensions";

import { IHeaderPredicate } from "../../../base/headerMatching/HeaderPredicate";
import { IChartOptions } from "../../Config";

export function generateChartOptions(
    dv: DataViewFacade = barChartWithStackByAndViewByAttributes,
    config: any = {
        type: "column",
        stacking: false,
    },
    drillableItems: IHeaderPredicate[] = [],
): IChartOptions {
    return getChartOptions(dv.dataView, config, drillableItems);
}

export function getMVS(dv: DataViewFacade) {
    const dimensions = dv.dimensions();
    const headerItems = dv.allHeaders();
    const measureGroup = findMeasureGroupInDimensions(dimensions);
    const viewByAttribute = findAttributeInDimension(
        dimensions[VIEW_BY_DIMENSION_INDEX],
        headerItems[VIEW_BY_DIMENSION_INDEX],
    );
    const stackByAttribute = findAttributeInDimension(
        dimensions[STACK_BY_DIMENSION_INDEX],
        headerItems[STACK_BY_DIMENSION_INDEX],
    );
    return {
        measureGroup,
        viewByAttribute,
        stackByAttribute,
    };
}

export function getMVSForViewByTwoAttributes(dv: DataViewFacade) {
    const mvs = getMVS(dv);

    const dimensions = dv.dimensions();
    const headerItems = dv.allHeaders();

    const viewByParentAttribute = findAttributeInDimension(
        dimensions[VIEW_BY_DIMENSION_INDEX],
        headerItems[VIEW_BY_DIMENSION_INDEX],
        PARENT_ATTRIBUTE_INDEX,
    );
    const viewByAttribute = findAttributeInDimension(
        dimensions[VIEW_BY_DIMENSION_INDEX],
        headerItems[VIEW_BY_DIMENSION_INDEX],
        PRIMARY_ATTRIBUTE_INDEX,
    );
    return {
        ...mvs,
        viewByAttribute,
        viewByParentAttribute,
    };
}
