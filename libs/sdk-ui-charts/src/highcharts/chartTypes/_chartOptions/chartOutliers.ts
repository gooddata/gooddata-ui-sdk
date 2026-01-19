// (C) 2022-2026 GoodData Corporation

import { type IOutliersConfig } from "@gooddata/sdk-backend-spi";
import {
    type DataValue,
    type IColorPalette,
    type ISettings,
    colorPaletteItemToRgb,
} from "@gooddata/sdk-model";
import { DefaultColorPalette, type VisType } from "@gooddata/sdk-ui";

import { type IAnomalies, type IChartConfig } from "../../../interfaces/index.js";
import { type ISeriesItem } from "../../typings/unsafe.js";

export function assignOutliersAxes(
    colorPalette: IColorPalette = DefaultColorPalette,
    config: IAnomalies | undefined,
    type: VisType | undefined,
    series: ISeriesItem[],
    outliersValues: DataValue[][],
    anomaliesTitle?: string,
): ISeriesItem[] {
    //in case of line chart, we need to add forecast axis
    if (type !== "line") {
        return series;
    }

    //if there is no data, we don't need to add outlies axis
    //if there is no outliers data, we don't need to add to axis
    if (outliersValues.length === 0 || series.length === 0) {
        return series;
    }

    const color = getColor(colorPalette, config);
    const outliersSeries: ISeriesItem[] = series.map((ser, i) => {
        const outlier = outliersValues[i];
        if (!outlier) {
            return ser;
        }
        return {
            ...ser,
            data: ser.data?.map((d, ii) => {
                return {
                    ...d,
                    ...(outlier[ii] !== null && outlier[ii] !== undefined
                        ? createAnomalyPointHighlight(config, color, outlier[ii])
                        : {}),
                };
            }),
        };
    });

    return [
        ...outliersSeries,
        {
            name: anomaliesTitle ?? "Anomalies",
            type: "line",
            color: color,
            data: [],
            showInLegend: true,
            legendIndex: outliersValues.length,
            anomaly: true,
        },
    ];
}

const sizeMap: Record<IAnomalies["size"], number> = {
    small: 6,
    medium: 8,
    big: 12,
};

function createAnomalyPointHighlight(config: IAnomalies | undefined, color: string, value: DataValue) {
    return {
        high: value as number,
        marker: {
            enabled: true,
            radius: sizeMap[config?.size ?? "small"],
            fillColor: color,
            lineColor: color,
            lineWidth: 1,
            states: {
                hover: {
                    enabled: true,
                    fillColor: color,
                },
                select: {
                    fillColor: color,
                },
            },
        },
        dataLabels: {
            x: 0,
            y: -8,
        },
        color,
        anomaly: true,
    };
}

function getColor(colorPalette: IColorPalette, config: IAnomalies | undefined) {
    const defaultColor = "#FF0000";

    if (config?.color?.type === "guid") {
        const guid = config.color.value;
        const col = colorPalette.find((c) => c.guid === guid);
        if (col) {
            return colorPaletteItemToRgb(col);
        }
        return defaultColor;
    }
    if (config?.color?.value) {
        return colorPaletteItemToRgb({
            guid: "",
            fill: config.color.value,
        });
    }
    return defaultColor;
}

/**
 * @internal
 */
export function updateOutliersWithSettings(
    config: IChartConfig,
    settings: ISettings,
    { enabled }: { enabled: boolean },
): IOutliersConfig | undefined {
    //no outliers setting
    if (!config.anomalies?.enabled || !enabled || !settings["enableAnomalyDetectionVisualization"]) {
        return undefined;
    }

    //check if sensitivity is set and is valid
    const sensitivity = normalizeSensitivity(config.anomalies.sensitivity, "medium");

    return {
        sensitivity,
    };
}

function normalizeSensitivity(
    confidence: string,
    defaultValue: IOutliersConfig["sensitivity"],
): IOutliersConfig["sensitivity"] {
    switch (confidence) {
        case "low":
            return "low";
        case "medium":
            return "medium";
        case "high":
            return "high";
        default:
            return defaultValue;
    }
}
