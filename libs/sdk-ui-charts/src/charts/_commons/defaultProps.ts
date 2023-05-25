// (C) 2019-2020 GoodData Corporation
import noop from "lodash/noop.js";
import { ErrorComponent, LoadingComponent, defaultErrorHandler } from "@gooddata/sdk-ui";
import { ICoreChartProps } from "../../interfaces/index.js";

export const defaultCoreChartProps: Pick<
    ICoreChartProps,
    | "locale"
    | "drillableItems"
    | "afterRender"
    | "pushData"
    | "onError"
    | "onExportReady"
    | "onLoadingChanged"
    | "onDrill"
    | "ErrorComponent"
    | "LoadingComponent"
> = {
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
