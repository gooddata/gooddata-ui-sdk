// (C) 2019-2025 GoodData Corporation
import noop from "lodash/noop.js";
import { ErrorComponent, LoadingComponent, defaultErrorHandler } from "@gooddata/sdk-ui";
import { ICoreChartProps } from "../../interfaces/index.js";

const defaultCoreChartProps: Pick<
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

export function withDefaultCoreChartProps<P extends Partial<ICoreChartProps>>(
    props: P,
): P & typeof defaultCoreChartProps {
    return {
        ...defaultCoreChartProps,
        ...props,
    };
}
