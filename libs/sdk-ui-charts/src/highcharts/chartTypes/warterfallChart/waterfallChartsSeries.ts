// (C) 2023 GoodData Corporation
import { IMeasure, IMeasureGroupDescriptor } from "@gooddata/sdk-model";
import { DataViewFacade } from "@gooddata/sdk-ui";
import { IColorStrategy, valueWithEmptyHandling } from "@gooddata/sdk-ui-vis-commons";
import findLastIndex from "lodash/findLastIndex";

import { parseValue, unwrap } from "../_util/common";
import { IUnwrappedAttributeHeadersWithItems } from "../../typings/mess";
import { IPointData } from "../../typings/unsafe";
import { ITotalConfig } from "../../../interfaces";

function getTotalValue(pointDatas: IPointData[]) {
    const lastTotalIndex = findLastIndex(pointDatas, (item: IPointData) => item.visible === false);
    let total = 0;

    if (lastTotalIndex + 1 === pointDatas.length) {
        total = pointDatas[lastTotalIndex].y;
    } else {
        const startFromIndex = lastTotalIndex + 1;
        for (let i = startFromIndex; i < pointDatas.length; i += 1) {
            total += pointDatas[i]?.y || 0;
        }
    }

    return total * -1;
}

function getColorOrLegendIndex(isTotal: boolean, yValue: number) {
    return isTotal ? 0 : yValue > 0 ? 1 : 2; //0: Total, 1: Positive, 2: Negative
}

function isMeasureIdATotal(totalConfig: ITotalConfig, measure: IMeasure) {
    const totalMeasures = totalConfig?.measures || [];
    if (totalMeasures.length === 0 || !measure) {
        return false;
    }
    return totalMeasures.includes(unwrap(measure)?.localIdentifier);
}

function getSeriesItemData(
    seriesItem: string[],
    seriesIndex: number,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    viewByAttribute: IUnwrappedAttributeHeadersWithItems,
    colorStrategy: IColorStrategy,
    emptyHeaderTitle: string,
    measures: IMeasure[],
    totalConfig: ITotalConfig,
): IPointData[] {
    return seriesItem.reduce((series, pointValue: string, pointIndex: number) => {
        const isTotalMeasure = isMeasureIdATotal(totalConfig, measures[pointIndex]);
        const yValue = parseValue(pointValue);
        const valueIndex = getColorOrLegendIndex(isTotalMeasure, yValue);
        const color = colorStrategy.getColorByIndex(valueIndex);
        const name = valueWithEmptyHandling(
            unwrap(viewByAttribute ? viewByAttribute.items[pointIndex] : measureGroup.items[pointIndex]).name,
            emptyHeaderTitle,
        );
        const seriesItemData = {
            y: yValue,
            format: unwrap(measureGroup.items[seriesIndex]).format,
            name,
            legendIndex: valueIndex,
            color,
            borderColor: color,
        };

        if (isTotalMeasure && pointIndex > 0) {
            //Adding a shadow column if the series item is a total measure.
            //This shadow column always hidden on the chart
            const shadowSeriesItem = {
                ...seriesItemData,
                y: getTotalValue(series),
                visible: false,
            };
            series.push(shadowSeriesItem);
        }

        series.push(seriesItemData);

        return series;
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
    totalConfig: ITotalConfig,
) {
    const { measures } = dv?.definition || {};
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
                measures,
                totalConfig,
            );

            return {
                upColor: colorStrategy.getColorByIndex(1), //Positive color,
                color: colorStrategy.getColorByIndex(2), //Negative color,
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
