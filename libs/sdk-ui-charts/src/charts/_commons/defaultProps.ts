// (C) 2019-2020 GoodData Corporation
import noop from "lodash/noop";
import { ErrorComponent, LoadingComponent, defaultErrorHandler } from "@gooddata/sdk-ui";
import { ICoreChartProps } from "../../interfaces";

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
