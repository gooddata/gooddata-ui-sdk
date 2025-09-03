// (C) 2023-2025 GoodData Corporation
import { IMeasureGroupDescriptor } from "@gooddata/sdk-model";
import { DataViewFacade } from "@gooddata/sdk-ui";
import { ChartFillConfig, IColorStrategy, valueWithEmptyHandling } from "@gooddata/sdk-ui-vis-commons";

import { IUnwrappedAttributeHeadersWithItems } from "../../typings/mess.js";
import { IPointData } from "../../typings/unsafe.js";
import { getChartFillProperties } from "../_chartOptions/patternFillOptions.js";
import { parseValue, unwrap } from "../_util/common.js";

export function getColorOrLegendIndex(yValue: number, isTotal = false) {
    return isTotal ? 0 : yValue > 0 ? 1 : 2; //0: Total, 1: Positive, 2: Negative
}

function getSeriesItemData(
    seriesItem: string[],
    seriesIndex: number,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    viewByAttribute: IUnwrappedAttributeHeadersWithItems,
    colorStrategy: IColorStrategy,
    emptyHeaderTitle: string,
    chartFill: ChartFillConfig | undefined,
): IPointData[] {
    return seriesItem.map((pointValue: string, pointIndex: number) => {
        const yValue = parseValue(pointValue);
        const valueIndex = getColorOrLegendIndex(yValue);
        const color = colorStrategy.getColorByIndex(valueIndex);
        const colorProperties = getChartFillProperties(chartFill, color, valueIndex);

        const name = valueWithEmptyHandling(
            unwrap(viewByAttribute ? viewByAttribute.items[pointIndex] : measureGroup.items[pointIndex]).name,
            emptyHeaderTitle,
        );

        return {
            y: yValue,
            format: unwrap(measureGroup.items[viewByAttribute ? seriesIndex : pointIndex]).format,
            name,
            legendIndex: valueIndex,
            // "solid" does not have borderColor set in colorProperties, only this chart needs it
            borderColor: color,
            ...colorProperties,
        };
    }, []);
}

function getSeriesItemName(
    viewByAttribute: IUnwrappedAttributeHeadersWithItems,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    emptyHeaderTitle: string,
    seriesIndex: number,
) {
    if (!viewByAttribute) {
        return measureGroup.items
            .map((wrappedMeasure) => valueWithEmptyHandling(unwrap(wrappedMeasure).name, emptyHeaderTitle))
            .join(", ");
    }

    return valueWithEmptyHandling(measureGroup.items[seriesIndex].measureHeaderItem.name, emptyHeaderTitle);
}

export function getWaterfallChartSeries(
    dv: DataViewFacade,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    viewByAttribute: IUnwrappedAttributeHeadersWithItems,
    colorStrategy: IColorStrategy,
    emptyHeaderTitle: string,
    chartFill: ChartFillConfig | undefined,
) {
    return dv
        .rawData()
        .twoDimData()
        .map((seriesItem: string[], seriesIndex: number) => {
            const seriesItemData = getSeriesItemData(
                seriesItem,
                seriesIndex,
                measureGroup,
                viewByAttribute,
                colorStrategy,
                emptyHeaderTitle,
                chartFill,
            );

            const positiveColorIndex = 1;
            const positiveColor = colorStrategy.getColorByIndex(positiveColorIndex);
            const { color: upColor, borderColor: upBorderColor } = getChartFillProperties(
                chartFill,
                positiveColor,
                positiveColorIndex,
            );

            const negativeColorIndex = 2;
            const negativeColor = colorStrategy.getColorByIndex(negativeColorIndex);
            const negativeColorProperties = getChartFillProperties(
                chartFill,
                negativeColor,
                negativeColorIndex,
            );

            return {
                upColor,
                upBorderColor,
                // "solid" does not have borderColor set in colorProperties, only this chart needs it
                borderColor: negativeColor,
                ...negativeColorProperties,
                legendIndex: seriesIndex,
                data: seriesItemData,
                seriesIndex,
                name: getSeriesItemName(viewByAttribute, measureGroup, emptyHeaderTitle, seriesIndex),
                //The waterfall chart should have continuous line, but the current Highcharts version (9.3.0) doesn't support this.
                //But it has already supported in the latest version of Highcharts (v11.0.1)
                connectNulls: true,
            };
        });
}
