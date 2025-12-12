// (C) 2025 GoodData Corporation

import {
    type IAttributeDescriptor,
    type IBucket,
    type IMeasureDescriptor,
    type IResultHeader,
    attributeLocalId,
    isAttribute,
    isMeasure,
    isResultAttributeHeader,
    measureLocalId,
    resultHeaderName,
} from "@gooddata/sdk-model";
import { BucketNames, type DataViewFacade } from "@gooddata/sdk-ui";

import { dataValueAsFloat } from "../../../map/style/dataTransformation.js";
import { type IAvailableLegends, type IGeoLegendItem } from "../../../types/common/legends.js";
import { type IAreaGeoData, type IGeoAreaItem } from "../../../types/geoData/area.js";
import {
    type IGeoAttributeItem,
    type IGeoMeasureItem,
    type IGeoSegmentItem,
} from "../../../types/geoData/common.js";
import { getMinMax } from "../../pushpin/size/calculations.js";

interface ISegmentData {
    uris: string[];
    data: string[];
}

interface IAreaDataBuckets {
    area?: IGeoAreaItem;
    color?: IGeoMeasureItem;
    segment?: IGeoSegmentItem;
    tooltipText?: IGeoAttributeItem;
}

type BucketItemInfo = {
    [key in keyof IAreaDataBuckets]?: {
        index: number;
        name: string;
        data?: string[] | number[];
        format?: string;
        uris?: string[];
    };
};

/**
 * Gets attribute header items from data view for area data
 *
 * @internal
 */
