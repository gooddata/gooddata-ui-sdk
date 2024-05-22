// (C) 2020-2024 GoodData Corporation
import { BucketNames, DataViewFacade, getMappingHeaderFormattedName } from "@gooddata/sdk-ui";
import { IColorStrategy, valueWithEmptyHandling } from "@gooddata/sdk-ui-vis-commons";
import { IPointData, ISeriesItemConfig } from "../../typings/unsafe.js";
import { parseValue } from "../_util/common.js";
import { IResultAttributeHeader } from "@gooddata/sdk-model";
import debounce from "lodash/debounce.js";

function _decreaseOpacityOfOtherSegmentsOnMouseOver() {
    const segmentName = this?.segmentName;
    const allDataPoints = this?.series?.data;
    const otherSegmentsDataPoints = allDataPoints?.filter((dp) => dp.segmentName !== segmentName);
    otherSegmentsDataPoints?.forEach((dp) => {
        dp.graphic?.attr({ opacity: 0.3 });
    });
}

const decreaseOpacityOfOtherSegmentsOnMouseOver = debounce(_decreaseOpacityOfOtherSegmentsOnMouseOver, 50);

function _resetOpacityOfOtherSegmentsOnMouseOut() {
    const segmentName = this?.segmentName;
    const allDataPoints = this?.series?.data;
    const otherSegmentsDataPoints = allDataPoints?.filter((dp) => dp.segmentName !== segmentName);
    otherSegmentsDataPoints?.forEach((dp) => {
        dp.graphic?.attr({ opacity: 1 });
    });
}

const resetOpacityOfOtherSegmentsOnMouseOut = debounce(_resetOpacityOfOtherSegmentsOnMouseOut, 50);

export function getScatterPlotSeries(
    dv: DataViewFacade,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    viewByAttribute: any,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    stackByAttribute: any,
    colorStrategy: IColorStrategy,
    emptyHeaderTitle: string,
): ISeriesItemConfig[] {
    const primaryMeasuresBucketEmpty = dv.def().isBucketEmpty(BucketNames.MEASURES);
    const secondaryMeasuresBucketEmpty = dv.def().isBucketEmpty(BucketNames.SECONDARY_MEASURES);
    const colorAssignments = colorStrategy.getColorAssignment();

    const data = dv
        .rawData()
        .twoDimData()
        .map((seriesItem: string[], seriesIndex: number): IPointData => {
            const values = seriesItem.map((value: string) => {
                return parseValue(value);
            });

            const colorAssignment = stackByAttribute
                ? colorAssignments.find(
                      (a) =>
                          (stackByAttribute.items as IResultAttributeHeader[])[seriesIndex]
                              .attributeHeaderItem.uri ===
                          (a.headerItem as IResultAttributeHeader).attributeHeaderItem.uri,
                  )
                : colorAssignments[0];

            const colorAssignmentIndex = colorAssignments.indexOf(colorAssignment);
            const assignedColor = colorStrategy.getColorByIndex(colorAssignmentIndex);

            return {
                x: !primaryMeasuresBucketEmpty ? values[0] : 0,
                y: !secondaryMeasuresBucketEmpty ? (primaryMeasuresBucketEmpty ? values[0] : values[1]) : 0,
                name: viewByAttribute
                    ? valueWithEmptyHandling(
                          getMappingHeaderFormattedName(viewByAttribute.items[seriesIndex]),
                          emptyHeaderTitle,
                      )
                    : "",
                segmentName: stackByAttribute
                    ? valueWithEmptyHandling(
                          getMappingHeaderFormattedName(stackByAttribute.items[seriesIndex]),
                          emptyHeaderTitle,
                      )
                    : "",
                color: assignedColor,
                ...(stackByAttribute
                    ? {
                          events: {
                              mouseOver: decreaseOpacityOfOtherSegmentsOnMouseOver,
                              mouseOut: resetOpacityOfOtherSegmentsOnMouseOut,
                          },
                      }
                    : {}),
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
