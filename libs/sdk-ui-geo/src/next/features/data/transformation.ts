// (C) 2025 GoodData Corporation

import {
    DataValue,
    IAttributeDescriptor,
    IAttributeOrMeasure,
    IMeasureDescriptor,
    IResultHeader,
    Identifier,
    ObjRef,
    attributeDisplayFormRef,
    attributeLocalId,
    isAttribute,
    isIdentifierRef,
    isResultAttributeHeader,
    measureItem,
    measureLocalId,
    resultHeaderName,
} from "@gooddata/sdk-model";
import { BucketNames, DataViewFacade } from "@gooddata/sdk-ui";
import { IPushpinCategoryLegendItem } from "@gooddata/sdk-ui-vis-commons";

import {
    IAvailableLegends,
    IGeoAttributeItem,
    IGeoData,
    IGeoLngLat,
    IGeoLocationItem,
    IGeoMeasureItem,
    IGeoSegmentItem,
} from "../../types/shared.js";
import { getMinMax } from "../size/calculations.js";

/**
 * Data transformation functions for GeoPushpinChartNext
 *
 * @internal
 */

interface IBucketItemInfo {
    uri?: Identifier;
    identifier?: Identifier;
    localIdentifier: Identifier;
}

interface ISegmentData {
    uris: string[];
    data: string[];
}

interface IGeoDataBuckets {
    location?: IGeoLocationItem;
    latitude?: IGeoLocationItem;
    longitude?: IGeoLocationItem;
    size?: IGeoMeasureItem;
    color?: IGeoMeasureItem;
    segment?: IGeoSegmentItem;
    tooltipText?: IGeoAttributeItem;
}

type BucketInfos = { [localId: string]: IBucketItemInfo | null };

type BucketItemInfo = {
    [key in keyof IGeoDataBuckets]: {
        index: number;
        name: string;
        data?: string[] | number[] | IGeoLngLat[];
        format?: string;
        uris?: string[];
    };
};

/**
 * Converts a data value to a float
 *
 * @param value - Data value from execution result
 * @returns Parsed float value, or NaN if parsing fails
 *
 * @internal
 */
export function dataValueAsFloat(value: DataValue): number {
    if (value === null) {
        return NaN;
    }

    const parsedNumber = typeof value === "string" ? parseFloat(value) : value;

    if (isNaN(parsedNumber)) {
        console.warn(`SDK: dataValueAsFloat: ${value} is not a number`);
    }
    return parsedNumber;
}

/**
 * Parses a location string in "lat;lng" format into coordinates
 *
 * @param latlng - Location string in "latitude;longitude" format
 * @returns Coordinate object or null if invalid
 *
 * @internal
 */
export function getLocation(latlng: string | null): IGeoLngLat | null {
    if (!latlng) {
        return null;
    }

    const [latitude, longitude] = latlng.split(";").map(dataValueAsFloat);
    if (isNaN(latitude) || isNaN(longitude)) {
        console.warn("GeoPushpinChartNext: Invalid location format", latlng);
        return null;
    }

    return {
        lat: latitude,
        lng: longitude,
    };
}

/**
 * Parses a coordinate string into a number
 *
 * @param coordinate - Coordinate string
 * @returns Parsed number or null if invalid
 *
 * @internal
 */
export function parseCoordinate(coordinate: string | null): number | null {
    if (!coordinate) {
        return null;
    }

    const numericalCoordinate = dataValueAsFloat(coordinate);
    if (isNaN(numericalCoordinate)) {
        console.warn("GeoPushpinChartNext: Invalid coordinate", coordinate);
        return null;
    }

    return numericalCoordinate;
}

/**
 * Gets attribute header items from data view for geo data
 *
 * @internal
 */
function getGeoAttributeHeaderItems(dv: DataViewFacade, geoData: IGeoData): IResultHeader[][] {
    const { color, size } = geoData;
    const hasColorMeasure = color !== undefined;
    const hasSizeMeasure = size !== undefined;
    const attrHeaderItemIndex = hasColorMeasure || hasSizeMeasure ? 1 : 0;
    return dv.meta().allHeaders()[attrHeaderItemIndex];
}

/**
 * Gets format string from execution response for a measure
 *
 * @internal
 */
