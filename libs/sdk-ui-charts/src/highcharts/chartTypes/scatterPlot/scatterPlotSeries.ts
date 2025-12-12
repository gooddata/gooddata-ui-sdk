// (C) 2020-2025 GoodData Corporation

import { debounce } from "lodash-es";

import { type IColorDescriptor, type IResultAttributeHeader } from "@gooddata/sdk-model";
import { BucketNames, type DataViewFacade, getMappingHeaderFormattedName } from "@gooddata/sdk-ui";
import { type IColorStrategy, valueWithEmptyHandling } from "@gooddata/sdk-ui-vis-commons";

import { type IPointData, type ISeriesItemConfig } from "../../typings/unsafe.js";
import { parseValue } from "../_util/common.js";

// Type for the actual data points in the series at runtime
interface IScatterDataPoint extends IPointData {
    graphic?: {
        attr: (attrs: { opacity: number }) => void;
    };
}

function _decreaseOpacityOfOtherSegmentsOnMouseOver(this: IPointData) {
    const segmentName = this?.["segmentName"];
    const allDataPoints = this?.series?.data as IScatterDataPoint[] | undefined;
    const otherSegmentsDataPoints = allDataPoints?.filter((dp) => dp["segmentName"] !== segmentName);
    otherSegmentsDataPoints?.forEach((dp) => {
        dp.graphic?.attr({ opacity: 0.3 });
    });
}

const decreaseOpacityOfOtherSegmentsOnMouseOver = debounce(_decreaseOpacityOfOtherSegmentsOnMouseOver, 50);

function _resetOpacityOfOtherSegmentsOnMouseOut(this: IPointData) {
    const segmentName = this?.["segmentName"];
    const allDataPoints = this?.series?.data as IScatterDataPoint[] | undefined;
    const otherSegmentsDataPoints = allDataPoints?.filter((dp) => dp["segmentName"] !== segmentName);
    otherSegmentsDataPoints?.forEach((dp) => {
        dp.graphic?.attr({ opacity: 1 });
    });
}

const resetOpacityOfOtherSegmentsOnMouseOut = debounce(_resetOpacityOfOtherSegmentsOnMouseOut, 50);

function _decreaseOpacityOfOtherClustersOnMouseOver(this: IPointData) {
    const clusterName = this?.["clusterName"];
    const allDataPoints = this?.series?.data as IScatterDataPoint[] | undefined;
    const otherClustersDataPoints = allDataPoints?.filter((dp) => dp["clusterName"] !== clusterName);
    otherClustersDataPoints?.forEach((dp) => {
        dp.graphic?.attr({ opacity: 0.3 });
    });
}

const decreaseOpacityOfOtherClustersOnMouseOver = debounce(_decreaseOpacityOfOtherClustersOnMouseOver, 50);

function _resetOpacityOfOtherClustersOnMouseOut(this: IPointData) {
    const clusterName = this?.["clusterName"];
    const allDataPoints = this?.series?.data as IScatterDataPoint[] | undefined;
    const otherClustersDataPoints = allDataPoints?.filter((dp) => dp["clusterName"] !== clusterName);
    otherClustersDataPoints?.forEach((dp) => {
        dp.graphic?.attr({ opacity: 1 });
    });
}

const resetOpacityOfOtherClustersOnMouseOut = debounce(_resetOpacityOfOtherClustersOnMouseOut, 50);

export function getScatterPlotSeries(
    dv: DataViewFacade,
    viewByAttribute: { items: IResultAttributeHeader[] } | undefined,
    stackByAttribute: { items: IResultAttributeHeader[] } | undefined,
    colorStrategy: IColorStrategy,
    emptyHeaderTitle: string,
): ISeriesItemConfig[] {
    const primaryMeasuresBucketEmpty = dv.def().isBucketEmpty(BucketNames.MEASURES);
    const secondaryMeasuresBucketEmpty = dv.def().isBucketEmpty(BucketNames.SECONDARY_MEASURES);
    const colorAssignments = colorStrategy.getColorAssignment();

    const isClustering = dv?.dataView?.clusteringConfig?.numberOfClusters > 0;
    const isClusteringLoading = isClustering && !dv?.dataView?.clusteringResult;
    const isClusteringError = isClustering && dv?.dataView?.clusteringResult?.clusters?.length === 0;
    const isClusteringLoaded = isClustering && !!dv?.dataView?.clusteringResult && !isClusteringError;

    const data = dv
        .rawData()
        .twoDimData()
        .map((seriesItem, seriesIndex): IPointData => {
            const values = seriesItem.map((value) => {
                return parseValue(value);
            });

            let colorAssignment = colorAssignments[0];
            if (stackByAttribute) {
                colorAssignment = colorAssignments.find(
                    (a) =>
                        (stackByAttribute.items as IResultAttributeHeader[])[seriesIndex].attributeHeaderItem
                            .uri === (a.headerItem as IResultAttributeHeader).attributeHeaderItem.uri,
                );
            } else if (isClusteringLoaded) {
                const clusterIndex = dv?.dataView?.clusteringResult?.clusters?.[seriesIndex];
                colorAssignment = colorAssignments.find(
                    (a) => (a.headerItem as IColorDescriptor).colorHeaderItem.id === `${clusterIndex}`,
                );
            }

            const colorAssignmentIndex = colorAssignments.indexOf(colorAssignment);
            const assignedColor = colorStrategy.getColorByIndex(colorAssignmentIndex);

            return {
                legendIndex: colorAssignmentIndex,
                loading: isClustering ? isClusteringLoading : false,
                x: primaryMeasuresBucketEmpty ? 0 : values[0],
                y: secondaryMeasuresBucketEmpty ? 0 : primaryMeasuresBucketEmpty ? values[0] : values[1],
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
                clusterName:
                    isClusteringLoaded && colorAssignment
                        ? valueWithEmptyHandling(
                              getMappingHeaderFormattedName(colorAssignment.headerItem),
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
                ...(isClusteringLoaded
                    ? {
                          events: {
                              mouseOver: decreaseOpacityOfOtherClustersOnMouseOver,
                              mouseOut: resetOpacityOfOtherClustersOnMouseOut,
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
