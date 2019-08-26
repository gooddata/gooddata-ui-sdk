// (C) 2007-2019 GoodData Corporation
import { VisualizationObject } from "@gooddata/typings";

import get = require("lodash/get");
import { MAX_POINT_WIDTH } from "./commonConfiguration";
import { LINE_WIDTH } from "./lineConfiguration";
import { IChartConfig } from "../../../../interfaces/Config";
import { VisualizationTypes } from "../../../../constants/visualizationTypes";
import { isLineChart } from "../../utils/common";
import { isBucketEmpty } from "../../../../helpers/mdObjBucketHelper";
import { MEASURES, SECONDARY_MEASURES } from "../../../../constants/bucketNames";

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

function isOnlyLineSeries(config: IChartConfig): boolean {
    const { primaryChartType, secondaryChartType } = getDefaultComboTypes(config);
    const buckets: VisualizationObject.IBucket[] = get(config, "mdObject.buckets", []);
    const isEmptyPrimaryMeasure = isBucketEmpty(buckets, MEASURES);
    const isEmptySecondaryMeasure = isBucketEmpty(buckets, SECONDARY_MEASURES);
    const isLineChartOnLeftAxis = isLineChart(primaryChartType);
    const isLineChartOnRightAxis = isLineChart(secondaryChartType);
    return (
        (isLineChartOnLeftAxis && isLineChartOnRightAxis) ||
        (isLineChartOnLeftAxis && isEmptySecondaryMeasure) ||
        (isEmptyPrimaryMeasure && isLineChartOnRightAxis)
    );
}

export function getComboConfiguration(config?: IChartConfig) {
    const series = isOnlyLineSeries(config)
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
