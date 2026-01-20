// (C) 2025-2026 GoodData Corporation

import {
    type IAttributeDescriptor,
    type IAttributeOrMeasure,
    type IMeasureDescriptor,
    type IResultHeader,
    type Identifier,
    type ObjRef,
    attributeDisplayFormRef,
    attributeLocalId,
    isAttribute,
    isIdentifierRef,
    isResultAttributeHeader,
    measureItem,
    measureLocalId,
    resultHeaderName,
} from "@gooddata/sdk-model";
import { BucketNames, type DataViewFacade } from "@gooddata/sdk-ui";

import { dataValueAsFloat, parseCoordinate } from "../../../map/style/dataTransformation.js";
import { type IGeoLngLat } from "../../../types/common/coordinates.js";
import { type IAvailableLegends, type IGeoLegendItem } from "../../../types/common/legends.js";
import {
    type IGeoAttributeItem,
    type IGeoMeasureItem,
    type IGeoSegmentItem,
} from "../../../types/geoData/common.js";
import { type IPushpinGeoData, type IPushpinLocationItem } from "../../../types/geoData/pushpin.js";
import { type JsonValue } from "../../../utils/guards.js";
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

interface IPushpinGeoDataBuckets {
    location?: IPushpinLocationItem;
    latitude?: IPushpinLocationItem;
    longitude?: IPushpinLocationItem;
    size?: IGeoMeasureItem;
    color?: IGeoMeasureItem;
    segment?: IGeoSegmentItem;
    tooltipText?: IGeoAttributeItem;
}

type BucketInfos = { [localId: string]: IBucketItemInfo | null };

type BucketItemInfo = {
    [key in keyof IPushpinGeoDataBuckets]?: {
        index: number;
        name: string;
        data?: string[] | number[] | IGeoLngLat[];
        format?: string;
        uris?: string[];
    };
};

/**
 * Gets attribute header items from data view for geo data
 *
 * @internal
 */
function getGeoAttributeHeaderItems(dv: DataViewFacade, geoData: BucketItemInfo): IResultHeader[][] {
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
        if (bucket.localIdentifier) {
            result[bucket.localIdentifier] = getBucketItemInfo(bucket.items[0]);
        }
        return result;
    }, {});

    const result: BucketItemInfo = {};

    // Process attribute buckets
    [BucketNames.LATITUDE, BucketNames.LONGITUDE, BucketNames.SEGMENT, BucketNames.TOOLTIP_TEXT].forEach(
        (bucketName): void => {
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
        },
    );

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
 * Context for bucket processing functions
 */
interface IBucketProcessingContext {
    dv: DataViewFacade;
    bucketInfo: BucketItemInfo;
    attributeHeaderItems: IResultHeader[][];
    emptyHeaderString: string;
    nullHeaderString: string;
}

/**
 * Processes latitude/longitude buckets (two attribute mode)
 */
function processLatLongBuckets(ctx: IBucketProcessingContext): IPushpinLocationItem | undefined {
    const { bucketInfo, attributeHeaderItems, emptyHeaderString, nullHeaderString } = ctx;
    const latitudeIndex = bucketInfo.latitude?.index;
    const longitudeIndex = bucketInfo.longitude?.index;
    const hasSeparateLatLong = latitudeIndex !== undefined && longitudeIndex !== undefined;

    const latitudeBucket = bucketInfo[BucketNames.LATITUDE];
    if (!hasSeparateLatLong || !latitudeBucket) {
        return undefined;
    }

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

    const parsedCoordinates = latitudeData
        .map((value, index) => {
            const lat = parseCoordinate(value);
            const lng = parseCoordinate(longitudeData[index]);
            if (lat === null || lng === null) {
                return null;
            }
            return { lat, lng };
        })
        .filter((coord): coord is IGeoLngLat => coord !== null);

    return {
        index: latitudeBucket.index,
        name: latitudeBucket.name,
        data: parsedCoordinates,
    };
}

/**
 * Processes segment bucket
 */
function processSegmentBucket(ctx: IBucketProcessingContext): IGeoSegmentItem | undefined {
    const { bucketInfo, attributeHeaderItems, nullHeaderString } = ctx;
    const segmentIndex = bucketInfo.segment?.index;
    const segmentBucket = bucketInfo[BucketNames.SEGMENT];

    if (segmentIndex === undefined || !segmentBucket) {
        return undefined;
    }

    const { data, uris } = getSegmentDataAndUris(attributeHeaderItems, segmentIndex, nullHeaderString);

    return {
        index: segmentBucket.index,
        name: segmentBucket.name,
        data,
        uris,
    };
}

/**
 * Processes tooltip text bucket
 */
function processTooltipTextBucket(ctx: IBucketProcessingContext): IGeoAttributeItem | undefined {
    const { bucketInfo, attributeHeaderItems, emptyHeaderString, nullHeaderString } = ctx;
    const tooltipTextIndex = bucketInfo.tooltipText?.index;
    const tooltipTextBucket = bucketInfo[BucketNames.TOOLTIP_TEXT];

    if (tooltipTextIndex === undefined || !tooltipTextBucket) {
        return undefined;
    }

    const data = getAttributeData(
        attributeHeaderItems,
        tooltipTextIndex,
        emptyHeaderString,
        nullHeaderString,
    );
    return {
        index: tooltipTextBucket.index,
        name: tooltipTextBucket.name,
        data,
    };
}

/**
 * Processes size measure bucket
 */
