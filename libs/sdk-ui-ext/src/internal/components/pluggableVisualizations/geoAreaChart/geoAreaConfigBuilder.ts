// (C) 2025-2026 GoodData Corporation

import { type ISettings } from "@gooddata/sdk-model";
import { type IGeoAreaChartConfig } from "@gooddata/sdk-ui-geo";
import { isConcreteViewportPreset, normalizeGeoLegendPosition } from "@gooddata/sdk-ui-geo/internal";
import { type IColorMapping } from "@gooddata/sdk-ui-vis-commons";

import {
    isGeoBasemapConfigEnabled,
    isGeoChartsViewportConfigEnabled,
} from "../../../constants/featureFlags.js";
import { sanitizeGeoMapStyleOptions } from "../../../constants/geoMapStyle.js";
import { ANALYTICAL_ENVIRONMENT, DASHBOARDS_ENVIRONMENT } from "../../../constants/properties.js";
import { type IVisProps, type IVisualizationProperties } from "../../../interfaces/Visualization.js";

interface IBuildAreaVisualizationConfigParams {
    options: IVisProps;
    supportedControls: IVisualizationProperties;
    colorMapping: IColorMapping[] | undefined;
    environment: string;
    featureFlags?: ISettings;
}

interface IGeoAreaControls {
    center?: IGeoAreaChartConfig["center"];
    zoom?: IGeoAreaChartConfig["zoom"];
    bounds?: IGeoAreaChartConfig["bounds"];
    legend?: IGeoAreaChartConfig["legend"];
    viewport?: IGeoAreaChartConfig["viewport"];
    mapStyle?: IGeoAreaChartConfig["mapStyle"];
    maxZoomLevel?: IGeoAreaChartConfig["maxZoomLevel"];
    basemap?: IGeoAreaChartConfig["basemap"];
    tileset?: unknown;
    colorScheme?: IGeoAreaChartConfig["colorScheme"];
}

/**
 * Builds visualization configuration for geo area chart.
 * Extends base chart config with geo area-specific properties.
 *
 * @param params - Configuration parameters
 * @returns Area chart configuration
 * @internal
 */
export function buildAreaVisualizationConfig({
    options,
    supportedControls,
    colorMapping,
    environment,
    featureFlags,
}: IBuildAreaVisualizationConfigParams): IGeoAreaChartConfig {
    const { config = {}, a11yTitle } = options;
    const { colorPalette, separators, maxZoomLevel: configMaxZoomLevel, isInEditMode, isExportMode } = config;
    const controls = (supportedControls.controls ?? supportedControls ?? {}) as IGeoAreaControls;
    const {
        center,
        zoom,
        bounds,
        legend = {},
        viewport = {},
        mapStyle,
        maxZoomLevel: controlsMaxZoomLevel,
        basemap,
        tileset,
        colorScheme,
    } = controls;
    const legendEnabled = legend?.enabled;
    const legendPosition = normalizeGeoLegendPosition(legend?.position);
    const isBasemapConfigEnabled = isGeoBasemapConfigEnabled(featureFlags);
    const sanitizedGeoMapStyle = sanitizeGeoMapStyleOptions({
        basemap,
        legacyTileset: tileset,
        colorScheme,
    });
    const isViewportConfigEnabled = isGeoChartsViewportConfigEnabled(featureFlags);
    const isPresetViewportAreaSelected = Boolean(isConcreteViewportPreset(viewport.area));
    const sanitizedViewport = isViewportConfigEnabled
        ? viewport
        : {
              ...viewport,
              area: viewport.area === "custom" ? "auto" : viewport.area,
              navigation: undefined,
          };
    // Explicit undefined check - null is a meaningful value that clears the zoom limit
    const maxZoomLevel = configMaxZoomLevel === undefined ? controlsMaxZoomLevel : configMaxZoomLevel;

    // Build viewport configuration with frozen state during edit/export
    const viewportProp = {
        viewport: {
            ...sanitizedViewport,
            frozen: isInEditMode || isExportMode,
        },
    };
    const applyViewportNavigation =
        environment === DASHBOARDS_ENVIRONMENT
            ? true
            : environment === ANALYTICAL_ENVIRONMENT
              ? false
              : undefined;

    const areaConfig = {
        isExportMode,
        separators,
        colorPalette,
        colorMapping,
        legend: {
            enabled: legendEnabled,
            position: legendPosition,
        },
        ...(isViewportConfigEnabled && !isPresetViewportAreaSelected && center ? { center } : {}),
        ...(isViewportConfigEnabled && !isPresetViewportAreaSelected && typeof zoom === "number"
            ? { zoom }
            : {}),
        ...(isViewportConfigEnabled && !isPresetViewportAreaSelected && bounds ? { bounds } : {}),
        ...viewportProp,
        mapStyle,
        ...(sanitizedGeoMapStyle.basemap ? { basemap: sanitizedGeoMapStyle.basemap } : {}),
        ...(sanitizedGeoMapStyle.colorScheme ? { colorScheme: sanitizedGeoMapStyle.colorScheme } : {}),
        maxZoomLevel,
        a11yTitle,
        enableGeoBasemapConfig: isBasemapConfigEnabled,
        enableGeoChartA11yImprovements: featureFlags?.["enableGeoChartA11yImprovements"] ?? false,
        enableGeoChartsViewportConfig: isViewportConfigEnabled,
        applyViewportNavigation,
    };

    return areaConfig;
}
