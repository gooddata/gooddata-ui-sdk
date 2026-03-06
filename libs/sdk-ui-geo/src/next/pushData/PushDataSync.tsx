// (C) 2025-2026 GoodData Corporation

import { type ReactElement, useMemo } from "react";

import { type IColorPalette } from "@gooddata/sdk-model";
import { type IColorMapping, type IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { useGeoChartProps } from "../context/GeoChartContext.js";
import { type IGeoLayerData, useGeoLayers } from "../context/GeoLayersContext.js";
import { useGeoPushData } from "../hooks/pushData/useGeoPushData.js";
import { getAreaColorStrategy } from "../layers/area/coloring/colorStrategy.js";
import { getPushpinColorStrategy } from "../layers/pushpin/coloring/colorStrategy.js";
import { type IAvailableLegends } from "../types/common/legends.js";
import { type GeoLayerType } from "../types/layers/index.js";
import { resolveLayerColorConfig } from "../utils/color/resolveLayerColorConfig.js";
import { isAttributeOnlyGeoData } from "../utils/legend/legendUtils.js";
import { getHeaderPredicateFingerprint } from "../utils/predicateFingerprint.js";

interface IPushDataSyncProps {
    availableLegends?: IAvailableLegends;
    geoLayerType: GeoLayerType;
}

const EMPTY_COLOR_MAPPING: IColorMapping[] = [];

function detectAttributeOnlyLegend(layers: Map<string, IGeoLayerData>): boolean {
    for (const layerData of layers.values()) {
        if (!layerData.geoData) {
            continue;
        }

        if (isAttributeOnlyGeoData(layerData.geoData, layerData.layerType)) {
            return true;
        }
    }

    return false;
}

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

function colorMappingKey(colorMapping: readonly IColorMapping[]): string {
    return colorMapping
        .map(
            (mapping, index) =>
                `${mapping.id ?? index}:${getHeaderPredicateFingerprint(mapping.predicate)}:${stringify(mapping.color)}`,
        )
        .join("|");
}

export function PushDataSync({ availableLegends, geoLayerType }: IPushDataSyncProps): ReactElement | null {
    const { config } = useGeoChartProps();
    const { primaryLayer, layerExecutions, layers } = useGeoLayers();
    const primaryLayerDefinition = layerExecutions[0]?.layer;
    const resolvedColorConfig = resolveLayerColorConfig(primaryLayerDefinition, config);
    const colorPalette = resolvedColorConfig.colorPalette;
    const colorMapping = resolvedColorConfig.colorMapping ?? EMPTY_COLOR_MAPPING;

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
    const hasAttributeOnlyLegend = detectAttributeOnlyLegend(layers);

    useGeoPushData(colorStrategy, stableColorPalette, {
        useProps: useGeoChartProps,
        useLegendContext: () => ({
            availableLegends: availableLegends ?? {
                hasCategoryLegend: false,
                hasColorLegend: false,
            },
            hasAttributeOnlyLegend,
        }),
        geoLayerType,
    });

    return null;
}
