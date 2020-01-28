// (C) 2007-2019 GoodData Corporation

import { UnboundVisProps, VisProps, CustomizedScenario } from "../../../src";
import { ILegendConfig } from "@gooddata/sdk-ui";

const LegendVariants: Array<[string, ILegendConfig]> = [
    ["auto legend", { position: "auto" }],
    ["legend on left", { position: "left" }],
    ["legend on right", { position: "right" }],
    ["legend on top", { position: "top" }],
    ["legend at bottom", { position: "bottom" }],
    ["disabled", { enabled: false }],
];

export function legendCustomizer<T extends VisProps>(
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
