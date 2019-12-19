// (C) 2019 GoodData Corporation
import noop = require("lodash/noop");
import { ErrorComponent, LoadingComponent, defaultErrorHandler } from "../../base";
import { ICoreChartProps } from "../chartProps";

export const defaultCoreChartProps: Partial<ICoreChartProps> = {
    execution: undefined,
    locale: "en-US",
    drillableItems: [],
    afterRender: noop,
    pushData: noop,
    onError: defaultErrorHandler,
    onExportReady: noop,
    onLoadingChanged: noop,
    onDrill: () => true,
    ErrorComponent,
    LoadingComponent,
};
