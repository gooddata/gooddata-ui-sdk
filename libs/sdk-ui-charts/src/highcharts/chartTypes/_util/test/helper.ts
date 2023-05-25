// (C) 2007-2022 GoodData Corporation
import { DataViewFacade, IHeaderPredicate } from "@gooddata/sdk-ui";
import { findAttributeInDimension, findMeasureGroupInDimensions } from "../executionResultHelper.js";
import { getChartOptions } from "../../_chartOptions/chartOptionsBuilder.js";

import {
    VIEW_BY_DIMENSION_INDEX,
    STACK_BY_DIMENSION_INDEX,
    PARENT_ATTRIBUTE_INDEX,
    PRIMARY_ATTRIBUTE_INDEX,
} from "../../../constants/dimensions.js";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { IChartOptions } from "../../../typings/unsafe.js";
import { recordedDataFacade } from "../../../../../__mocks__/recordings.js";
import { IMeasureGroupDescriptor } from "@gooddata/sdk-model";
import { IUnwrappedAttributeHeadersWithItems } from "../../../typings/mess.js";

const defaultDv = recordedDataFacade(
    ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewByAndStackBy,
);

export function generateChartOptions(
    dv: DataViewFacade = defaultDv,
    config: any = {
        type: "column",
        stacking: false,
    },
    drillableItems: IHeaderPredicate[] = [],
): IChartOptions {
    return getChartOptions(dv.dataView, config, drillableItems, "empty value");
}

export interface IMVS {
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"];
    viewByAttribute: IUnwrappedAttributeHeadersWithItems;
    viewByParentAttribute?: IUnwrappedAttributeHeadersWithItems;
    stackByAttribute: IUnwrappedAttributeHeadersWithItems;
}

export function getMVS(dv: DataViewFacade): IMVS {
    const dimensions = dv.meta().dimensions();
    const headerItems = dv.meta().allHeaders();
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

export function getMVSForViewByTwoAttributes(dv: DataViewFacade): IMVS {
    const mvs = getMVS(dv);

    const dimensions = dv.meta().dimensions();
    const headerItems = dv.meta().allHeaders();

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
