// (C) 2025-2026 GoodData Corporation

import { type ReactElement, useMemo } from "react";

import { type IColorPalette } from "@gooddata/sdk-model";
import { DefaultColorPalette } from "@gooddata/sdk-ui";
import { type IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { useGeoChartProps } from "../context/GeoChartContext.js";
import { useGeoLayers } from "../context/GeoLayersContext.js";
import { useGeoPushData } from "../hooks/pushData/useGeoPushData.js";
import { getAreaColorStrategy } from "../layers/area/coloring/colorStrategy.js";
import { getPushpinColorStrategy } from "../layers/pushpin/coloring/colorStrategy.js";
import { type IAvailableLegends } from "../types/common/legends.js";
import { type GeoLayerType } from "../types/layers/index.js";

type PushDataSyncProps = {
    availableLegends?: IAvailableLegends;
    geoLayerType: GeoLayerType;
};

const EMPTY_COLOR_MAPPING: [] = [];

function stringify(value: unknown): string {
    try {
        return JSON.stringify(value);
    } catch {
        return "";
    }
}

function colorPaletteKey(palette: IColorPalette): string {
    return palette.map((p) => `${p.guid}:${stringify(p.fill)}`).join("|");
}

function colorMappingKey(colorMapping: readonly { id?: string; color: unknown }[]): string {
    return colorMapping.map((m, index) => `${m.id ?? index}:${stringify(m.color)}`).join("|");
}

export function PushDataSync({ availableLegends, geoLayerType }: PushDataSyncProps): ReactElement | null {
    const { primaryLayer, layerExecutions } = useGeoLayers();
    const primaryLayerDefinition = layerExecutions[0]?.layer;
    const colorPalette = primaryLayerDefinition?.config?.colorPalette ?? DefaultColorPalette;
    const colorMapping = primaryLayerDefinition?.config?.colorMapping ?? EMPTY_COLOR_MAPPING;

    const paletteKey = useMemo(() => colorPaletteKey(colorPalette), [colorPalette]);
    const mappingKey = useMemo(() => colorMappingKey(colorMapping), [colorMapping]);

    const paletteCache = useMemo(() => new Map<string, IColorPalette>(), []);
    const stableColorPalette = useMemo(() => {
        const cached = paletteCache.get(paletteKey);
        if (cached) {
            return cached;
        }
        paletteCache.set(paletteKey, colorPalette);
        return colorPalette;
    }, [paletteCache, paletteKey, colorPalette]);

    const mappingCache = useMemo(() => new Map<string, typeof colorMapping>(), []);
    const stableColorMapping = useMemo(() => {
        const cached = mappingCache.get(mappingKey);
        if (cached) {
            return cached;
        }
        mappingCache.set(mappingKey, colorMapping);
        return colorMapping;
    }, [mappingCache, mappingKey, colorMapping]);

    const colorStrategy: IColorStrategy | null = useMemo(() => {
        if (!primaryLayer?.geoData || !primaryLayer.dataView) {
            return null;
        }

        return primaryLayer.layerType === "pushpin"
            ? getPushpinColorStrategy(
                  stableColorPalette,
                  stableColorMapping,
                  primaryLayer.geoData,
                  primaryLayer.dataView,
              )
            : getAreaColorStrategy(
                  stableColorPalette,
                  stableColorMapping,
                  primaryLayer.geoData,
                  primaryLayer.dataView,
              );
    }, [
        primaryLayer?.geoData,
        primaryLayer?.dataView,
        primaryLayer?.layerType,
        stableColorPalette,
        stableColorMapping,
    ]);

    useGeoPushData(colorStrategy, stableColorPalette, {
        useProps: useGeoChartProps,
        useLegendContext: () => ({
            availableLegends: availableLegends ?? {
                hasCategoryLegend: false,
                hasColorLegend: false,
            },
        }),
        geoLayerType,
    });

    return null;
}
