// (C) 2007-2021 GoodData Corporation
import { BucketNames, DataViewFacade } from "@gooddata/sdk-ui";
import { IChartConfig } from "../../../interfaces";
import { IMeasureDescriptor, IMeasureGroupDescriptor } from "@gooddata/sdk-backend-spi";
import { IAxis, ISeriesItem } from "../../typings/unsafe";
import { isBarChart, isBubbleChart, isHeatmap, isOneOfTypes, isScatterPlot, unwrap } from "../_util/common";
import { supportedDualAxesChartTypes } from "./chartCapabilities";
import isEmpty from "lodash/isEmpty";
import compact from "lodash/compact";
import findIndex from "lodash/findIndex";
import range from "lodash/range";
import includes from "lodash/includes";
import { IUnwrappedAttributeHeadersWithItems } from "../../typings/mess";

function preprocessMeasureGroupItems(
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    defaultValues: any,
): any[] {
    return measureGroup.items.map((item: IMeasureDescriptor, index: number) => {
        const unwrapped = unwrap(item);
        return index
            ? {
                  label: unwrapped.name,
                  format: unwrapped.format,
              }
            : {
                  label: defaultValues.label || unwrapped.name,
                  format: defaultValues.format || unwrapped.format,
              };
    });
}

export function getXAxes(
    dv: DataViewFacade,
    config: IChartConfig,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    viewByAttribute: IUnwrappedAttributeHeadersWithItems,
): IAxis[] {
    const { type } = config;

    if (isScatterPlot(type) || isBubbleChart(type)) {
        const measureGroupItems = preprocessMeasureGroupItems(measureGroup, {
            label: config.xLabel,
            format: config.xFormat,
        });

        const firstMeasureGroupItem = measureGroupItems[0];

        const noPrimaryMeasures = dv.def().isBucketEmpty(BucketNames.MEASURES);
        if (noPrimaryMeasures) {
            return [
                {
                    label: "",
                },
            ];
        } else {
            return [
                {
                    label: firstMeasureGroupItem.label || "",
                    format: firstMeasureGroupItem.format || "",
                },
            ];
        }
    }

    const xLabel = config.xLabel || (viewByAttribute ? viewByAttribute.formOf.name : "");
    return [
        {
            label: xLabel,
        },
    ];
}

export function getYAxes(
    dv: DataViewFacade,
    config: IChartConfig,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    stackByAttribute: IUnwrappedAttributeHeadersWithItems,
): IAxis[] {
    const { type } = config;

    const measureGroupItems = preprocessMeasureGroupItems(measureGroup, {
        label: config.yLabel,
        format: config.yFormat,
    });

    const firstMeasureGroupItem = measureGroupItems[0];
    const secondMeasureGroupItem = measureGroupItems[1];
    const hasMoreThanOneMeasure = measureGroupItems.length > 1;
    const noPrimaryMeasures = dv.def().isBucketEmpty(BucketNames.MEASURES);

    const { measures: secondaryAxisMeasures = [] as string[] } =
        (isBarChart(type) ? config.secondary_xaxis : config.secondary_yaxis) || {};

    let yAxes: IAxis[] = [];

    if (isScatterPlot(type) || isBubbleChart(type)) {
        const hasSecondaryMeasure = !dv.def().isBucketEmpty(BucketNames.SECONDARY_MEASURES);

        if (hasSecondaryMeasure) {
            if (noPrimaryMeasures) {
                yAxes = [
                    {
                        ...firstMeasureGroupItem,
                    },
                ];
            } else {
                yAxes = [
                    {
                        ...secondMeasureGroupItem,
                    },
                ];
            }
        } else {
            yAxes = [{ label: "" }];
        }
    } else if (isHeatmap(type)) {
        yAxes = [
            {
                label: stackByAttribute ? stackByAttribute.formOf.name : "",
            },
        ];
    } else if (
        isOneOfTypes(type, supportedDualAxesChartTypes) &&
        !isEmpty(measureGroupItems) &&
        !isEmpty(secondaryAxisMeasures)
    ) {
        const { measuresInFirstAxis, measuresInSecondAxis }: IMeasuresInAxes = assignMeasuresToAxes(
            secondaryAxisMeasures,
            measureGroup,
        );

        let firstAxis: IAxis = createYAxisItem(measuresInFirstAxis, false);
        let secondAxis: IAxis = createYAxisItem(measuresInSecondAxis, true);

        if (firstAxis) {
            firstAxis = {
                ...firstAxis,
                seriesIndices: measuresInFirstAxis.map(({ index }: any) => index),
            };
        }
        if (secondAxis) {
            secondAxis = {
                ...secondAxis,
                seriesIndices: measuresInSecondAxis.map(({ index }: any) => index),
            };
        }

        yAxes = compact([firstAxis, secondAxis]);
    } else {
        // if more than one measure and NOT dual, then have empty item name
        const nonDualMeasureAxis = hasMoreThanOneMeasure
            ? {
                  label: "",
              }
            : {};
        yAxes = [
            {
                ...firstMeasureGroupItem,
                ...nonDualMeasureAxis,
                seriesIndices: range(measureGroupItems.length),
            },
        ];
    }

    return yAxes;
}

interface IMeasureInAxis {
    name: string;
    format: string;
    index: number;
}
interface IMeasuresInAxes {
    measuresInFirstAxis: IMeasureInAxis[];
    measuresInSecondAxis: IMeasureInAxis[];
}

function assignMeasuresToAxes(
    secondMeasures: string[],
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
): IMeasuresInAxes {
    return measureGroup.items.reduce(
        (
            result: any,
            { measureHeaderItem: { name, format, localIdentifier } }: IMeasureDescriptor,
            index,
        ) => {
            if (includes(secondMeasures, localIdentifier)) {
                result.measuresInSecondAxis.push({ name, format, index });
            } else {
                result.measuresInFirstAxis.push({ name, format, index });
            }
            return result;
        },
        {
            measuresInFirstAxis: [],
            measuresInSecondAxis: [],
        },
    );
}

function createYAxisItem(measuresInAxis: any[], opposite = false) {
    const length = measuresInAxis.length;
    if (length) {
        const { name, format } = measuresInAxis[0];
        return {
            label: length === 1 ? name : "",
            format,
            opposite,
        };
    }
    return null;
}

export function assignYAxes(series: ISeriesItem[], yAxes: IAxis[]): ISeriesItem[] {
    return series.reduce((result, item, index) => {
        const yAxisIndex = findIndex(yAxes, (axis: IAxis) => {
            return includes(axis.seriesIndices ?? [], index);
        });
        // for case viewBy and stackBy have one attribute, and one measure is sliced to multiple series
        // then 'yAxis' in other series should follow the first one
        const firstYAxisIndex = result.length > 0 ? result[0].yAxis : 0;
        const seriesItem = {
            ...item,
            yAxis: yAxisIndex !== -1 ? yAxisIndex : firstYAxisIndex,
        };

        result.push(seriesItem);
        return result;
    }, []);
}
