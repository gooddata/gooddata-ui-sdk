// (C) 2020-2025 GoodData Corporation

import isEmpty from "lodash/isEmpty.js";

import {
    DataValue,
    IBucket,
    IMeasureGroupDescriptor,
    ITheme,
    Identifier,
    bucketIsEmpty,
} from "@gooddata/sdk-model";
import { BucketNames, DataViewFacade } from "@gooddata/sdk-ui";
import { ChartFillConfig, IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { IPointData, ISeriesItemConfig } from "../../typings/unsafe.js";
import { MAX_POINT_WIDTH } from "../_chartCreators/commonConfiguration.js";
import {
    getChartFillProperties,
    getColorOrPatternFillIndex,
    isSolidFill,
} from "../_chartOptions/patternFillOptions.js";
import { parseValue, unwrap } from "../_util/common.js";

const SUPPORTED_MEASURE_BUCKETS: ReadonlyArray<Identifier> = [
    BucketNames.MEASURES,
    BucketNames.SECONDARY_MEASURES,
    BucketNames.TERTIARY_MEASURES,
];

const PRIMARY_VS_COMPARATIVE_MEASURE_HEIGHT_RATIO = 0.75;

const isComparativeMeasurePresent = (bucketLocalIdentifiers: Identifier[]) =>
    bucketLocalIdentifiers.includes(BucketNames.TERTIARY_MEASURES);

const isTargetMeasurePresent = (bucketLocalIdentifiers: Identifier[]) =>
    bucketLocalIdentifiers.includes(BucketNames.SECONDARY_MEASURES);

const getValue = (
    value: number,
    isTarget: boolean,
): {
    y: number;
    target?: number;
} =>
    isTarget
        ? {
              target: value === null ? 0 : value,
              y: 0,
          }
        : {
              y: value,
          };

const getSeriesItemData = (
    seriesItem: string[],
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    seriesIndex: number,
    measureBucketsLocalIdentifiers: Identifier[],
): IPointData =>
    seriesItem.map((pointValue: string) => {
        const value = parseValue(pointValue);
        const isTarget = isTargetSeries(seriesIndex, measureBucketsLocalIdentifiers);
        const nullValueProps =
            isTarget && value === null ? { isNullTarget: true, className: "hidden-empty-series" } : {};

        return {
            ...nullValueProps,
            ...getValue(value, isTarget),
            format: unwrap(measureGroup.items[seriesIndex]).format,
            marker: {
                enabled: pointValue !== null,
            },
            name: unwrap(measureGroup.items[seriesIndex]).name,
        };
    });

const getPrimarySeriesMaxPointWidth = (onlyPrimaryMeasure: boolean) => {
    if (!onlyPrimaryMeasure) {
        return MAX_POINT_WIDTH * PRIMARY_VS_COMPARATIVE_MEASURE_HEIGHT_RATIO;
    }
    return MAX_POINT_WIDTH;
};

const getPrimarySeries = (seriesItemConfig: IPointData, onlyPrimaryMeasure: boolean) => ({
    ...seriesItemConfig,
    pointPadding: onlyPrimaryMeasure ? 0.1 : 0.2,
    maxPointWidth: getPrimarySeriesMaxPointWidth(onlyPrimaryMeasure),
    zIndex: 1,
    bulletChartMeasureType: "primary",
});

const getTargetSeries = (seriesItemConfig: IPointData, chartFill: ChartFillConfig | undefined) => {
    const { color, borderColor, ...rest } = seriesItemConfig;
    const colorProperties = isSolidFill(chartFill) ? { color } : { color: borderColor };
    return {
        ...rest,
        ...colorProperties,
        borderColor: undefined,
        type: "bullet",
        pointPadding: 0,
        targetOptions: {
            width: "100%",
        },
        zIndex: 2,
        bulletChartMeasureType: "target",
    };
};

const getComparativeSeries = (seriesItemConfig: IPointData) => ({
    ...seriesItemConfig,
    pointPadding: 0,
    zIndex: 0,
    bulletChartMeasureType: "comparative",
});

export const isPrimarySeries = (seriesIndex: number, bucketsLocalIdentifiers: Identifier[]): boolean =>
    seriesIndex === bucketsLocalIdentifiers.indexOf(BucketNames.MEASURES);

export const isTargetSeries = (seriesIndex: number, bucketsLocalIdentifiers: Identifier[]): boolean =>
    seriesIndex === bucketsLocalIdentifiers.indexOf(BucketNames.SECONDARY_MEASURES);

export const isComparativeSeries = (seriesIndex: number, bucketsLocalIdentifiers: Identifier[]): boolean =>
    seriesIndex === bucketsLocalIdentifiers.indexOf(BucketNames.TERTIARY_MEASURES);

const getSeries = (
    seriesIndex: number,
    seriesItemConfig: IPointData,
    measureBucketsLocalIdentifiers: Identifier[],
    chartFill: ChartFillConfig | undefined,
) => {
    if (isTargetSeries(seriesIndex, measureBucketsLocalIdentifiers)) {
        return getTargetSeries(seriesItemConfig, chartFill);
    } else if (isComparativeSeries(seriesIndex, measureBucketsLocalIdentifiers)) {
        return getComparativeSeries(seriesItemConfig);
    }

    const onlyPrimaryMeasure =
        !isComparativeMeasurePresent(measureBucketsLocalIdentifiers) &&
        !isTargetMeasurePresent(measureBucketsLocalIdentifiers);
    return getPrimarySeries(seriesItemConfig, onlyPrimaryMeasure);
};

export function getBulletChartSeries(
    dv: DataViewFacade,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    colorStrategy: IColorStrategy,
    chartFill: ChartFillConfig | undefined,
    theme: ITheme | undefined,
) {
    const occupiedMeasureBucketsLocalIdentifiers = getOccupiedMeasureBucketsLocalIdentifiers(dv);
    const executionResultData = dv.rawData().twoDimData();

    return executionResultData.map((seriesItem: string[], seriesIndex: number) => {
        const seriesItemData = getSeriesItemData(
            seriesItem,
            measureGroup,
            seriesIndex,
            occupiedMeasureBucketsLocalIdentifiers,
        );

        const color = colorStrategy.getColorByIndex(seriesIndex);
        const colorOrPatternIndex = getColorOrPatternFillIndex(
            chartFill,
            measureGroup,
            seriesIndex,
            seriesIndex,
        );
        const colorProperties = getChartFillProperties(theme, chartFill, color, colorOrPatternIndex, false);

        const seriesItemConfig: ISeriesItemConfig = {
            legendIndex: seriesIndex,
            data: seriesItemData,
            name: measureGroup.items[seriesIndex].measureHeaderItem.name,
            ...colorProperties,
            seriesIndex,
            ...(isSolidFill(chartFill) ? {} : { borderWidth: 1 }),
        };

        return getSeries(seriesIndex, seriesItemConfig, occupiedMeasureBucketsLocalIdentifiers, chartFill);
    });
}

export function getOccupiedMeasureBucketsLocalIdentifiers(dv: DataViewFacade): Identifier[] {
    const buckets: IBucket[] = dv.def().buckets();
    const executionResultData: DataValue[][] = dv.rawData().twoDimData();

    const availableMeasureBucketsLocalIdentifiers = SUPPORTED_MEASURE_BUCKETS;
    const notEmptyMeasureBucketsLocalIdentifiers = buckets
        .filter(
            (b) =>
                !bucketIsEmpty(b) && availableMeasureBucketsLocalIdentifiers.indexOf(b.localIdentifier) >= 0,
        )
        .map((b) => b.localIdentifier);

    return isEmpty(notEmptyMeasureBucketsLocalIdentifiers)
        ? availableMeasureBucketsLocalIdentifiers.slice(0, executionResultData.length)
        : notEmptyMeasureBucketsLocalIdentifiers;
}
