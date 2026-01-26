// (C) 2007-2025 GoodData Corporation
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { type ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";
import { type IMeasureGroupDescriptor } from "@gooddata/sdk-model";
import { type DataViewFacade, type IHeaderPredicate } from "@gooddata/sdk-ui";

import { recordedDataFacade } from "../../../../../testUtils/recordings.js";
import {
    PARENT_ATTRIBUTE_INDEX,
    PRIMARY_ATTRIBUTE_INDEX,
    STACK_BY_DIMENSION_INDEX,
    VIEW_BY_DIMENSION_INDEX,
} from "../../../constants/dimensions.js";
import { type IUnwrappedAttributeHeadersWithItems } from "../../../typings/mess.js";
import { type IChartOptions } from "../../../typings/unsafe.js";
import { getChartOptions } from "../../_chartOptions/chartOptionsBuilder.js";
import { findAttributeInDimension, findMeasureGroupInDimensions } from "../executionResultHelper.js";

const defaultDv = recordedDataFacade(
    ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewByAndStackBy as unknown as ScenarioRecording,
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
