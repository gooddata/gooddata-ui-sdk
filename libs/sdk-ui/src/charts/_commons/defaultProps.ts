// (C) 2019 GoodData Corporation
import noop = require("lodash/noop");
import { ErrorComponent } from "../../base/react/ErrorComponent";
import { LoadingComponent } from "../../base/react/LoadingComponent";
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
