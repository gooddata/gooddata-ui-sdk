// (C) 2020-2022 GoodData Corporation
import { BucketNames, DataViewFacade, getMappingHeaderFormattedName } from "@gooddata/sdk-ui";
import { IColorStrategy, valueWithEmptyHandling } from "@gooddata/sdk-ui-vis-commons";
import { IPointData, ISeriesItemConfig } from "../../typings/unsafe.js";
import { parseValue } from "../_util/common.js";

export function getScatterPlotSeries(
    dv: DataViewFacade,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    stackByAttribute: any,
    colorStrategy: IColorStrategy,
    emptyHeaderTitle: string,
): ISeriesItemConfig[] {
    const primaryMeasuresBucketEmpty = dv.def().isBucketEmpty(BucketNames.MEASURES);
    const secondaryMeasuresBucketEmpty = dv.def().isBucketEmpty(BucketNames.SECONDARY_MEASURES);

    const data: IPointData[] = dv
        .rawData()
        .twoDimData()
        .map((seriesItem: string[], seriesIndex: number) => {
            const values = seriesItem.map((value: string) => {
                return parseValue(value);
            });

            return {
                x: !primaryMeasuresBucketEmpty ? values[0] : 0,
                y: !secondaryMeasuresBucketEmpty ? (primaryMeasuresBucketEmpty ? values[0] : values[1]) : 0,
                name: stackByAttribute
                    ? valueWithEmptyHandling(
                          getMappingHeaderFormattedName(stackByAttribute.items[seriesIndex]),
                          emptyHeaderTitle,
                      )
                    : "",
            };
        });

    return [
        {
            turboThreshold: 0,
            color: colorStrategy.getColorByIndex(0),
            legendIndex: 0,
            data,
            seriesIndex: 0,
        },
    ];
}