function getFormatFromExecutionResponse(dv: DataViewFacade, indexMeasure: number): string {
    const measureDescriptors = dv.meta().measureDescriptors();
    return measureDescriptors[indexMeasure].measureHeaderItem.format;
}

/**
 * Extracts segment data and URIs from attribute header items
 */
function getSegmentDataAndUris(
    attributeHeaderItems: IResultHeader[][],
    dataIndex: number,
    nullHeaderString: string,
): ISegmentData {
    const headerItems = attributeHeaderItems[dataIndex];
    return headerItems.reduce<ISegmentData>(
        (result: ISegmentData, headerItem: IResultHeader): ISegmentData => {
            if (headerItem && isResultAttributeHeader(headerItem)) {
                const { uri, name } = headerItem.attributeHeaderItem;
                return { uris: [...result.uris, uri], data: [...result.data, name ?? nullHeaderString] };
            }
            return result;
        },
        { uris: [], data: [] },
    );
}

/**
 * Extracts measure data from data view
 */
function getMeasureData(dv: DataViewFacade, dataIndex: number): number[] {
    const twoDimData = dv.rawData().twoDimData();
    const measureValues = twoDimData[dataIndex];
    return measureValues.map(dataValueAsFloat);
}

/**
 * Extracts attribute data from attribute header items
 */
function getAttributeData(
    attributeHeaderItems: IResultHeader[][],
    dataIndex: number,
    emptyHeaderString: string,
    nullHeaderString: string,
): string[] {
    const headerItems = attributeHeaderItems[dataIndex];
    return headerItems.map((i) => {
        const name = resultHeaderName(i);
        if (name) {
            return name;
        }
        return name === "" ? emptyHeaderString : nullHeaderString;
    });
}

/**
 * Gets URI and identifier from object reference
 */
function getUriAndIdentifier(ref: ObjRef) {
    if (isIdentifierRef(ref)) {
        return { identifier: ref.identifier };
    } else {
        return { uri: ref.uri };
    }
}

/**
 * Extracts bucket item information
 */
function getBucketItemInfo(bucketItem: IAttributeOrMeasure): IBucketItemInfo | null {
    if (!bucketItem) {
        return null;
    }

    // Attribute item
    if (isAttribute(bucketItem)) {
        const localIdentifier = attributeLocalId(bucketItem);
        const displayFormRef = attributeDisplayFormRef(bucketItem);
        return {
            localIdentifier,
            ...getUriAndIdentifier(displayFormRef),
        };
    }

    // Measure item
    const localIdentifier = measureLocalId(bucketItem);
    const measureItemRef = measureItem(bucketItem);

    if (measureItemRef) {
        return {
            localIdentifier,
            ...getUriAndIdentifier(measureItemRef),
        };
    }

    // Non-simple-measures land here
    return { localIdentifier };
}

/**
 * Gets bucket item names and data indices from data view
 */
function getBucketItemNameAndDataIndex(dv: DataViewFacade): BucketItemInfo {
    const buckets = dv.def().buckets();
    const measureDescriptors = dv.meta().measureDescriptors();
    const attributeDescriptors = dv.meta().attributeDescriptors();

    const bucketItemInfos = buckets.reduce((result: BucketInfos, bucket) => {
        result[bucket.localIdentifier!] = getBucketItemInfo(bucket.items[0]);
        return result;
    }, {});

    const result: BucketItemInfo = {};

    // Process attribute buckets
    [
        BucketNames.LOCATION,
        BucketNames.LATITUDE,
        BucketNames.LONGITUDE,
        BucketNames.SEGMENT,
        BucketNames.TOOLTIP_TEXT,
    ].forEach((bucketName): void => {
        const bucketItemInfo = bucketItemInfos[bucketName];
        if (!bucketItemInfo) {
            return;
        }
        const index = attributeDescriptors.findIndex(
            (desc: IAttributeDescriptor): boolean =>
                desc.attributeHeader.localIdentifier === bucketItemInfo.localIdentifier &&
                (desc.attributeHeader.uri === bucketItemInfo.uri ||
                    desc.attributeHeader.identifier === bucketItemInfo.identifier),
        );

        if (index !== -1) {
            const {
                formOf: { name },
            } = attributeDescriptors[index].attributeHeader;
            result[bucketName] = { index, name };
        }
    });

    // Process measure buckets
    [BucketNames.SIZE, BucketNames.COLOR].forEach((bucketName): void => {
        const bucketItemInfo = bucketItemInfos[bucketName];
        if (!bucketItemInfo) {
            return;
        }
        const index = measureDescriptors.findIndex(
            (desc: IMeasureDescriptor): boolean =>
                desc.measureHeaderItem.localIdentifier === bucketItemInfo.localIdentifier &&
                (desc.measureHeaderItem.uri === bucketItemInfo.uri ||
                    desc.measureHeaderItem.identifier === bucketItemInfo.identifier),
        );
        if (index !== -1) {
            result[bucketName] = {
                index,
                name: measureDescriptors[index].measureHeaderItem.name,
            };
        }
    });

    return result;
}

