// (C) 2007-2019 GoodData Corporation
import { ScenarioNameAndProps, UnboundVisProps, VisProps } from "../../../src";
import { ComboChartTypes } from "./base";

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
): Array<ScenarioNameAndProps<T>> {
    return AllExplicitCombinations.map(c => [
        baseName + c.join("-"),
        {
            ...baseProps,
            config: { primaryChartType: c[0], secondaryChartType: c[1] },
        },
    ]);
}
