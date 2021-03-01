// (C) 2007-2021 GoodData Corporation
import {
    IAttributeDescriptor,
    IDataView,
    IMeasureDescriptor,
    IResultAttributeHeader,
    ITotalDescriptor,
} from "@gooddata/sdk-backend-spi";
import {
    ChartElementType,
    ChartType,
    HeadlineElementType,
    HeadlineType,
    TableElementType,
    TableType,
    VisElementType,
    VisType,
    XirrType,
} from "./visualizationTypes";
import isEmpty from "lodash/isEmpty";

/**
 * @public
 */
export interface IDrillableItemUri {
    uri: string;
}

/**
 * @public
 */
export interface IDrillableItemIdentifier {
    identifier: string;
}

/**
 * @public
 */
export type IDrillableItem =
    | IDrillableItemUri
    | IDrillableItemIdentifier
    | (IDrillableItemUri & IDrillableItemIdentifier);

/**
 * @public
 */
export function isDrillableItemUri(item: unknown): item is IDrillableItemUri {
    return (item as IDrillableItemUri).uri !== undefined;
}

/**
 * @public
 */
export function isDrillableItemIdentifier(item: unknown): item is IDrillableItemIdentifier {
    return (item as IDrillableItemIdentifier).identifier !== undefined;
}

/**
 * @public
 */
export type IDrillEventCallback = (event: IDrillEvent) => void | boolean;

/**
 * @public
 */
export interface IDrillIntersectionAttributeItem extends IAttributeDescriptor, IResultAttributeHeader {}

/**
 * @public
 */
export function isDrillIntersectionAttributeItem(
    header: DrillEventIntersectionElementHeader,
): header is IDrillIntersectionAttributeItem {
    return !isEmpty(header) && (header as IDrillIntersectionAttributeItem).attributeHeaderItem !== undefined;
}

/**
 * @public
 */
export type DrillEventIntersectionElementHeader =
    | IAttributeDescriptor
    | IMeasureDescriptor
    | ITotalDescriptor
    | IDrillIntersectionAttributeItem;

/**
 * @public
 */
export interface IDrillEventIntersectionElement {
    header: DrillEventIntersectionElementHeader;
}

/**
 * Drill context for table
 *
 * @public
 */
export interface IDrillEventContextTable {
    type: TableType;
    element: TableElementType;
    columnIndex: number;
    rowIndex: number;
    row: any[];
    intersection: IDrillEventIntersectionElement[];
}

/**
 * Drill context for headline
 *
 * @public
 */
export interface IDrillEventContextHeadline {
    type: HeadlineType;
    element: HeadlineElementType;
    value: string;
    intersection: IDrillEventIntersectionElement[];
}

/**
 * Drill context for XIRR
 *
 * @public
 */
export interface IDrillEventContextXirr {
    type: XirrType;
    element: HeadlineElementType; // XIRR uses Headline internally, so its drill context is the same as that of Headline
    value: string;
    intersection: IDrillEventIntersectionElement[];
}

/**
 * Drill context for pointy-charts
 *
 * @public
 */
export interface IDrillEventContextPoint {
    type: ChartType;
    element: ChartElementType;
    elementChartType?: ChartType;
    x?: number;
    y?: number;
    z?: number;
    value?: string;
    intersection: IDrillEventIntersectionElement[];
}

/**
 * Drill context for headline
 *
 * @public
 */
export interface IDrillPoint {
    x: number;
    y: number;
    intersection: IDrillEventIntersectionElement[];
    type?: ChartType;
}

/**
 * Drill context for chart element group (multiple series + click on axis value) where
 * every point has own intersection.
 *
 * @public
 */
export interface IDrillEventContextGroup {
    type: ChartType;
    element: ChartElementType;
    points: IDrillPoint[];
}

/**
 * Drill context for all visualization type.
 * @public
 */
export interface IDrillEventContext {
    type: VisType; // type of visualization
    element: VisElementType; // type of visualization element drilled
    x?: number; // chart x coordinate (if supported)
    y?: number; // chart y coordinate (if supported)
    z?: number; // chart z coordinate (if supported)
    columnIndex?: number;
    rowIndex?: number;
    row?: any[]; // table row data of the drilled row
    value?: string; // cell or element value drilled

    // some drill headers that are relevant for current drill element
    intersection?: IDrillEventIntersectionElement[];
    // A collection of chart series points (if available)
    points?: IDrillPoint[];
}

/**
 * @public
 */
export interface IDrillEvent {
    dataView: IDataView;
    drillContext: IDrillEventContext;
}

/**
 * @public
 */
export interface IHighchartsParentTick {
    leaves: number;
    startAt: number;
    label: any;
}

/**
 * @public
 */
export interface IHighchartsCategoriesTree {
    tick: IHighchartsParentTick;
}

/**
 * @public
 */
export type OnFiredDrillEvent = IDrillEventCallback;

/**
 * @public
 */
export interface IDrillConfig {
    dataView: IDataView;
    onDrill: OnFiredDrillEvent;
}
