// (C) 2025 GoodData Corporation

import { IGeoAreaChartConfig } from "@gooddata/sdk-ui-geo/next";
import { IColorMapping } from "@gooddata/sdk-ui-vis-commons";

import { IVisProps, IVisualizationProperties } from "../../../interfaces/Visualization.js";

interface IBuildAreaVisualizationConfigParams {
    options: IVisProps;
    supportedControls: IVisualizationProperties;
    colorMapping: IColorMapping[] | undefined;
    environment: string;
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
    const { colorPalette, separators } = config;
    const controls = supportedControls.controls ?? supportedControls ?? {};
    const { legend = {}, viewport = {}, tooltipText, mapStyle } = controls;

    return {
        separators,
        colorPalette,
        colorMapping,
        legend: {
            enabled: legend.enabled,
            position: legend.position,
        },
        tooltipText,
        viewport: {
            area: viewport.area,
        },
        mapStyle,
    };
}
