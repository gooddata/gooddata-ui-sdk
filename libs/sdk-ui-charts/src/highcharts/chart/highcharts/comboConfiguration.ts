// (C) 2007-2020 GoodData Corporation
import { MAX_POINT_WIDTH } from "./commonConfiguration";
import { LINE_WIDTH } from "./lineConfiguration";
import { IChartConfig } from "../../../interfaces";
import { isLineChart } from "../../utils/common";
import { BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";
import { bucketIsEmpty, bucketsFind, IExecutionDefinition } from "@gooddata/sdk-model";
import get from "lodash/get";

const { COLUMN, LINE } = VisualizationTypes;

function getDefaultComboTypes(config?: IChartConfig): IChartConfig {
    return {
        primaryChartType: get(config, "primaryChartType", COLUMN),
        secondaryChartType: get(config, "secondaryChartType", LINE),
    };
}
export function getDefaultChartType(config?: IChartConfig) {
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

export function getComboConfiguration(config?: IChartConfig, definition?: IExecutionDefinition) {
    const series = isOnlyLineSeries(config, definition)
        ? {
              series: {
                  states: {
                      inactive: {
                          opacity: 1,
                      },
                  },
              },
          }
        : {};
    const COMBO_TEMPLATE = {
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
    return COMBO_TEMPLATE;
}
