// (C) 2007-2023 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import { HighchartsOptions } from "../../lib";
import { IChartConfig } from "../../../interfaces";
import { getCommonResponsiveConfig } from "../_chartCreators/responsive";

const WATERFALL_TEMPLATE = {
    chart: {
        type: "waterfall",
    },
};

export function getWaterfallConfiguration(_config: IChartConfig): HighchartsOptions {
    const configuration = cloneDeep(WATERFALL_TEMPLATE);

    return {
        ...configuration,
        responsive: getCommonResponsiveConfig(),
    };
}
