// (C) 2020-2023 GoodData Corporation
import {
    IAvailableLegends,
    IGeoData,
    IGeoLngLat,
    IGeoLocationItem,
    IGeoMeasureItem,
    IGeoSegmentItem,
    IGeoAttributeItem,
} from "../../../../GeoChart.js";
import { BucketNames, DataViewFacade } from "@gooddata/sdk-ui";
import {
    dataValueAsFloat,
    getFormatFromExecutionResponse,
    getGeoAttributeHeaderItems,
    getMinMax,
} from "./common.js";
import {
    attributeDisplayFormRef,
    attributeLocalId,
    IAttributeOrMeasure,
    Identifier,
    isAttribute,
    isIdentifierRef,
    measureItem,
    measureLocalId,
    ObjRef,
    IMeasureDescriptor,
    IAttributeDescriptor,
    IResultHeader,
    isResultAttributeHeader,
    resultHeaderName,
} from "@gooddata/sdk-model";
import { IPushpinCategoryLegendItem } from "@gooddata/sdk-ui-vis-commons";
import findIndex from "lodash/findIndex.js";

interface IBucketItemInfo {
    uri?: Identifier;
    identifier?: Identifier;
    localIdentifier: Identifier;
}

interface ISegmentData {
    uris: string[];
    data: string[];
}

export function getLocation(latlng: string | null): IGeoLngLat | null {
    if (!latlng) {
        return null;
    }

    const [latitude, longitude] = latlng.split(";").map(dataValueAsFloat);
    if (isNaN(latitude) || isNaN(longitude)) {
        console.warn("UI-SDK: geoChartDataSource - getLocation: invalid location", latlng);
        return null;
    }

    return {
        lat: latitude,
        lng: longitude,
    };
}

export function parseCoordinate(coordinate: string | null): number | null {
    if (!coordinate) {
        return null;
    }

    const numericalCoordinate = dataValueAsFloat(coordinate);
    if (isNaN(numericalCoordinate)) {
        // eslint-disable-next-line no-console
        console.warn(
            "UI-SDK: geoChartDataSource - getLocation: invalid latitude/longitude coordinate",
            numericalCoordinate,
        );
        return null;
    }

    return numericalCoordinate;
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

    if (locationIndex !== undefined) {
        const locationData = getAttributeData(
            attributeHeaderItems,
            locationIndex,
            emptyHeaderString,
            nullHeaderString,
        );
        geoData[BucketNames.LOCATION]!.data = locationData.map(getLocation) as IGeoLngLat[];
    }

    if (latitudeIndex !== undefined && longitudeIndex != undefined) {
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

    if (segmentIndex !== undefined) {
        const { data, uris } = getSegmentDataAndUris(attributeHeaderItems, segmentIndex, nullHeaderString);
        geoData[BucketNames.SEGMENT]!.data = data;
        geoData[BucketNames.SEGMENT]!.uris = uris;
    }

    if (tooltipTextIndex !== undefined) {
        geoData[BucketNames.TOOLTIP_TEXT]!.data = getAttributeData(
            attributeHeaderItems,
            tooltipTextIndex,
            emptyHeaderString,
            nullHeaderString,
        );
    }

    if (sizeIndex !== undefined) {
        geoData[BucketNames.SIZE]!.data = getMeasureData(dv, sizeIndex);
        geoData[BucketNames.SIZE]!.format = getFormatFromExecutionResponse(dv, sizeIndex);
    }

    if (colorIndex !== undefined) {
        geoData[BucketNames.COLOR]!.data = getMeasureData(dv, colorIndex);
        geoData[BucketNames.COLOR]!.format = getFormatFromExecutionResponse(dv, colorIndex);
    }

    return geoData as IGeoData;
}

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

function getMeasureData(dv: DataViewFacade, dataIndex: number): number[] {
    const twoDimData = dv.rawData().twoDimData();

    const measureValues = twoDimData[dataIndex];
    return measureValues.map(dataValueAsFloat);
}

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

function getBucketItemNameAndDataIndex(dv: DataViewFacade): BucketItemInfo {
    const buckets = dv.def().buckets();
    const measureDescriptors = dv.meta().measureDescriptors();
    const attributeDescriptors = dv.meta().attributeDescriptors();

    const bucketItemInfos = buckets.reduce((result: BucketInfos, bucket) => {
        result[bucket.localIdentifier!] = getBucketItemInfo(bucket.items[0]);
        return result;
    }, {});

    // init data
    const result: BucketItemInfo = {};

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
        const index = findIndex(
            attributeDescriptors,
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

    [BucketNames.SIZE, BucketNames.COLOR].forEach((bucketName): void => {
        const bucketItemInfo = bucketItemInfos[bucketName];
        if (!bucketItemInfo) {
            return;
        }
        const index = findIndex(
            measureDescriptors,
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

function getUriAndIdentifier(ref: ObjRef) {
    if (isIdentifierRef(ref)) {
        return {
            identifier: ref.identifier,
        };
    } else {
        return {
            uri: ref.uri,
        };
    }
}

function getBucketItemInfo(bucketItem: IAttributeOrMeasure): IBucketItemInfo | null {
    if (!bucketItem) {
        return null;
    }

    // attribute item
    if (isAttribute(bucketItem)) {
        const localIdentifier = attributeLocalId(bucketItem);
        const displayFormRef = attributeDisplayFormRef(bucketItem);

        return {
            localIdentifier,
            ...getUriAndIdentifier(displayFormRef),
        };
    }

    // measure item
    const localIdentifier = measureLocalId(bucketItem);
    const measureItemRef = measureItem(bucketItem);

    if (measureItemRef) {
        return {
            localIdentifier,
            ...getUriAndIdentifier(measureItemRef),
        };
    }

    // non-simple-measures land here
    return {
        localIdentifier,
    };
}

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

function parseGeoPropertyItem(item: string): GeoJSON.GeoJsonProperties {
    try {
        return JSON.parse(item);
    } catch (e) {
        return {};
    }
}

export function parseGeoProperties(properties: GeoJSON.GeoJsonProperties): GeoJSON.GeoJsonProperties {
    const { locationName = "{}", color = "{}", size = "{}", segment = "{}" } = properties || {};
    return {
        locationName: parseGeoPropertyItem(locationName),
        size: parseGeoPropertyItem(size),
        color: parseGeoPropertyItem(color),
        segment: parseGeoPropertyItem(segment),
    };
}

export type AttributeInfo = IAttributeDescriptor["attributeHeader"] & {
    items: IResultHeader[];
};
export interface IGeoAttributesInDimension {
    locationAttribute: AttributeInfo;
    segmentByAttribute: AttributeInfo | undefined;
    tooltipTextAttribute: AttributeInfo | undefined;
}

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
