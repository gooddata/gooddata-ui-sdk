// (C) 2022-2024 GoodData Corporation
import { VisType } from "@gooddata/sdk-ui";
import { getLighterColor } from "@gooddata/sdk-ui-vis-commons";

import { ISeriesItem, IForecastData, ISeriesDataItem } from "../../typings/unsafe.js";

export function assignForecastAxes(
    type: VisType,
    categories: any[],
    series: ISeriesItem[],
    forecastData: IForecastData,
): { series: ISeriesItem[]; categories: any[] } {
    //in case of line chart, we need to add forecast axis
    if (type !== "line") {
        return { series, categories };
    }

    //if there is only one series, we need to add forecast axis
    if (series.length !== 1) {
        return { series, categories };
    }

    const [firstSeries] = series;
    const { data } = firstSeries;

    //if there is no data, we don't need to add forecast axis
    if (data.length === 0) {
        return { series, categories };
    }

    const last = data[data.length - 1];
    const seriesData = [...data, ...forecastData.forecast.data.map(() => null)];

    const rangeData = [
        ...data.slice(0, -1).map(() => null),
        {
            low: last.low,
            high: last.high,
            format: last.format,
        },
        ...forecastData.dispersion.data.map((item) => {
            return {
                name: forecastData.dispersion.name,
                format: last.format,
                low: item[0],
                high: item[1],
            } as ISeriesDataItem;
        }),
    ];
    const predictedData = [
        ...data.slice(0, -1).map(() => null),
        last,
        ...forecastData.forecast.data.map((item) => {
            return {
                name: last.name,
                format: last.format,
                y: item,
            } as ISeriesDataItem;
        }),
    ];

    return {
        series: [
            { ...firstSeries, data: seriesData },
            {
                ...firstSeries,
                data: rangeData,
                name: forecastData.dispersion.name,
                type: "areasplinerange",
                marker: {
                    enabled: false,
                },
                color: getLighterColor(firstSeries.color, 0.8),
                lineWidth: 2,
                lineColor: getLighterColor(firstSeries.color, 0.5),
                showInLegend: false,
            },
            {
                ...firstSeries,
                data: predictedData,
                dashStyle: "dash",
                showInLegend: false,
            },
        ],
        categories: [...categories, ...forecastData.categories],
    };
}
