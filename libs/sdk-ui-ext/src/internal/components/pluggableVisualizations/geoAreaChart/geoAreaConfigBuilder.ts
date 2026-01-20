// (C) 2025-2026 GoodData Corporation

import { type IGeoAreaChartConfig } from "@gooddata/sdk-ui-geo/next";
import { type IColorMapping } from "@gooddata/sdk-ui-vis-commons";

import { type IVisProps, type IVisualizationProperties } from "../../../interfaces/Visualization.js";

interface IBuildAreaVisualizationConfigParams {
    options: IVisProps;
    supportedControls: IVisualizationProperties;
    colorMapping: IColorMapping[] | undefined;
    environment: string;
}

interface IGeoAreaControls {
    legend?: IGeoAreaChartConfig["legend"];
    viewport?: IGeoAreaChartConfig["viewport"];
    mapStyle?: IGeoAreaChartConfig["mapStyle"];
    maxZoomLevel?: IGeoAreaChartConfig["maxZoomLevel"];
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
    environment: _environment,
}: IBuildAreaVisualizationConfigParams): IGeoAreaChartConfig {
    const { config = {} } = options;
    const { colorPalette, separators, maxZoomLevel: configMaxZoomLevel, isInEditMode, isExportMode } = config;
    const controls = (supportedControls.controls ?? supportedControls ?? {}) as IGeoAreaControls;
    const { legend = {}, viewport = {}, mapStyle, maxZoomLevel: controlsMaxZoomLevel } = controls;
    const legendEnabled = legend?.enabled;
    const legendPosition = legend?.position;
    // Explicit undefined check - null is a meaningful value that clears the zoom limit
    const maxZoomLevel = configMaxZoomLevel === undefined ? controlsMaxZoomLevel : configMaxZoomLevel;

    // Build viewport configuration with frozen state during edit/export
    const viewportProp = {
        viewport: {
            ...viewport,
            frozen: isInEditMode || isExportMode,
        },
    };

    return {
        isExportMode,
        separators,
        colorPalette,
        colorMapping,
        legend: {
            enabled: legendEnabled,
            position: legendPosition,
        },
        ...viewportProp,
        mapStyle,
        maxZoomLevel,
    };
}
