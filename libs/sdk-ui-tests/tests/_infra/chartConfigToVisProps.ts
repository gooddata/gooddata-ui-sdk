// (C) 2020 GoodData Corporation
import omit = require("lodash/omit");
import isEmpty = require("lodash/isEmpty");
import { IAxisConfig, IChartConfig } from "@gooddata/sdk-ui";

const ConfigNotApplicableInInsight: Array<keyof IChartConfig> = [
    "colorPalette",
    "colors",
    "separators",
    "limits",
    "type",
];
const AxisAlignmentMapping = {
    x: {
        low: "left",
        middle: "center",
        high: "right",
    },
    y: {
        low: "bottom",
        middle: "center",
        high: "top",
    },
};

function axisNameAlignmentCorrection(axisType: "x" | "y", axisConfig?: IAxisConfig): any {
    if (!axisConfig || isEmpty(axisConfig)) {
        return {};
    }

    const nameAlignment = axisConfig.name?.position;

    if (!nameAlignment) {
        return axisConfig;
    }

    return {
        ...axisConfig,
        name: {
            position: AxisAlignmentMapping[axisType][nameAlignment],
        },
    };
}

function chartConfigToControls(chartConfig: IChartConfig): any {
    const xaxis = chartConfig.xaxis ? { xaxis: axisNameAlignmentCorrection("x", chartConfig.xaxis) } : {};
    // tslint:disable-next-line:variable-name
    const secondary_xaxis = chartConfig.secondary_xaxis
        ? { secondary_xaxis: axisNameAlignmentCorrection("x", chartConfig.secondary_xaxis) }
        : {};
    const yaxis = chartConfig.yaxis ? { yaxis: axisNameAlignmentCorrection("y", chartConfig.yaxis) } : {};
    // tslint:disable-next-line:variable-name
    const secondary_yaxis = chartConfig.secondary_yaxis
        ? { secondary_yaxis: axisNameAlignmentCorrection("y", chartConfig.secondary_yaxis) }
        : {};

    return {
        ...chartConfig,
        ...xaxis,
        ...secondary_xaxis,
        ...yaxis,
        ...secondary_yaxis,
    };
}

/**
 * Transforms chart config to visualization properties as stored in insight. This is a simple transformation
 * that strips away those config props which are not applicable for plug viz.
 *
 * @param chartConfig - may be undefined
 */
export function chartConfigToVisProperties(chartConfig: IChartConfig = {}): any {
    const cleanedConfig = omit(chartConfig, ConfigNotApplicableInInsight);
    const controls = chartConfigToControls(cleanedConfig);

    /*
     * Indeed, the properties content is stored in 'properties' entry in insight AND the content itself
     * is wrapped in another object under 'properties' entry.
     *
     * For more see: getSupportedProperties in propertiesHelper.ts or the code that creates insight from
     * bear visualization object.
     *
     * TODO: remove this double wrap
     */
    return {
        properties: {
            controls,
        },
    };
}
