// (C) 2026 GoodData Corporation

import { type IExecutionDefinition, type ITheme } from "@gooddata/sdk-model";

import { type IChartConfig } from "../../../interfaces/chartConfig.js";
import { type HighchartsOptions } from "../../lib/index.js";
import { getCommonResponsiveConfig } from "../_chartCreators/responsive.js";
import { styleVariables } from "../_chartCreators/styles/variables.js";
import { getAxesCounts } from "../_util/common.js";

const LINE_WIDTH = 3;
const FILL_OPACITY = 0.3;

export function getRadarConfiguration(
    config: IChartConfig,
    _definition: IExecutionDefinition,
    theme: ITheme,
): HighchartsOptions {
    const isFilledMode = (config?.radarRenderAs ?? "filled") === "filled";
    const gridLineShape = (config?.radarGridLineShape ?? "polygon") as "polygon" | "circle";

    const radarConfiguration = {
        chart: {
            polar: true,
            type: isFilledMode ? "area" : "line",
        },
        pane: {
            startAngle: 0,
            endAngle: 360,
        },
        plotOptions: {
            series: {
                marker: {
                    symbol: "circle",
                    radius: 4.5,
                    lineColor:
                        theme?.chart?.backgroundColor ??
                        theme?.palette?.complementary?.c0 ??
                        styleVariables.gdColorBackground,
                },
                lineWidth: LINE_WIDTH,
                fillOpacity: isFilledMode ? FILL_OPACITY : 0,
                states: {
                    hover: {
                        lineWidth: LINE_WIDTH + 1,
                    },
                    inactive: {
                        opacity: 1,
                    },
                },
            },
        },
        xAxis: [
            {
                categories: [] as string[],
                tickmarkPlacement: "on" as const,
                lineWidth: 0,
                title: {
                    text: null,
                },
            },
        ],
        yAxis: [
            {
                gridLineInterpolation: gridLineShape,
                title: {
                    text: null,
                },
            },
        ],
    };

    if (config?.enableCompactSize && !config?.zoomInsight) {
        const [xAxesCount, yAxesCount] = getAxesCounts(config);
        return {
            ...radarConfiguration,
            responsive: getCommonResponsiveConfig(false, xAxesCount, yAxesCount),
        };
    }

    return radarConfiguration;
}
