// (C) 2019 GoodData Corporation
import noop from "lodash/noop";
import { ErrorComponent, LoadingComponent } from "../..";
import { ICoreChartProps } from "../chartProps";

const defaultErrorHandler = (error: any) => {
    console.error("Error in execution:", { error }); // tslint:disable-line no-console
};

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
