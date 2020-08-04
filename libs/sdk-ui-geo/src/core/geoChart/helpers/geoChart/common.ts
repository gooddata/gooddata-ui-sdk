// (C) 2019-2020 GoodData Corporation
import { BucketNames, DataViewFacade, IColorAssignment } from "@gooddata/sdk-ui";
import { IGeoData, IGeoPointsConfig } from "../../../../GeoChart";
import { bucketIsEmpty, bucketsFind, IAttribute, IBucket } from "@gooddata/sdk-model";
import { DataValue, IResultHeader } from "@gooddata/sdk-backend-spi";
import isEqual from "lodash/isEqual";

export function getGeoAttributeHeaderItems(dv: DataViewFacade, geoData: IGeoData): IResultHeader[][] {
    const { color, size } = geoData;

    const hasColorMeasure = color !== undefined;
    const hasSizeMeasure = size !== undefined;
    const attrHeaderItemIndex = hasColorMeasure || hasSizeMeasure ? 1 : 0;
    const attributeHeaderItems = dv.meta().allHeaders()[attrHeaderItemIndex];

    return attributeHeaderItems;
}

export function isDataOfReasonableSize(dv: DataViewFacade, geoData: IGeoData, limit: number): boolean {
    const { location } = geoData;

    const attributeHeaderItems = getGeoAttributeHeaderItems(dv, geoData);
    const locationData = location !== undefined ? attributeHeaderItems[location.index] : [];

    return locationData.length <= limit;
}

export function isLocationMissing(buckets: IBucket[]): boolean {
    const locationBucket = bucketsFind(buckets, BucketNames.LOCATION);

    return !locationBucket || bucketIsEmpty(locationBucket);
}

export function calculateAverage(values: number[] = []): number {
    if (!values.length) {
        return 0;
    }
    return values.reduce((a: number, b: number): number => a + b, 0) / values.length;
}

export function getFormatFromExecutionResponse(dv: DataViewFacade, indexMeasure: number): string {
    const measureDescriptors = dv.meta().measureDescriptors();

    return measureDescriptors[indexMeasure].measureHeaderItem.format;
}

// show clusters when there is location attribute only
export function isClusteringAllowed(geoData: IGeoData, groupNearbyPoints: boolean = true): boolean {
    const { color, location, segment, size } = geoData;

    return Boolean(groupNearbyPoints && location && !(color || segment || size));
}
export function isPointsConfigChanged(
    prevPointsConfig: IGeoPointsConfig | undefined,
    pointsConfig: IGeoPointsConfig | undefined,
): boolean {
    return !isEqual(prevPointsConfig, pointsConfig);
}

export interface IMinMax {
    min?: number;
    max?: number;
}

/**
 * Get min/max values in number array and ignore NaN values
 * @param data
 */
export function getMinMax(data: number[]): IMinMax {
    return data.reduce(
        (result: IMinMax, value: number): IMinMax => {
            if (!isFinite(value)) {
                return result;
            }
            const min = result.min && isFinite(result.min) ? Math.min(value, result.min) : value;
            const max = result.max && isFinite(result.max) ? Math.max(value, result.max) : value;
            return {
                min,
                max,
            };
        },
        {
            min: undefined,
            max: undefined,
        },
    );
}

export function dataValueAsFloat(value: DataValue): number {
    if (value === null) {
        return NaN;
    }

    const parsedNumber = typeof value === "string" ? parseFloat(value) : value;

    if (isNaN(parsedNumber)) {
        // eslint-disable-next-line no-console
        console.warn(`SDK: utils - stringToFloat: ${value} is not a number`);
    }
    return parsedNumber;
}

export function isFluidLegendEnabled(responsive: boolean, showFluidLegend: boolean): boolean {
    return responsive && showFluidLegend;
}

export function isColorAssignmentItemChanged(
    prevColorAssigment: IColorAssignment[],
    colorAssigment: IColorAssignment[],
): boolean {
    return !isEqual(prevColorAssigment, colorAssigment);
}

export function isTooltipTextValueString(tooltipText: IAttribute | string): tooltipText is string {
    return typeof tooltipText === "string";
}
