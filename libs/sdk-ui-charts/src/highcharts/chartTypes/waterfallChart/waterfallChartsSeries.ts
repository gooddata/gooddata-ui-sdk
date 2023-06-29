// (C) 2023 GoodData Corporation
import { IMeasureGroupDescriptor } from "@gooddata/sdk-model";
import { DataViewFacade } from "@gooddata/sdk-ui";
import { IColorStrategy, valueWithEmptyHandling } from "@gooddata/sdk-ui-vis-commons";

import { parseValue, unwrap } from "../_util/common.js";
import { IUnwrappedAttributeHeadersWithItems } from "../../typings/mess.js";
import { IPointData } from "../../typings/unsafe.js";

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
): IPointData[] {
    return seriesItem.map((pointValue: string, pointIndex: number) => {
        const yValue = parseValue(pointValue);
        const valueIndex = getColorOrLegendIndex(yValue);
        const color = colorStrategy.getColorByIndex(valueIndex);
        const name = valueWithEmptyHandling(
            unwrap(viewByAttribute ? viewByAttribute.items[pointIndex] : measureGroup.items[pointIndex]).name,
            emptyHeaderTitle,
        );

        return {
            y: yValue,
            format: unwrap(measureGroup.items[viewByAttribute ? seriesIndex : pointIndex]).format,
            name,
            legendIndex: valueIndex,
            color,
            borderColor: color,
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
