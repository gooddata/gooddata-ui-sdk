// (C) 2007-2019 GoodData Corporation

import { UnboundVisProps, CustomizedScenario } from "../../../src/index.js";
import { ILegendConfig, IBucketChartProps } from "@gooddata/sdk-ui-charts";

const LegendVariants: Array<[string, ILegendConfig]> = [
    ["auto legend", { position: "auto" }],
    ["legend on left", { position: "left" }],
    ["legend on right", { position: "right" }],
    ["legend on top", { position: "top" }],
    ["legend at bottom", { position: "bottom" }],
    ["disabled", { enabled: false }],
];

const LegendVariantForceEnables: Array<[string, ILegendConfig]> = [
    ["default legend", {}],
    ["auto legend", { position: "auto", enabled: true }],
    ["legend on left", { position: "left", enabled: true }],
    ["legend on right", { position: "right", enabled: true }],
    ["legend on top", { position: "top", enabled: true }],
    ["legend at bottom", { position: "bottom", enabled: true }],
    ["disabled", { enabled: false }],
];

function buildLegendCustomizer<T extends IBucketChartProps>(
    legendVariants: Array<[string, ILegendConfig]>,
    baseName: string,
    baseProps: UnboundVisProps<T>,
): Array<CustomizedScenario<T>> {
    return legendVariants.map(([variantName, legendConfig]) => {
        return [
            `${baseName} - ${variantName}`,
            { ...baseProps, config: { ...baseProps.config, legend: legendConfig } },
        ];
    });
}

export function legendCustomizer<T extends IBucketChartProps>(
    baseName: string,
    baseProps: UnboundVisProps<T>,
): Array<CustomizedScenario<T>> {
    return buildLegendCustomizer(LegendVariants, baseName, baseProps);
}

export function legendForceEnabledCustomizer<T extends IBucketChartProps>(
    baseName: string,
    baseProps: UnboundVisProps<T>,
): Array<CustomizedScenario<T>> {
    return buildLegendCustomizer(LegendVariantForceEnables, baseName, baseProps);
}
