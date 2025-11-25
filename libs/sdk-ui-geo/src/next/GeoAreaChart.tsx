// (C) 2025 GoodData Corporation

import { ReactElement } from "react";

import { IntlWrapper } from "@gooddata/sdk-ui";
import { ThemeContextProvider } from "@gooddata/sdk-ui-theme-provider";

import { ErrorComponent } from "./components/ErrorComponent.js";
import { LoadingComponent } from "./components/LoadingComponent.js";
import { GeoAreaCollectionProvider } from "./context/GeoAreaCollectionContext.js";
import { GeoAreaDataProvider } from "./context/GeoAreaDataContext.js";
import { GeoAreaPropsProvider } from "./context/GeoAreaPropsContext.js";
import { GeoLegendProvider } from "./context/GeoLegendContext.js";
import { GeoPushpinPropsProvider } from "./context/GeoPushpinPropsContext.js";
import { InitialExecutionContextProvider } from "./context/InitialExecutionContext.js";
import { MapInstanceProvider } from "./context/MapInstanceContext.js";
import { useInitExecution } from "./hooks/init/useInitExecution.js";
import { useInitExecutionResult } from "./hooks/init/useInitExecutionResult.js";
import { useResolvedAreaProps } from "./hooks/shared/useResolvedAreaProps.js";
import { RenderGeoAreaChart } from "./RenderGeoAreaChart.js";
import { ICoreGeoAreaChartProps } from "./types/areaInternal.js";
import { IGeoAreaChartProps } from "./types/areaPublic.js";
import { ICoreGeoPushpinChartNextProps } from "./types/internal.js";

/**
 * GeoAreaChart - Geographic area visualization component
 *
 * @remarks
 * This component renders an area map where geographic areas (countries, regions, states)
 * are rendered according to the provided geographic attribute. It uses MapLibre GL JS for rendering and supports:
 * - Area-based visualization with polygon fills
 * - Optional color measures or attributes for data-driven styling
 * - Optional segment attributes for categorical grouping
 * - Interactive legends that reflect the active color/segment state
 * - Drilling capabilities inherited from the GoodData.UI visualization props
 *
 * @example
 * ```tsx
 * <GeoAreaChart
 *   backend={backend}
 *   workspace={workspace}
 *   area={Md.Country}
 *   color={Md.Revenue}
 * />
 * ```
 *
 * @alpha
 */
export function GeoAreaChart(props: IGeoAreaChartProps): ReactElement {
    const resolvedProps = useResolvedAreaProps(props);
    const execution = useInitExecution(resolvedProps);
    return <GeoAreaChartImplementation {...resolvedProps} execution={execution} />;
}

/**
 * @internal
 */
export function GeoAreaChartImplementation(props: ICoreGeoAreaChartProps): ReactElement {
    return (
        <IntlWrapper locale={props.locale}>
            <ThemeContextProvider theme={props.theme || {}} themeIsLoading={false}>
                <GeoPushpinPropsProvider {...(props as unknown as ICoreGeoPushpinChartNextProps)}>
                    <GeoAreaPropsProvider {...props}>
                        <MapInstanceProvider>
                            <GeoAreaChartWithInitialization />
                        </MapInstanceProvider>
                    </GeoAreaPropsProvider>
                </GeoPushpinPropsProvider>
            </ThemeContextProvider>
        </IntlWrapper>
    );
}

/**
 * @internal
 */
function GeoAreaChartWithInitialization(): ReactElement {
    const { result: dataView, status, error } = useInitExecutionResult();

    if (status === "error") {
        return <ErrorComponent error={error} />;
    }

    if (status === "pending" || status === "loading") {
        return <LoadingComponent />;
    }

    return (
        <InitialExecutionContextProvider initialDataView={dataView}>
            <GeoAreaCollectionProvider>
                <GeoAreaDataProvider>
                    <GeoLegendProvider>
                        <RenderGeoAreaChart />
                    </GeoLegendProvider>
                </GeoAreaDataProvider>
            </GeoAreaCollectionProvider>
        </InitialExecutionContextProvider>
    );
}
