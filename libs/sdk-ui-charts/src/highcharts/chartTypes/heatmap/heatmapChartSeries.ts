// (C) 2020-2022 GoodData Corporation
import { IPatternObject, IPointData } from "../../typings/unsafe.js";
import { GRAY, TRANSPARENT, WHITE } from "../_util/color.js";
import { DataViewFacade } from "@gooddata/sdk-ui";
import { ITheme, DataValue, IMeasureGroupDescriptor } from "@gooddata/sdk-model";
import { parseValue, unwrap } from "../_util/common.js";
import isNil from "lodash/isNil.js";

const getNullColor = (theme?: ITheme): IPatternObject => ({
    pattern: {
        path: {
            d: "M 10 0 L 0 10 M 9 11 L 11 9 M 4 11 L 11 4 M -1 1 L 1 -1 M -1 6 L 6 -1",
            stroke: theme?.palette?.complementary?.c4 ?? GRAY,
            strokeWidth: 1,
            fill: theme?.palette?.complementary?.c0 ?? WHITE,
        },
        width: 10,
        height: 10,
    },
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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
                if (isNil(value)) {
                    data.push({
                        ...pointData,
                        // with latest highcharts version 9.3.0 it was adding border on null values
                        // set border width as 0 to have it as it was on previous versions
                        borderWidth: 0,
                        borderColor: theme?.palette?.complementary?.c4 ?? GRAY,
                        color: TRANSPARENT,
                    });
                    data.push({
                        ...pointData,
                        borderWidth: 0,
                        pointPadding: 2,
                        color: nullColor,
                        // ignoredInDrillEventContext flag is used internally, not related to Highchart
                        // to check and remove this null-value point in drill message
                        ignoredInDrillEventContext: true,
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