/**
 * Transforms data view into geo data structure
 *
 * @remarks
 * This is the main data transformation function that extracts and structures
 * all geo-related data from the execution result
 *
 * @param dv - Data view facade
 * @param emptyHeaderString - String to use for empty headers
 * @param nullHeaderString - String to use for null headers
 * @returns Structured geo data
 *
 * @internal
 */
export function getGeoData(
    dv: DataViewFacade,
    emptyHeaderString: string,
    nullHeaderString: string,
): IGeoData {
    const geoData = getBucketItemNameAndDataIndex(dv);
    const attributeHeaderItems = getGeoAttributeHeaderItems(dv, geoData as IGeoData);

    const locationIndex = geoData.location?.index;
    const latitudeIndex = geoData.latitude?.index;
    const longitudeIndex = geoData.longitude?.index;
    const segmentIndex = geoData?.segment?.index;
    const tooltipTextIndex = geoData?.tooltipText?.index;
    const sizeIndex = geoData?.size?.index;
    const colorIndex = geoData?.color?.index;

    // Process location data (single attribute mode)
    if (locationIndex !== undefined) {
        const locationData = getAttributeData(
            attributeHeaderItems,
            locationIndex,
            emptyHeaderString,
            nullHeaderString,
        );
        geoData[BucketNames.LOCATION]!.data = locationData.map(getLocation) as IGeoLngLat[];
    }

    // Process latitude/longitude data (two attribute mode)
    if (latitudeIndex !== undefined && longitudeIndex !== undefined) {
        const latitudeData = getAttributeData(
            attributeHeaderItems,
            latitudeIndex,
            emptyHeaderString,
            nullHeaderString,
        );
        const longitudeData = getAttributeData(
            attributeHeaderItems,
            longitudeIndex,
            emptyHeaderString,
            nullHeaderString,
        );

        geoData[BucketNames.LOCATION] = {
            ...geoData[BucketNames.LATITUDE]!,
            data: latitudeData.map((value, index) => ({
                lat: parseCoordinate(value),
                lng: parseCoordinate(longitudeData[index]),
            })) as IGeoLngLat[],
        };
    }

    // Process segment data
    if (segmentIndex !== undefined) {
        const { data, uris } = getSegmentDataAndUris(attributeHeaderItems, segmentIndex, nullHeaderString);
        geoData[BucketNames.SEGMENT]!.data = data;
        geoData[BucketNames.SEGMENT]!.uris = uris;
    }

    // Process tooltip text data
    if (tooltipTextIndex !== undefined) {
        geoData[BucketNames.TOOLTIP_TEXT]!.data = getAttributeData(
            attributeHeaderItems,
            tooltipTextIndex,
            emptyHeaderString,
            nullHeaderString,
        );
    }

    // Process size measure data
    if (sizeIndex !== undefined) {
        geoData[BucketNames.SIZE]!.data = getMeasureData(dv, sizeIndex);
        geoData[BucketNames.SIZE]!.format = getFormatFromExecutionResponse(dv, sizeIndex);
    }

    // Process color measure data
    if (colorIndex !== undefined) {
        geoData[BucketNames.COLOR]!.data = getMeasureData(dv, colorIndex);
        geoData[BucketNames.COLOR]!.format = getFormatFromExecutionResponse(dv, colorIndex);
    }

    return geoData as IGeoData;
}

