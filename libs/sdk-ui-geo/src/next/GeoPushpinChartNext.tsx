// (C) 2025 GoodData Corporation

import { ReactElement } from "react";

import { IntlWrapper } from "@gooddata/sdk-ui";
import { ThemeContextProvider } from "@gooddata/sdk-ui-theme-provider";

import { ErrorComponent } from "./components/ErrorComponent.js";
import { LoadingComponent } from "./components/LoadingComponent.js";
import { GeoLegendProvider } from "./context/GeoLegendContext.js";
import { GeoPushpinDataProvider } from "./context/GeoPushpinDataContext.js";
import { GeoPushpinPropsProvider } from "./context/GeoPushpinPropsContext.js";
import { InitialExecutionContextProvider } from "./context/InitialExecutionContext.js";
import { MapInstanceProvider } from "./context/MapInstanceContext.js";
import { useInitExecution } from "./hooks/init/useInitExecution.js";
import { useInitExecutionResult } from "./hooks/init/useInitExecutionResult.js";
import { useResolvedProps } from "./hooks/shared/useResolvedProps.js";
import { RenderGeoPushpinChart } from "./RenderGeoPushpinChart.js";
import { ICoreGeoPushpinChartNextProps } from "./types/internal.js";
import { IGeoPushpinChartNextProps } from "./types/public.js";

/**
 * @alpha
 */
export function GeoPushpinChartNext(props: IGeoPushpinChartNextProps): ReactElement {
    const resolvedProps = useResolvedProps(props);
    const execution = useInitExecution(resolvedProps);
    return <GeoPushpinChartNextImplementation {...resolvedProps} execution={execution} />;
}

/**
 * @internal
 */
export function GeoPushpinChartNextImplementation(props: ICoreGeoPushpinChartNextProps): ReactElement {
    return (
        <IntlWrapper locale={props.locale}>
            <ThemeContextProvider theme={props.theme || {}} themeIsLoading={false}>
                <GeoPushpinPropsProvider {...props}>
                    <MapInstanceProvider>
                        <GeoPushpinChartNextWithInitialization />
                    </MapInstanceProvider>
                </GeoPushpinPropsProvider>
            </ThemeContextProvider>
        </IntlWrapper>
    );
}

/**
 * @internal
 */
function GeoPushpinChartNextWithInitialization(): ReactElement {
    const { result: dataView, status, error } = useInitExecutionResult();

    if (status === "error") {
        return <ErrorComponent error={error} />;
    }

    if (status === "pending" || status === "loading") {
        return <LoadingComponent />;
    }

    return (
        <InitialExecutionContextProvider initialDataView={dataView}>
            <GeoPushpinDataProvider>
                <GeoLegendProvider>
                    <RenderGeoPushpinChart />
                </GeoLegendProvider>
            </GeoPushpinDataProvider>
        </InitialExecutionContextProvider>
    );
}