function processSizeBucket(ctx: IBucketProcessingContext): IGeoMeasureItem | undefined {
    const { dv, bucketInfo } = ctx;
    const sizeIndex = bucketInfo.size?.index;
    const sizeBucket = bucketInfo[BucketNames.SIZE];

    if (sizeIndex === undefined || !sizeBucket) {
        return undefined;
    }

    return {
        index: sizeBucket.index,
        name: sizeBucket.name,
        data: getMeasureData(dv, sizeIndex),
        format: getFormatFromExecutionResponse(dv, sizeIndex),
    };
}

/**
 * Processes color measure bucket
 */
function processColorBucket(ctx: IBucketProcessingContext): IGeoMeasureItem | undefined {
    const { dv, bucketInfo } = ctx;
    const colorIndex = bucketInfo.color?.index;
    const colorBucket = bucketInfo[BucketNames.COLOR];

    if (colorIndex === undefined || !colorBucket) {
        return undefined;
    }

    return {
        index: colorBucket.index,
        name: colorBucket.name,
        data: getMeasureData(dv, colorIndex),
        format: getFormatFromExecutionResponse(dv, colorIndex),
    };
}

/**
 * Transforms data view into pushpin geo data structure
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
export function transformPushpinData(
    dv: DataViewFacade,
    emptyHeaderString: string,
    nullHeaderString: string,
): IPushpinGeoData {
    const bucketInfo = getBucketItemNameAndDataIndex(dv);
    const attributeHeaderItems = getGeoAttributeHeaderItems(dv, bucketInfo);

    const ctx: IBucketProcessingContext = {
        dv,
        bucketInfo,
        attributeHeaderItems,
        emptyHeaderString,
        nullHeaderString,
    };

    const result: IPushpinGeoData = {};

    // Process location (latitude/longitude mode only)
    const location = processLatLongBuckets(ctx);
    if (location) {
        result.location = location;
    }

    const segment = processSegmentBucket(ctx);
    if (segment) {
        result.segment = segment;
    }

    const tooltipText = processTooltipTextBucket(ctx);
    if (tooltipText) {
        result.tooltipText = tooltipText;
    }

    const size = processSizeBucket(ctx);
    if (size) {
        result.size = size;
    }

    const color = processColorBucket(ctx);
    if (color) {
        result.color = color;
    }

    return result;
}

/**
 * Determines which legends should be available based on pushpin data
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
export function getPushpinAvailableLegends(
    categoryItems: IGeoLegendItem[],
    geoData: IPushpinGeoData,
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
 * Type guard for GeoJSON properties
 */
function isGeoJsonProperties(value: unknown): value is GeoJSON.GeoJsonProperties {
    return value === null || (typeof value === "object" && value !== null);
}

/**
 * Parses a GeoJSON property item from JSON string
 */
function parseGeoPropertyItem(item: JsonValue, propertyName: string): GeoJSON.GeoJsonProperties {
    if (item === null || item === undefined) {
        return {};
    }

    if (typeof item === "string") {
        try {
            const parsed: unknown = JSON.parse(item);
            if (isGeoJsonProperties(parsed)) {
                return parsed;
            }
            console.warn(`[GeoChartNext] Parsed tooltip property "${propertyName}" is not an object.`);
            return {};
        } catch {
            console.warn(`[GeoChartNext] Failed to parse tooltip property "${propertyName}".`);
            return {};
        }
    }

    if (isGeoJsonProperties(item)) {
        return item;
    }

    return {};
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
export function parsePushpinGeoProperties(properties: GeoJSON.GeoJsonProperties): GeoJSON.GeoJsonProperties {
    const rawProperties =
        properties && typeof properties === "object"
            ? (properties as Record<string, JsonValue>)
            : ({} as Record<string, JsonValue>);
    const tooltipKeys = ["locationName", "color", "size", "segment", "tooltipText"] as const;
    const parsedProperties: Record<string, GeoJSON.GeoJsonProperties> = {};
    for (const key of tooltipKeys) {
        const item = rawProperties[key] ?? "{}";
        parsedProperties[key] = parseGeoPropertyItem(item, key);
    }
    return parsedProperties;
}

/**
 * Attribute information with header items
 */
export type IPushpinAttributeInfo = IAttributeDescriptor["attributeHeader"] & {
    items: IResultHeader[];
};

/**
 * Geo attributes in dimension
 */
export interface IPushpinAttributesInDimension {
    locationAttribute: IPushpinAttributeInfo;
    segmentByAttribute: IPushpinAttributeInfo | undefined;
    tooltipTextAttribute: IPushpinAttributeInfo | undefined;
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
export function findPushpinAttributesInDimension(
    dv: DataViewFacade,
    geoData: IPushpinGeoData,
): IPushpinAttributesInDimension {
    const { color, location, segment, size, tooltipText } = geoData;
    const locationIndex = location?.index ?? 0;
    const headers = dv.meta().allHeaders();

    const hasMeasure = size || color;
    const attrDimensionIndex = hasMeasure ? 1 : 0;
    const attributeDescriptors: IAttributeDescriptor[] = dv.meta().attributeDescriptors();
    const attributeResultHeaderItems: IResultHeader[][] = headers[attrDimensionIndex];

    const locationAttribute: IPushpinAttributeInfo = {
        ...attributeDescriptors[locationIndex].attributeHeader,
        items: attributeResultHeaderItems[locationIndex],
    };

    const segmentByAttribute: IPushpinAttributeInfo | undefined = segment?.data.length
        ? {
              ...attributeDescriptors[segment.index].attributeHeader,
              items: attributeResultHeaderItems[segment.index],
          }
        : undefined;

    const tooltipTextAttribute: IPushpinAttributeInfo | undefined = tooltipText?.data.length
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