function getAreaAttributeHeaderItems(dv: DataViewFacade, bucketInfo: BucketItemInfo): IResultHeader[][] {
    const { color } = bucketInfo;
    const hasColorMeasure = color !== undefined;
    const attrHeaderItemIndex = hasColorMeasure ? 1 : 0;
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
 * Extracts area data and URIs from attribute header items
 */
function getAreaDataAndUris(
    attributeHeaderItems: IResultHeader[][],
    dataIndex: number,
    emptyHeaderString: string,
    nullHeaderString: string,
): ISegmentData {
    const headerItems = attributeHeaderItems[dataIndex];
    return headerItems.reduce<ISegmentData>(
        (result: ISegmentData, headerItem: IResultHeader): ISegmentData => {
            if (headerItem && isResultAttributeHeader(headerItem)) {
                const { uri, name } = headerItem.attributeHeaderItem;
                const displayName = name ?? nullHeaderString;
                const finalName = name === "" ? emptyHeaderString : displayName;
                return { uris: [...result.uris, uri], data: [...result.data, finalName] };
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
 * Gets bucket item names and data indices from data view for area
 */
function getBucketItemNameAndDataIndex(dv: DataViewFacade): BucketItemInfo {
    const attributeDescriptors = dv.meta().attributeDescriptors();
    const measureDescriptors = dv.meta().measureDescriptors();
    const buckets = dv.def().buckets();

    const result: BucketItemInfo = {};

    const areaInfo =
        getAttributeBucketInfo(buckets, attributeDescriptors, BucketNames.AREA) ??
        getAttributeBucketInfo(buckets, attributeDescriptors, BucketNames.LOCATION);
    if (areaInfo) {
        result.area = areaInfo;
    }

    const segmentInfo = getAttributeBucketInfo(buckets, attributeDescriptors, BucketNames.SEGMENT);
    if (segmentInfo) {
        result[BucketNames.SEGMENT] = segmentInfo;
    }

    const tooltipInfo = getAttributeBucketInfo(buckets, attributeDescriptors, BucketNames.TOOLTIP_TEXT);
    if (tooltipInfo) {
        result[BucketNames.TOOLTIP_TEXT] = tooltipInfo;
    }

    const colorInfo = getMeasureBucketInfo(buckets, measureDescriptors, BucketNames.COLOR);
    if (colorInfo) {
        result[BucketNames.COLOR] = colorInfo;
    }

    return result;
}

function getAttributeBucketInfo(
    buckets: IBucket[],
    attributeDescriptors: IAttributeDescriptor[],
    bucketName: string,
): { index: number; name: string } | undefined {
    const bucket = buckets.find((item) => item.localIdentifier === bucketName);
    if (!bucket) {
        return undefined;
    }

    const attributeItem = bucket.items.find(isAttribute);
    if (!attributeItem) {
        return undefined;
    }

    const localIdentifier = attributeLocalId(attributeItem);
    const index = attributeDescriptors.findIndex(
        (descriptor) => descriptor.attributeHeader.localIdentifier === localIdentifier,
    );

    if (index === -1) {
        return undefined;
    }

    return {
        index,
        name: attributeDescriptors[index].attributeHeader.formOf.name,
    };
}

function getMeasureBucketInfo(
    buckets: IBucket[],
    measureDescriptors: IMeasureDescriptor[],
    bucketName: string,
): { index: number; name: string } | undefined {
    const bucket = buckets.find((item) => item.localIdentifier === bucketName);
    if (!bucket) {
        return undefined;
    }

    const measureItem = bucket.items.find(isMeasure);
    if (!measureItem) {
        return undefined;
    }

    const localIdentifier = measureLocalId(measureItem);
    const index = measureDescriptors.findIndex(
        (descriptor) => descriptor.measureHeaderItem.localIdentifier === localIdentifier,
    );

    if (index === -1) {
        return undefined;
    }

    return {
        index,
        name: measureDescriptors[index].measureHeaderItem.name,
    };
}

/**
 * Context for area bucket processing functions
 */
interface IAreaBucketProcessingContext {
    dv: DataViewFacade;
    bucketInfo: BucketItemInfo;
    attributeHeaderItems: IResultHeader[][];
    emptyHeaderString: string;
    nullHeaderString: string;
}

/**
 * Processes area bucket
 */
function processAreaBucket(ctx: IAreaBucketProcessingContext): IGeoAreaItem | undefined {
    const { bucketInfo, attributeHeaderItems, emptyHeaderString, nullHeaderString } = ctx;
    const areaIndex = bucketInfo.area?.index;
    const areaBucket = bucketInfo.area;

    if (areaIndex === undefined || !areaBucket) {
        return undefined;
    }

    const { data, uris } = getAreaDataAndUris(
        attributeHeaderItems,
        areaIndex,
        emptyHeaderString,
        nullHeaderString,
    );

    return {
        index: areaBucket.index,
        name: areaBucket.name,
        data,
        uris,
    };
}

/**
 * Processes segment bucket
 */
function processSegmentBucket(ctx: IAreaBucketProcessingContext): IGeoSegmentItem | undefined {
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
function processTooltipTextBucket(ctx: IAreaBucketProcessingContext): IGeoAttributeItem | undefined {
    const { bucketInfo, attributeHeaderItems, emptyHeaderString, nullHeaderString } = ctx;
    const tooltipTextIndex = bucketInfo.tooltipText?.index;
    const tooltipTextBucket = bucketInfo[BucketNames.TOOLTIP_TEXT];

    if (tooltipTextIndex === undefined || !tooltipTextBucket) {
        return undefined;
    }

    return {
        index: tooltipTextBucket.index,
        name: tooltipTextBucket.name,
        data: getAttributeData(attributeHeaderItems, tooltipTextIndex, emptyHeaderString, nullHeaderString),
    };
}

/**
 * Processes color measure bucket
 */
function processColorBucket(ctx: IAreaBucketProcessingContext): IGeoMeasureItem | undefined {
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
 * Transforms execution result to area geo data.
 *
 * @internal
 */
export function transformAreaData(
    dv: DataViewFacade,
    emptyHeaderString: string,
    nullHeaderString: string,
): IAreaGeoData {
    const bucketInfo = getBucketItemNameAndDataIndex(dv);
    const attributeHeaderItems = getAreaAttributeHeaderItems(dv, bucketInfo);

    const ctx: IAreaBucketProcessingContext = {
        dv,
        bucketInfo,
        attributeHeaderItems,
        emptyHeaderString,
        nullHeaderString,
    };

    const result: IAreaGeoData = {};

    const area = processAreaBucket(ctx);
    if (area) {
        result.area = area;
    }

    const segment = processSegmentBucket(ctx);
    if (segment) {
        result.segment = segment;
    }

    const tooltipText = processTooltipTextBucket(ctx);
    if (tooltipText) {
        result.tooltipText = tooltipText;
    }

    const color = processColorBucket(ctx);
    if (color) {
        result.color = color;
    }

    return result;
}

/**
 * Derives which legends are available for the area layer.
 *
 * @internal
 */
export function getAreaAvailableLegends(
    categoryItems: IGeoLegendItem[],
    geoData: IAreaGeoData,
): IAvailableLegends {
    const { color: { data: colorData = [] } = {} } = geoData;

    const { min: minColor, max: maxColor } = getMinMax(colorData);

    const hasCategoryLegend = Boolean(categoryItems?.length);
    const hasColorLegend = Boolean(colorData.length) && minColor !== maxColor && !hasCategoryLegend;
    return {
        hasCategoryLegend,
        hasColorLegend,
    };
}

/**
 * Attribute information with header items
 */
export type IAreaAttributeInfo = IAttributeDescriptor["attributeHeader"] & {
    items: IResultHeader[];
};

/**
 * Area attributes in dimension
 */
export interface IAreaAttributesInDimension {
    areaAttribute: IAreaAttributeInfo;
    segmentByAttribute: IAreaAttributeInfo | undefined;
    tooltipTextAttribute: IAreaAttributeInfo | undefined;
}

/**
 * Finds area attributes in the data view dimension
 *
 * @param dv - Data view facade
 * @param geoData - Area geo data structure
 * @returns Area attributes information
 *
 * @internal
 */
export function findAreaAttributesInDimension(
    dv: DataViewFacade,
    geoData: IAreaGeoData,
): IAreaAttributesInDimension {
    const { color, area, segment, tooltipText } = geoData;
    const areaIndex = area?.index ?? 0;
    const headers = dv.meta().allHeaders();

    const hasMeasure = color !== undefined;
    const attrDimensionIndex = hasMeasure ? 1 : 0;
    const attributeDescriptors: IAttributeDescriptor[] = dv.meta().attributeDescriptors();
    const attributeResultHeaderItems: IResultHeader[][] = headers[attrDimensionIndex];

    const areaAttribute: IAreaAttributeInfo = {
        ...attributeDescriptors[areaIndex].attributeHeader,
        items: attributeResultHeaderItems[areaIndex],
    };

    const segmentByAttribute: IAreaAttributeInfo | undefined = segment?.data.length
        ? {
              ...attributeDescriptors[segment.index].attributeHeader,
              items: attributeResultHeaderItems[segment.index],
          }
        : undefined;

    const tooltipTextAttribute: IAreaAttributeInfo | undefined = tooltipText?.data.length
        ? {
              ...attributeDescriptors[tooltipText.index].attributeHeader,
              items: attributeResultHeaderItems[tooltipText.index],
          }
        : undefined;

    return {
        areaAttribute,
        segmentByAttribute,
        tooltipTextAttribute,
    };
}
