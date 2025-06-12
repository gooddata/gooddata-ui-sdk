// (C) 2007-2019 GoodData Corporation
import { IAxisNameConfig, IBucketChartProps, IChartConfig } from "@gooddata/sdk-ui-charts";
import { CustomizedScenario, UnboundVisProps } from "../../../src/index.js";

function getConfig(nameConfig: IAxisNameConfig): IChartConfig {
    const { visible = true, position = "middle" } = nameConfig;
    return {
        xaxis: {
            name: {
                visible,
                position,
            },
        },
        secondary_xaxis: {
            name: {
                visible,
                position,
            },
        },
        yaxis: {
            name: {
                visible,
                position,
            },
        },
        secondary_yaxis: {
            name: {
                visible,
                position,
            },
        },
    };
}

const ConfigVariants: Array<[string, IChartConfig]> = [
    ["low", getConfig({ position: "low" })],
    ["middle", getConfig({ position: "middle" })],
    ["high", getConfig({ position: "high" })],
    ["invisible", getConfig({ visible: false })],
];

function merge(original: IChartConfig = {}, axisNames: IChartConfig): IChartConfig {
    const xaxis = original.xaxis ? original.xaxis : {};
    const yaxis = original.yaxis ? original.yaxis : {};
    const secondaryX = original.secondary_xaxis ? original.secondary_xaxis : {};
    const secondaryY = original.secondary_yaxis ? original.secondary_yaxis : {};

    return {
        ...original,
        xaxis: { ...xaxis, name: axisNames.xaxis!.name },
        yaxis: { ...yaxis, name: axisNames.yaxis!.name },
        secondary_xaxis: { ...secondaryX, name: axisNames.secondary_xaxis!.name },
        secondary_yaxis: { ...secondaryY, name: axisNames.secondary_yaxis!.name },
    };
}

export function axisNameCustomization<T extends IBucketChartProps>(
    baseName: string,
    baseProps: UnboundVisProps<T>,
): Array<CustomizedScenario<T>> {
    return ConfigVariants.map(([variantName, config]) => {
        return [`${baseName} - ${variantName}`, { ...baseProps, config: merge(baseProps.config, config) }];
    });
}
