// (C) 2026 GoodData Corporation

import type { IColorPalette } from "@gooddata/sdk-model";
import { DefaultColorPalette } from "@gooddata/sdk-ui";
import type { IColorMapping } from "@gooddata/sdk-ui-vis-commons";

import type { IGeoChartConfig } from "../../types/config/unified.js";
import type { IGeoLayer } from "../../types/layers/index.js";

const EMPTY_COLOR_MAPPING: IColorMapping[] = [];

export interface IResolvedLayerColorConfig {
    colorPalette: IColorPalette;
    colorMapping: IColorMapping[];
}

/**
 * Resolves effective color configuration for a layer.
 *
 * @remarks
 * Precedence: layer config > chart config > defaults.
 *
 * @internal
 */
export function resolveLayerColorConfig(
    layer: Pick<IGeoLayer, "config"> | undefined,
    chartConfig: IGeoChartConfig | undefined,
): IResolvedLayerColorConfig {
    return {
        colorPalette: layer?.config?.colorPalette ?? chartConfig?.colorPalette ?? DefaultColorPalette,
        colorMapping: layer?.config?.colorMapping ?? chartConfig?.colorMapping ?? EMPTY_COLOR_MAPPING,
    };
}
