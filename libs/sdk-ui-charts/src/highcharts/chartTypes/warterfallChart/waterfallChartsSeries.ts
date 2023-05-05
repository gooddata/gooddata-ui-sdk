// (C) 2023 GoodData Corporation
import { IMeasureGroupDescriptor } from "@gooddata/sdk-model";
import { DataViewFacade } from "@gooddata/sdk-ui";
import { IColorStrategy, valueWithEmptyHandling } from "@gooddata/sdk-ui-vis-commons";

import { isOneOfTypes, parseValue, unwrap } from "../_util/common";
import { multiMeasuresAlternatingTypes } from "../_chartOptions/chartCapabilities";
import { IUnwrappedAttributeHeadersWithItems } from "../../typings/mess";
import { IPointData } from "../../typings/unsafe";

function getSeriesItemData(
    seriesItem: string[],
    seriesIndex: number,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    viewByAttribute: IUnwrappedAttributeHeadersWithItems,
    colorStrategy: IColorStrategy,
    type: string,
    emptyHeaderTitle: string,
): IPointData[] {
    return seriesItem.map((pointValue: string, pointIndex: number) => {
        // by default seriesIndex corresponds to measureGroup label index
        const measureIndex =
            isOneOfTypes(type, multiMeasuresAlternatingTypes) && !viewByAttribute ? pointIndex : seriesIndex;
        const yValue = parseValue(pointValue);
        const valueIndex = yValue > 0 ? 1 : 2; //0: Total, 1: Positive, 2: Negative
        const color = colorStrategy.getColorByIndex(valueIndex);
        return {
            y: yValue,
            format: unwrap(measureGroup.items[measureIndex]).format,
            name: valueWithEmptyHandling(unwrap(measureGroup.items[measureIndex]).name, emptyHeaderTitle),
            legendIndex: valueIndex,
            color,
            borderColor: color,
        };
    });
}

function getSeriesItemName(
    viewByAttribute: IUnwrappedAttributeHeadersWithItems,
    type: string,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    emptyHeaderTitle: string,
    seriesIndex: number,
) {
    if (isOneOfTypes(type, multiMeasuresAlternatingTypes) && !viewByAttribute) {
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
    type: string,
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
                type,
                emptyHeaderTitle,
            );

            return {
                upColor: colorStrategy.getColorByIndex(1), //Positive color,
                color: colorStrategy.getColorByIndex(2), //Negative color,
                legendIndex: seriesIndex,
                data: seriesItemData,
                seriesIndex,
                name: getSeriesItemName(viewByAttribute, type, measureGroup, emptyHeaderTitle, seriesIndex),
                //The waterfall chart should have continuous line, but the current Highcharts version (9.3.0) doesn't support this.
                //But it has already supported in the latest version of Highcharts (v11.0.1)
                connectNulls: true,
            };
        });
}
