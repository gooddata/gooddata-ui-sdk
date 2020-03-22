// (C) 2007-2020 GoodData Corporation
import { DataViewFacade } from "@gooddata/sdk-backend-spi";
import { findAttributeInDimension, findMeasureGroupInDimensions } from "../../utils/executionResultHelper";
import { getChartOptions } from "../chartOptionsBuilder";

import {
    VIEW_BY_DIMENSION_INDEX,
    STACK_BY_DIMENSION_INDEX,
    PARENT_ATTRIBUTE_INDEX,
    PRIMARY_ATTRIBUTE_INDEX,
} from "../../constants/dimensions";

import { IHeaderPredicate } from "@gooddata/sdk-ui";
import { recordedDataView } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { IChartOptions } from "../../typings/unsafe";

const defaultDv = recordedDataView(ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewByAndStackBy);

export function generateChartOptions(
    dv: DataViewFacade = defaultDv,
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
