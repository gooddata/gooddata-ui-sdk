// (C) 2007-2019 GoodData Corporation

import { UnboundVisProps, CustomizedScenario } from "../../../src";
import { ILegendConfig, IBucketChartProps } from "@gooddata/sdk-ui-charts";

const LegendVariants: Array<[string, ILegendConfig]> = [
    ["auto legend", { position: "auto" }],
    ["legend on left", { position: "left" }],
    ["legend on right", { position: "right" }],
    ["legend on top", { position: "top" }],
    ["legend at bottom", { position: "bottom" }],
    ["disabled", { enabled: false }],
];

export function legendCustomizer<T extends IBucketChartProps>(
    baseName: string,
    baseProps: UnboundVisProps<T>,
): Array<CustomizedScenario<T>> {
    return LegendVariants.map(([variantName, legendConfig]) => {
        return [
            `${baseName} - ${variantName}`,
            { ...baseProps, config: { ...baseProps.config, legend: legendConfig } },
        ];
    });
}
