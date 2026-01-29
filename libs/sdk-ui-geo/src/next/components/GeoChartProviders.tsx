// (C) 2025-2026 GoodData Corporation

import { type ReactElement, type ReactNode, useMemo } from "react";

import { type IColorPalette } from "@gooddata/sdk-model";

import { GeoLayersProvider, useGeoLayers } from "../context/GeoLayersContext.js";
import { GeoLegendProvider } from "../context/GeoLegendContext.js";
import { InitialExecutionContextProvider } from "../context/InitialExecutionContext.js";
import type { ILayerPreparedData } from "../hooks/layers/useLayersPrepare.js";
import type { ILayerExecutionRecord } from "../types/props/geoChart/internal.js";

interface IGeoChartProvidersProps {
    children: ReactNode;
    layerExecutions: ILayerExecutionRecord[];
    layerOutputs: Map<string, ILayerPreparedData>;
    colorPalette: IColorPalette;
}

export function GeoChartProviders({
    children,
    layerExecutions,
    layerOutputs,
    colorPalette,
}: IGeoChartProvidersProps): ReactElement {
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
