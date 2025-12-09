// (C) 2025 GoodData Corporation

import { ReactElement, ReactNode, useMemo } from "react";

import { IColorPalette } from "@gooddata/sdk-model";

import { GeoLayersProvider, useGeoLayers } from "../context/GeoLayersContext.js";
import { GeoLegendProvider } from "../context/GeoLegendContext.js";
import { InitialExecutionContextProvider } from "../context/InitialExecutionContext.js";
import type { ILayerPreparedData } from "../hooks/layers/useLayersPrepare.js";
import type { ILayerExecutionRecord } from "../types/props/geoChartNext/internal.js";

interface IGeoChartNextProvidersProps {
    children: ReactNode;
    layerExecutions: ILayerExecutionRecord[];
    layerOutputs: Map<string, ILayerPreparedData>;
    colorPalette: IColorPalette;
}

export function GeoChartNextProviders({
    children,
    layerExecutions,
    layerOutputs,
    colorPalette,
}: IGeoChartNextProvidersProps): ReactElement {
    return (
        <GeoLayersProvider
            layerExecutions={layerExecutions}
            layerOutputs={layerOutputs}
            colorPalette={colorPalette}
        >
            <GeoLegendProvider>
                <InitialExecutionProvider>{children}</InitialExecutionProvider>
            </GeoLegendProvider>
        </GeoLayersProvider>
    );
}

function InitialExecutionProvider({ children }: { children: ReactNode }): ReactElement {
    const { primaryLayer } = useGeoLayers();
    const initialDataView = useMemo(() => primaryLayer?.dataView ?? null, [primaryLayer?.dataView]);

    return (
        <InitialExecutionContextProvider initialDataView={initialDataView}>
            {children}
        </InitialExecutionContextProvider>
    );
}
