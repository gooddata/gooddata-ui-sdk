// (C) 2020-2025 GoodData Corporation

import { type DataValue, type IMeasureGroupDescriptor, type ITheme } from "@gooddata/sdk-model";
import { type DataViewFacade } from "@gooddata/sdk-ui";

import { type IPatternObject, type IPointData } from "../../typings/unsafe.js";
import { GRAY, WHITE } from "../_util/color.js";
import { parseValue, unwrap } from "../_util/common.js";

const getNullColor = (theme?: ITheme): IPatternObject | string =>
    theme?.chart?.backgroundColor ?? theme?.palette?.complementary?.c0 ?? WHITE;

export function getHeatmapSeries(
    dv: DataViewFacade,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    theme?: ITheme,
) {
    const nullColor = getNullColor(theme);
    const data: IPointData[] = [];
    dv.rawData()
        .twoDimData()
        .forEach((rowItem: DataValue[], rowItemIndex: number) => {
            rowItem.forEach((columnItem: DataValue, columnItemIndex: number) => {
                const value: number = parseValue(String(columnItem));
                const pointData: IPointData = { x: columnItemIndex, y: rowItemIndex, value };
                if (value === null || value === undefined) {
                    data.push({
                        ...pointData,
                        // with latest highcharts version 9.3.0 it was adding border on null values
                        // set border width as 0 to have it as it was on previous versions
                        borderWidth: 0,
                        borderColor: theme?.palette?.complementary?.c4 ?? GRAY,
                        color: nullColor,
                    });
                } else {
                    data.push(pointData);
                }
            });
        });

    return [
        {
            name: measureGroup.items[0].measureHeaderItem.name,
            data,
            turboThreshold: 0,
            yAxis: 0,
            dataLabels: {
                formatGD: unwrap(measureGroup.items[0]).format,
            },
            legendIndex: 0,
            seriesIndex: 0,
        },
    ];
}
