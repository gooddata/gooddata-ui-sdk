// (C) 2019-2025 GoodData Corporation

import { ErrorComponent, LoadingComponent, defaultErrorHandler } from "@gooddata/sdk-ui";

import { type ICoreChartProps } from "../../interfaces/index.js";

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
    afterRender: () => {},
    pushData: () => {},
    onError: defaultErrorHandler,
    onExportReady: () => {},
    onLoadingChanged: () => {},
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
