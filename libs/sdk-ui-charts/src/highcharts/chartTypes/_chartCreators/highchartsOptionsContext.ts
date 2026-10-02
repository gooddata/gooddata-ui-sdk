// (C) 2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import { type ITheme } from "@gooddata/sdk-model";
import { type IDrillConfig } from "@gooddata/sdk-ui";

import { type IChartConfig } from "../../../interfaces/chartConfig.js";
import { type IChartOptions } from "../../typings/unsafe.js";

export interface IHighchartsOptionsContext {
    chartOptions: IChartOptions;
    chartConfig: IChartConfig;
    drillConfig: IDrillConfig;
    intl: IntlShape;
    theme?: ITheme;
}
