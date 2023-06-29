// (C) 2007-2022 GoodData Corporation
import { MAX_POINT_WIDTH } from "../_chartCreators/commonConfiguration.js";
import { LINE_WIDTH } from "../lineChart/lineConfiguration.js";
import { IChartConfig } from "../../../interfaces/index.js";
import { isLineChart } from "../_util/common.js";
import { BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";
import { bucketIsEmpty, bucketsFind, IExecutionDefinition, ITheme } from "@gooddata/sdk-model";
import { styleVariables } from "../_chartCreators/styles/variables.js";

const { COLUMN, LINE } = VisualizationTypes;

function getDefaultComboTypes(config?: IChartConfig): IChartConfig {
    return {
        primaryChartType: config?.primaryChartType ?? COLUMN,
        secondaryChartType: config?.secondaryChartType ?? LINE,
    };
}
export function getDefaultChartType(config?: IChartConfig): "line" | "column" | "area" {
    const { primaryChartType, secondaryChartType } = getDefaultComboTypes(config);

    if (primaryChartType === secondaryChartType) {
        return primaryChartType;
    }

    if (primaryChartType === COLUMN || secondaryChartType === COLUMN) {
        return COLUMN;
    }

    return LINE;
}

function isOnlyLineSeries(config: IChartConfig, definition?: IExecutionDefinition): boolean {
    const { primaryChartType, secondaryChartType } = getDefaultComboTypes(config);
    const buckets = definition ? definition.buckets : [];
    const primaryBucket = bucketsFind(buckets, BucketNames.MEASURES);
    const secondaryBucket = bucketsFind(buckets, BucketNames.SECONDARY_MEASURES);
    const isEmptyPrimaryMeasure = !primaryBucket || bucketIsEmpty(primaryBucket);
    const isEmptySecondaryMeasure = !secondaryBucket || bucketIsEmpty(secondaryBucket);
    const isLineChartOnLeftAxis = isLineChart(primaryChartType);
    const isLineChartOnRightAxis = isLineChart(secondaryChartType);
    return (
        (isLineChartOnLeftAxis && isLineChartOnRightAxis) ||
        (isLineChartOnLeftAxis && isEmptySecondaryMeasure) ||
        (isEmptyPrimaryMeasure && isLineChartOnRightAxis)
    );
}

export function getComboConfiguration(
    config?: IChartConfig,
    definition?: IExecutionDefinition,
    theme?: ITheme,
): any {
    const series = isOnlyLineSeries(config, definition)
        ? {
              series: {
                  states: {
                      inactive: {
                          opacity: 1,
                      },
                  },
                  borderColor: "#00000000",
              },
          }
        : {
              series: {
                  borderColor: "#00000000",
              },
          };
    return {
        chart: {
            type: getDefaultChartType(config),
            spacingTop: 20,
        },
        plotOptions: {
            column: {
                dataLabels: {
                    enabled: true,
                    crop: false,
                    overflow: "none",
                    padding: 2,
                },
                maxPointWidth: MAX_POINT_WIDTH,
                borderColor: "#00000000",
            },
            line: {
                marker: {
                    symbol: "circle",
                    radius: 4.5,
                    lineColor:
                        theme?.chart?.backgroundColor ??
                        theme?.palette?.complementary?.c0 ??
                        styleVariables.gdColorBackground,
                },
                lineWidth: LINE_WIDTH,
                fillOpacity: 0.3,
                stickyTracking: false,
                states: {
                    hover: {
                        lineWidth: LINE_WIDTH + 1,
                    },
                },
                dataLabels: {
                    style: {
                        fontWeight: "normal",
                    },
                },
            },
            area: {
                marker: {
                    symbol: "circle",
                    radius: 4.5,
                    lineColor:
                        theme?.chart?.backgroundColor ??
                        theme?.palette?.complementary?.c0 ??
                        styleVariables.gdColorBackground,
                },
                lineWidth: LINE_WIDTH,
                fillOpacity: 0.6,
                stickyTracking: false,
                states: {
                    hover: {
                        lineWidth: LINE_WIDTH + 1,
                    },
                },
            },
            ...series,
        },
    };
}
