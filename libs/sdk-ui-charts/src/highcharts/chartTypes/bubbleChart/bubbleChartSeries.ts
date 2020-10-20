// (C) 2020 GoodData Corporation
import { BucketNames, DataViewFacade } from "@gooddata/sdk-ui";
import { IMeasureGroupDescriptor } from "@gooddata/sdk-backend-spi";
import { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";
import { parseValue, unwrap } from "../_util/common";
import last from "lodash/last";

function getCountOfEmptyBuckets(bucketEmptyFlags: boolean[] = []) {
    return bucketEmptyFlags.filter((bucketEmpyFlag) => bucketEmpyFlag).length;
}

export function getBubbleChartSeries(
    dv: DataViewFacade,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    stackByAttribute: any,
    colorStrategy: IColorStrategy,
): any[] {
    const primaryMeasuresBucketEmpty = dv.def().isBucketEmpty(BucketNames.MEASURES);
    const secondaryMeasuresBucketEmpty = dv.def().isBucketEmpty(BucketNames.SECONDARY_MEASURES);

    return dv
        .rawData()
        .twoDimData()
        .map((resData: any, index: number) => {
            let data: any = [];
            if (resData[0] !== null && resData[1] !== null && resData[2] !== null) {
                const emptyBucketsCount = getCountOfEmptyBuckets([
                    primaryMeasuresBucketEmpty,
                    secondaryMeasuresBucketEmpty,
                ]);
                data = [
                    {
                        x: !primaryMeasuresBucketEmpty ? parseValue(resData[0]) : 0,
                        y: !secondaryMeasuresBucketEmpty ? parseValue(resData[1 - emptyBucketsCount]) : 0,
                        // we want to allow NaN on z to be able show bubble of default size when Size bucket is empty
                        z: parseFloat(resData[2 - emptyBucketsCount]),
                        format: unwrap(last(measureGroup.items)).format, // only for dataLabel format
                    },
                ];
            }
            return {
                name: stackByAttribute ? stackByAttribute.items[index].attributeHeaderItem.name : "",
                color: colorStrategy.getColorByIndex(index),
                legendIndex: index,
                data,
            };
        });
}
