// (C) 2007-2019 GoodData Corporation
import { CustomizedScenario, UnboundVisProps, VisProps } from "../../../src/index.js";
import { ComboChartTypes } from "./base.js";

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