/**
 * Determines which legends should be available based on data
 *
 * @remarks
 * Analyzes geo data to determine which legend types are applicable:
 * - Category legend: When segments exist
 * - Color legend: When color measure exists with varying values
 * - Size legend: When size measure exists with varying values
 *
 * @param categoryItems - Category legend items
 * @param geoData - Geo data structure
 * @returns Object indicating which legends are available
 *
 * @internal
 */
export function getAvailableLegends(
    categoryItems: IPushpinCategoryLegendItem[],
    geoData: IGeoData,
): IAvailableLegends {
    const { color: { data: colorData = [] } = {}, size: { data: sizeData = [] } = {} } = geoData;

    const { min: minColor, max: maxColor } = getMinMax(colorData);
    const { min: minSize, max: maxSize } = getMinMax(sizeData);

    const hasCategoryLegend = Boolean(categoryItems?.length);
    const hasColorLegend = Boolean(colorData.length) && minColor !== maxColor && !hasCategoryLegend;
    const hasSizeLegend = Boolean(sizeData.length) && minSize !== maxSize;

    return {
        hasCategoryLegend,
        hasColorLegend,
        hasSizeLegend,
    };
}

/**
 * Parses a GeoJSON property item from JSON string
 */
function parseGeoPropertyItem(item: string): GeoJSON.GeoJsonProperties {
    try {
        return JSON.parse(item);
    } catch {
        return {};
    }
}

/**
 * Parses GeoJSON properties from feature
 *
 * @remarks
 * Extracts and parses location, color, size, and segment properties from GeoJSON feature
 *
 * @param properties - GeoJSON properties object
 * @returns Parsed properties object
 *
 * @internal
 */
export function parseGeoProperties(properties: GeoJSON.GeoJsonProperties): GeoJSON.GeoJsonProperties {
    const { locationName = "{}", color = "{}", size = "{}", segment = "{}" } = properties || {};
    return {
        locationName: parseGeoPropertyItem(locationName),
        size: parseGeoPropertyItem(size),
        color: parseGeoPropertyItem(color),
        segment: parseGeoPropertyItem(segment),
    };
}

/**
 * Attribute information with header items
 */
export type AttributeInfo = IAttributeDescriptor["attributeHeader"] & {
    items: IResultHeader[];
};

/**
 * Geo attributes in dimension
 */
export interface IGeoAttributesInDimension {
    locationAttribute: AttributeInfo;
    segmentByAttribute: AttributeInfo | undefined;
    tooltipTextAttribute: AttributeInfo | undefined;
}

/**
 * Finds geo attributes in the data view dimension
 *
 * @param dv - Data view facade
 * @param geoData - Geo data structure
 * @returns Geo attributes information
 *
 * @internal
 */
export function findGeoAttributesInDimension(
    dv: DataViewFacade,
    geoData: IGeoData,
): IGeoAttributesInDimension {
    const { color, location, segment, size, tooltipText } = geoData;
    const locationIndex = location?.index ?? 0;
    const headers = dv.meta().allHeaders();

    const hasMeasure = size || color;
    const attrDimensionIndex = hasMeasure ? 1 : 0;
    const attributeDescriptors: IAttributeDescriptor[] = dv.meta().attributeDescriptors();
    const attributeResultHeaderItems: IResultHeader[][] = headers[attrDimensionIndex];

    const locationAttribute: AttributeInfo = {
        ...attributeDescriptors[locationIndex].attributeHeader,
        items: attributeResultHeaderItems[locationIndex],
    };

    const segmentByAttribute: AttributeInfo | undefined = segment?.data.length
        ? {
              ...attributeDescriptors[segment.index].attributeHeader,
              items: attributeResultHeaderItems[segment.index],
          }
        : undefined;

    const tooltipTextAttribute: AttributeInfo | undefined = tooltipText?.data.length
        ? {
              ...attributeDescriptors[tooltipText.index].attributeHeader,
              items: attributeResultHeaderItems[tooltipText.index],
          }
        : undefined;

    return {
        locationAttribute,
        segmentByAttribute,
        tooltipTextAttribute,
    };
}
