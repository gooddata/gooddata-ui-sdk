// (C) 2007-2019 GoodData Corporation
import get = require("lodash/get");
import isEqual = require("lodash/isEqual");
import { MAX_POINT_WIDTH } from "./commonConfiguration";
import { LINE_WIDTH } from "./lineConfiguration";
import { IChartConfig } from "../../../../interfaces/Config";
import { VisualizationTypes } from "../../../../constants/visualizationTypes";

const { COLUMN, LINE } = VisualizationTypes;

export function getDefaultChartType(config?: IChartConfig) {
    const primaryType = get(config, "primaryChartType", COLUMN);
    const secondaryType = get(config, "secondaryChartType", LINE);

    if (isEqual(primaryType, secondaryType)) {
        return primaryType;
    }

    if (isEqual(primaryType, COLUMN) || isEqual(secondaryType, COLUMN)) {
        return COLUMN;
    }

    return LINE;
}

export function getComboConfiguration(config?: IChartConfig) {
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
                states: {
                    hover: {
                        lineWidth: LINE_WIDTH + 1,
                    },
                },
            },
        },
    };
    return COMBO_TEMPLATE;
}
