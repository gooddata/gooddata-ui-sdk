// (C) 2007-2019 GoodData Corporation
import { Execution } from "@gooddata/typings";
import { getTreemapAttributes } from "../../highcharts/chart/chartOptionsBuilder";
import { STACK_BY_DIMENSION_INDEX } from "../../highcharts/chart/constants";
import { IUnwrappedAttributeHeadersWithItems } from "../../highcharts/chart/types";
import { isTreemap } from "../../highcharts/utils/common";
import { findAttributeInDimension } from "./executionResultHelper";
import { IChartConfig } from "../../interfaces/Config";

export function getStackByAttribute(
    config: IChartConfig,
    dimensions: Execution.IResultDimension[],
    attributeHeaderItems: Execution.IResultHeaderItem[][][],
): IUnwrappedAttributeHeadersWithItems {
    const { type, mdObject } = config;

    if (isTreemap(type)) {
        const { stackByAttribute } = getTreemapAttributes(dimensions, attributeHeaderItems, mdObject);
        return stackByAttribute;
    }

    return findAttributeInDimension(
        dimensions[STACK_BY_DIMENSION_INDEX],
        attributeHeaderItems[STACK_BY_DIMENSION_INDEX],
    );
}
