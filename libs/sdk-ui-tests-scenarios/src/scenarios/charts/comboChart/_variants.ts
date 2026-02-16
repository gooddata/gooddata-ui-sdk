// (C) 2007-2026 GoodData Corporation

import { type ComboChartTypes } from "./base.js";
import { type UnboundVisProps, type VisProps } from "../../../scenario.js";
import { type CustomizedScenario } from "../../../scenarioGroup.js";

const AllExplicitCombinations: ComboChartTypes[][] = [
    ["column", "column"],
    ["area", "area"],
    ["line", "line"],
    ["column", "line"],
    ["line", "column"],
    ["column", "area"],
    ["area", "column"],
    ["line", "area"],
    ["area", "line"],
];

export function comboVariants<T extends VisProps>(
    baseName: string,
    baseProps: UnboundVisProps<T>,
): Array<CustomizedScenario<T>> {
    return AllExplicitCombinations.map((c) => [
        baseName + c.join("-"),
        {
            ...baseProps,
            config: { primaryChartType: c[0], secondaryChartType: c[1] },
        },
    ]);
}
