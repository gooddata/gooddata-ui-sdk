// (C) 2020-2022 GoodData Corporation
import { BucketNames, DataViewFacade } from "@gooddata/sdk-ui";
import { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";
import { IPointData, ISeriesItemConfig } from "../../typings/unsafe";
import { parseValue } from "../_util/common";

export function getScatterPlotSeries(
    dv: DataViewFacade,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    stackByAttribute: any,
    colorStrategy: IColorStrategy,
    emptyHeaderName: string,
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
                    ? stackByAttribute.items[seriesIndex].attributeHeaderItem.name || emptyHeaderName // TODO RAIL-4360 distinguish between empty and null
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
