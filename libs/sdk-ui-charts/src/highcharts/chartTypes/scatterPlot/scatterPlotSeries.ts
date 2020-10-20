// (C) 2020 GoodData Corporation
import { BucketNames, DataViewFacade } from "@gooddata/sdk-ui";
import { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";
import { ISeriesDataItem } from "../../typings/unsafe";
import { parseValue } from "../_util/common";

export function getScatterPlotSeries(
    dv: DataViewFacade,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    stackByAttribute: any,
    colorStrategy: IColorStrategy,
): any[] {
    const primaryMeasuresBucketEmpty = dv.def().isBucketEmpty(BucketNames.MEASURES);
    const secondaryMeasuresBucketEmpty = dv.def().isBucketEmpty(BucketNames.SECONDARY_MEASURES);

    const data: ISeriesDataItem[] = dv
        .rawData()
        .twoDimData()
        .map((seriesItem: string[], seriesIndex: number) => {
            const values = seriesItem.map((value: string) => {
                return parseValue(value);
            });

            return {
                x: !primaryMeasuresBucketEmpty ? values[0] : 0,
                y: !secondaryMeasuresBucketEmpty ? (primaryMeasuresBucketEmpty ? values[0] : values[1]) : 0,
                name: stackByAttribute ? stackByAttribute.items[seriesIndex].attributeHeaderItem.name : "",
            };
        });

    return [
        {
            turboThreshold: 0,
            color: colorStrategy.getColorByIndex(0),
            legendIndex: 0,
            data,
        },
    ];
}
